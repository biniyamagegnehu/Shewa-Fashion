import 'server-only'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { User, Session } from '@prisma/client'

// ============================================================
// Session Configuration & Policies
// ============================================================
export const SESSION_COOKIE_NAME = 'shewa_admin_session'

// Idle timeout: 30 minutes of inactivity
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000

// Absolute lifetime: 7 days regardless of activity
export const ABSOLUTE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000

// Throttle lastActiveAt database writes: only write if >= 2 minutes have passed
export const ACTIVITY_UPDATE_THROTTLE_MS = 2 * 60 * 1000

export interface SessionValidationResult {
  session: Session
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

/**
 * Generate a cryptographically secure, unpredictable session token.
 * 32 bytes (256 bits) of system entropy formatted as URL-safe base64.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Hash a raw session token using SHA-256 for persistent database storage.
 * Only the hash is ever stored in PostgreSQL; the raw token is never persisted.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Set the session cookie on the outgoing response.
 */
export async function setSessionCookie(rawToken: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies()
  const maxAgeSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))

  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  })
}

/**
 * Clear the session cookie on the outgoing response.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  })
}

/**
 * Create a new opaque server-side session in PostgreSQL and set the cookie.
 * Rotates the session: if an existing session cookie is present, it is revoked.
 */
export async function createAdminSession(userId: string): Promise<{ rawToken: string; session: Session }> {
  // 1. Session rotation: revoke any existing session token before creating a new one
  try {
    const cookieStore = await cookies()
    const existingRawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (existingRawToken) {
      const existingHash = hashSessionToken(existingRawToken)
      await prisma.session.updateMany({
        where: { tokenHash: existingHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    }
  } catch {
    // Non-blocking if previous token cleanup encounters an issue
  }

  // 2. Generate unpredictable opaque token
  const rawToken = generateSessionToken()
  const tokenHash = hashSessionToken(rawToken)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + ABSOLUTE_LIFETIME_MS)

  // 3. Store session in PostgreSQL
  const session = await prisma.session.create({
    data: {
      tokenHash,
      userId,
      createdAt: now,
      lastActiveAt: now,
      expiresAt,
    },
  })

  // 4. Send raw token strictly via HttpOnly cookie
  await setSessionCookie(rawToken, expiresAt)

  return { rawToken, session }
}

/**
 * Validate a raw session token against the database.
 * Enforces:
 * - Session existence
 * - Revocation status (`revokedAt === null`)
 * - Absolute lifetime (7 days)
 * - Idle timeout (30 minutes)
 * - Active ADMIN user existence in database
 *
 * Updates `lastActiveAt` with a 2-minute write throttle to prevent database overload.
 */
export async function validateAdminSession(rawToken: string): Promise<SessionValidationResult | null> {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.length < 16) {
    return null
  }

  const tokenHash = hashSessionToken(rawToken)

  try {
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!session || !session.user) {
      return null
    }

    // Reject explicitly revoked sessions
    if (session.revokedAt !== null) {
      return null
    }

    const now = Date.now()

    // 1. Enforce Absolute Lifetime (7 days)
    if (now > session.expiresAt.getTime()) {
      return null
    }

    // 2. Enforce Idle Timeout (30 minutes of inactivity)
    const timeSinceLastActive = now - session.lastActiveAt.getTime()
    if (timeSinceLastActive > IDLE_TIMEOUT_MS) {
      return null
    }

    // 3. Enforce Administrator role
    if (session.user.role !== 'ADMIN') {
      return null
    }

    // 4. Safely update lastActiveAt if more than ACTIVITY_UPDATE_THROTTLE_MS has elapsed
    if (timeSinceLastActive > ACTIVITY_UPDATE_THROTTLE_MS) {
      try {
        await prisma.session.update({
          where: { id: session.id },
          data: { lastActiveAt: new Date(now) },
        })
      } catch (err) {
        // Non-fatal: if concurrent update happened, continue safely
        console.warn('Failed to update session lastActiveAt:', err)
      }
    }

    return {
      session,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    }
  } catch (error) {
    console.error('Error validating admin session in database:', error)
    return null
  }
}

/**
 * Read the current session cookie and validate against PostgreSQL.
 */
export async function getAdminSession(): Promise<SessionValidationResult | null> {
  try {
    const cookieStore = await cookies()
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!rawToken) {
      return null
    }

    return await validateAdminSession(rawToken)
  } catch {
    return null
  }
}

/**
 * Revoke the current admin session in PostgreSQL and clear the cookie.
 */
export async function deleteAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (rawToken) {
      const tokenHash = hashSessionToken(rawToken)
      await prisma.session.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    }
  } catch (error) {
    console.error('Error revoking admin session in database:', error)
  } finally {
    await clearSessionCookie()
  }
}
