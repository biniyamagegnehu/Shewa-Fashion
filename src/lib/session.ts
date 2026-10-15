import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export interface AdminSessionPayload {
  userId: string
  role: string
  expiresAt: number
}

const COOKIE_NAME = 'shewa_admin_session'
const SESSION_DURATION_HOURS = 8
const SESSION_DURATION_SECONDS = SESSION_DURATION_HOURS * 60 * 60

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET environment variable is missing in production.')
    }
    // Safe deterministic development secret (32+ chars)
    return new TextEncoder().encode('shewa-fashion-admin-development-secret-key-32bytes!')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Sign an admin JWT session token with HS256.
 */
export async function signSessionToken(payload: { userId: string; role: string }): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000
  const key = getSecretKey()

  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    expiresAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_HOURS}h`)
    .sign(key)
}

/**
 * Verify an admin session token and return the payload if valid.
 */
export async function verifySessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const key = getSecretKey()
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })

    if (!payload.userId || typeof payload.userId !== 'string') {
      return null
    }

    return {
      userId: payload.userId,
      role: (payload.role as string) || '',
      expiresAt: (payload.expiresAt as number) || 0,
    }
  } catch {
    return null
  }
}

/**
 * Create a new admin session cookie.
 */
export async function createAdminSession(userId: string, role: string): Promise<void> {
  const token = await signSessionToken({ userId, role })
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: SESSION_DURATION_SECONDS,
  })
}

/**
 * Read and verify the current admin session from incoming cookies.
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifySessionToken(token)
}

/**
 * Invalidate the admin session cookie.
 */
export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: 0,
    expires: new Date(0),
  })
}
