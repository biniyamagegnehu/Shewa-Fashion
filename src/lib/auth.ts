import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'

export interface AuthenticatedAdmin {
  id: string
  name: string
  email: string
  role: string
}

// ============================================================
// In-Memory Login Rate Limiter
// ============================================================
// Limits brute-force login attempts per IP address.
// Note: In a multi-instance serverless environment, in-memory
// stores are local to each runtime instance. For this demo,
// it provides robust local protection without external dependencies.
// ============================================================

interface RateLimitRecord {
  attempts: number
  firstAttemptAt: number
  lockedUntil: number | null
}

const rateLimitMap = new Map<string, RateLimitRecord>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes lockout after max attempts

/**
 * Retrieve the client IP address from incoming headers.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    if (forwardedFor) {
      const firstIp = forwardedFor.split(',')[0].trim()
      if (firstIp) return firstIp
    }
    const realIp = headersList.get('x-real-ip')
    if (realIp) return realIp.trim()
  } catch {
    // If headers() is called in an environment where it's unavailable
  }
  return '127.0.0.1'
}

/**
 * Check if the given IP is currently rate-limited.
 */
export function checkLoginRateLimit(ip: string): {
  allowed: boolean
  remainingAttempts: number
  retryAfterSeconds: number
} {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record) {
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      retryAfterSeconds: 0,
    }
  }

  // If locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000)
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    }
  }

  // If window expired, reset
  if (now - record.firstAttemptAt > WINDOW_MS) {
    rateLimitMap.delete(ip)
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      retryAfterSeconds: 0,
    }
  }

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - record.attempts)
  return {
    allowed: remainingAttempts > 0,
    remainingAttempts,
    retryAfterSeconds: 0,
  }
}

/**
 * Record a failed login attempt for the given IP.
 */
export function recordFailedLoginAttempt(ip: string): void {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    rateLimitMap.set(ip, {
      attempts: 1,
      firstAttemptAt: now,
      lockedUntil: null,
    })
    return
  }

  const newAttempts = record.attempts + 1
  const lockedUntil = newAttempts >= MAX_ATTEMPTS ? now + LOCKOUT_MS : null

  rateLimitMap.set(ip, {
    attempts: newAttempts,
    firstAttemptAt: record.firstAttemptAt,
    lockedUntil,
  })
}

/**
 * Reset failed attempts upon successful login.
 */
export function resetLoginRateLimit(ip: string): void {
  rateLimitMap.delete(ip)
}

// ============================================================
// Server-Side Admin Session & Authorization
// ============================================================

/**
 * Verify that the current request has a valid session token AND
 * that the user exists in the database with the ADMIN role.
 *
 * Never trusts client or cookie claims alone.
 */
export async function verifyAdminSession(): Promise<AuthenticatedAdmin | null> {
  const session = await getAdminSession()
  if (!session || !session.userId) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    if (!user || user.role !== 'ADMIN') {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error('Error verifying admin session in database:', error)
    return null
  }
}

/**
 * Require an authenticated admin. Redirects to `/admin/login` if unauthenticated.
 */
export async function requireAdminSession(): Promise<AuthenticatedAdmin> {
  const admin = await verifyAdminSession()
  if (!admin) {
    redirect('/admin/login')
  }
  return admin
}
