import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createAdminSession } from '@/lib/session'
import {
  checkLoginRateLimit,
  getClientIp,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
  verifyCsrfOrigin,
} from '@/lib/auth'
import { parseJsonBody, parseLoginInput } from '@/lib/validation'
import {
  apiBadRequest,
  apiForbidden,
  apiInternalError,
  apiRateLimited,
  apiSuccess,
  apiUnauthenticated,
  apiValidationError,
} from '@/lib/api-response'

const DUMMY_HASH = '$2b$12$uB3ZerMaqZl54TYu/0g53etB0MzreHYs7t/WLiDCWIP74IKBYhpQS'

/**
 * POST /api/auth/login
 * Authenticates an administrator and establishes a server-side session.
 */
export async function POST(request: NextRequest) {
  // 1. Verify CSRF Origin
  if (!verifyCsrfOrigin(request)) {
    return apiForbidden('Cross-site request forgery protection triggered.')
  }

  // 2. Rate Limiting Check
  const clientIp = await getClientIp()
  const rateLimit = checkLoginRateLimit(clientIp)
  if (!rateLimit.allowed) {
    return apiRateLimited(
      `Too many failed login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`
    )
  }

  // 3. Parse JSON Body
  const rawBody = await parseJsonBody(request)
  if (rawBody === null) {
    return apiBadRequest('Request body must be valid JSON.')
  }

  // 4. Validate Input Shape
  const parsed = parseLoginInput(rawBody)
  if (!parsed.ok) {
    return apiValidationError(parsed.errors)
  }

  const { email, password } = parsed.data

  try {
    // 5. Query user in database
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Compare with bcrypt using dummy hash to mitigate user enumeration timing
    const hashToCompare = user?.passwordHash || DUMMY_HASH
    const isPasswordValid = await bcrypt.compare(password, hashToCompare)

    // Verify existence, password match, and ADMIN role
    if (!user || !isPasswordValid || user.role !== 'ADMIN') {
      recordFailedLoginAttempt(clientIp)
      return apiUnauthenticated('Invalid email or password.')
    }

    // 6. Reset rate limit on success
    resetLoginRateLimit(clientIp)

    // 7. Establish opaque database session & set HttpOnly cookie
    await createAdminSession(user.id)

    // 8. Return standardized response envelope omitting sensitive fields
    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('API login error:', error)
    return apiInternalError('Authentication failed due to a server error.')
  }
}
