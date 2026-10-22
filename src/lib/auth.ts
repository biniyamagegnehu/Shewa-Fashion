import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/session'
import { apiForbidden, apiUnauthenticated } from '@/lib/api-response'

export interface AuthenticatedAdmin {
  id: string
  name: string
  email: string
  role: string
}

// ============================================================
// Safe Redirect Path Sanitization
// ============================================================

/**
 * Validate and sanitize a redirect URL to prevent open redirect vulnerabilities.
 * Only internal, relative paths starting with `/admin` are permitted.
 */
export function getSafeRedirectUrl(target?: string | null, fallback = '/admin'): string {
  if (!target || typeof target !== 'string') {
    return fallback
  }

  const trimmed = target.trim()

  // Must begin with /admin and not with // or /\ (protocol-relative attacks)
  if (!trimmed.startsWith('/admin') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback
  }

  // Reject backslashes and carriage returns/newlines
  if (trimmed.includes('\\') || trimmed.includes('\r') || trimmed.includes('\n')) {
    return fallback
  }

  // Ensure it cannot be parsed as an absolute external URL
  try {
    const parsed = new URL(trimmed, 'http://localhost')
    if (parsed.origin !== 'http://localhost' || !parsed.pathname.startsWith('/admin')) {
      return fallback
    }
  } catch {
    return fallback
  }

  return trimmed
}

// ============================================================
// CSRF Protection for API Route Handlers
// ============================================================

/**
 * Verify that the Origin or Referer matches the Host header on state-changing requests.
 * Standard defense against Cross-Site Request Forgery (CSRF).
 */
export function verifyCsrfOrigin(request: Request): boolean {
  // Safe HTTP methods do not modify state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(request.method)) {
    return true
  }

  const host = request.headers.get('host')
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  if (!host) {
    return false
  }

  // Check Origin header first if present
  if (origin) {
    try {
      const originUrl = new URL(origin)
      return originUrl.host === host
    } catch {
      return false
    }
  }

  // Fallback to Referer header if Origin is not supplied
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      return refererUrl.host === host
    } catch {
      return false
    }
  }

  // In production or when origin is missing on a state-changing POST/PUT/DELETE
  return process.env.NODE_ENV !== 'production'
}

// ============================================================
// In-Memory Login Rate Limiter
// ============================================================
// Enforces brute-force login attempt limits per IP address.
// Policy: 5 attempts per 15 minutes, with a 15-minute lockout.
// Note: In multi-instance serverless deployments without external
// cache, each instance maintains its own rate-limit memory.
// ============================================================

interface RateLimitRecord {
  attempts: number
  firstAttemptAt: number
  lockedUntil: number | null
}

const rateLimitMap = new Map<string, RateLimitRecord>()

export const MAX_LOGIN_ATTEMPTS = 5
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
export const RATE_LIMIT_LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Retrieve the client IP address from incoming request headers.
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
    // Graceful fallback if headers() is unavailable
  }
  return '127.0.0.1'
}

/**
 * Check if the given IP address is currently rate-limited.
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
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
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
  if (now - record.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.delete(ip)
    return {
      allowed: true,
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
      retryAfterSeconds: 0,
    }
  }

  const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - record.attempts)
  return {
    allowed: remainingAttempts > 0,
    remainingAttempts,
    retryAfterSeconds: 0,
  }
}

/**
 * Record a failed login attempt for the given IP address.
 */
export function recordFailedLoginAttempt(ip: string): void {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now - record.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, {
      attempts: 1,
      firstAttemptAt: now,
      lockedUntil: null,
    })
    return
  }

  const newAttempts = record.attempts + 1
  const lockedUntil = newAttempts >= MAX_LOGIN_ATTEMPTS ? now + RATE_LIMIT_LOCKOUT_MS : null

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
// Password Change Rate Limiter
// ============================================================
// Enforces brute-force defense against current password guessing.
// Policy: 5 attempts per 15 minutes, with a 15-minute lockout.
// ============================================================

const passwordChangeRateLimitMap = new Map<string, RateLimitRecord>()

export const MAX_PASSWORD_CHANGE_ATTEMPTS = 5
export const PASSWORD_CHANGE_LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes
export const PASSWORD_CHANGE_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Check if the given identifier (IP / userId) is rate-limited for password changes.
 */
export function checkPasswordChangeRateLimit(key: string): {
  allowed: boolean
  remainingAttempts: number
  retryAfterSeconds: number
} {
  const now = Date.now()
  const record = passwordChangeRateLimitMap.get(key)

  if (!record) {
    return {
      allowed: true,
      remainingAttempts: MAX_PASSWORD_CHANGE_ATTEMPTS,
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
  if (now - record.firstAttemptAt > PASSWORD_CHANGE_WINDOW_MS) {
    passwordChangeRateLimitMap.delete(key)
    return {
      allowed: true,
      remainingAttempts: MAX_PASSWORD_CHANGE_ATTEMPTS,
      retryAfterSeconds: 0,
    }
  }

  const remainingAttempts = Math.max(0, MAX_PASSWORD_CHANGE_ATTEMPTS - record.attempts)
  return {
    allowed: remainingAttempts > 0,
    remainingAttempts,
    retryAfterSeconds: 0,
  }
}

/**
 * Record a failed password change attempt.
 */
export function recordFailedPasswordChangeAttempt(key: string): void {
  const now = Date.now()
  const record = passwordChangeRateLimitMap.get(key)

  if (!record || now - record.firstAttemptAt > PASSWORD_CHANGE_WINDOW_MS) {
    passwordChangeRateLimitMap.set(key, {
      attempts: 1,
      firstAttemptAt: now,
      lockedUntil: null,
    })
    return
  }

  const newAttempts = record.attempts + 1
  const lockedUntil =
    newAttempts >= MAX_PASSWORD_CHANGE_ATTEMPTS ? now + PASSWORD_CHANGE_LOCKOUT_MS : null

  passwordChangeRateLimitMap.set(key, {
    attempts: newAttempts,
    firstAttemptAt: record.firstAttemptAt,
    lockedUntil,
  })
}

/**
 * Reset failed password change attempts upon success.
 */
export function resetPasswordChangeRateLimit(key: string): void {
  passwordChangeRateLimitMap.delete(key)
}

// ============================================================
// Server-Side Admin Session & Authorization Helpers
// ============================================================

/**
 * Verify that the current request has a valid, non-expired, non-revoked session
 * in PostgreSQL and that the user holds the ADMIN role.
 *
 * Never trusts client, cookie, or local JWT claims.
 */
export async function verifyAdminSession(): Promise<AuthenticatedAdmin | null> {
  const result = await getAdminSession()
  if (!result || !result.user || result.user.role !== 'ADMIN') {
    return null
  }

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role,
  }
}

/**
 * Require an authenticated admin for Server Components and Pages.
 * Redirects unauthenticated requests to `/admin/login`.
 */
export async function requireAdminSession(targetUrl?: string): Promise<AuthenticatedAdmin> {
  const admin = await verifyAdminSession()
  if (!admin) {
    const safeUrl = targetUrl ? getSafeRedirectUrl(targetUrl) : null
    const loginDestination = safeUrl && safeUrl !== '/admin'
      ? `/admin/login?from=${encodeURIComponent(safeUrl)}`
      : '/admin/login'

    redirect(loginDestination)
  }
  return admin
}

/**
 * Guard for protected API Route Handlers.
 * Returns the authenticated admin or a standardized JSON error response.
 */
export async function requireAdminApi(): Promise<
  | { ok: true; admin: AuthenticatedAdmin }
  | { ok: false; response: NextResponse }
> {
  const admin = await verifyAdminSession()
  if (!admin) {
    return {
      ok: false,
      response: apiUnauthenticated('Administrator authentication required.'),
    }
  }

  if (admin.role !== 'ADMIN') {
    return {
      ok: false,
      response: apiForbidden('Administrator privileges required.'),
    }
  }

  return { ok: true, admin }
}
