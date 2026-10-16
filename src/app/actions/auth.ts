'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createAdminSession, deleteAdminSession } from '@/lib/session'
import {
  checkLoginRateLimit,
  getClientIp,
  getSafeRedirectUrl,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
} from '@/lib/auth'

export interface LoginActionState {
  error?: string
  success?: boolean
}

// Pre-computed dummy hash to mitigate timing attacks when an email does not exist
const DUMMY_HASH = '$2b$12$uB3ZerMaqZl54TYu/0g53etB0MzreHYs7t/WLiDCWIP74IKBYhpQS'

/**
 * Server action to authenticate an administrator.
 */
export async function loginAction(
  _prevState: LoginActionState | undefined,
  formData: FormData
): Promise<LoginActionState> {
  const emailRaw = formData.get('email')
  const passwordRaw = formData.get('password')
  const redirectToRaw = formData.get('redirectTo')

  // Basic format and presence validation
  if (
    typeof emailRaw !== 'string' ||
    typeof passwordRaw !== 'string' ||
    !emailRaw.trim() ||
    !passwordRaw
  ) {
    return { error: 'Please enter both email and password.' }
  }

  const email = emailRaw.trim().toLowerCase()
  const password = passwordRaw

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email) || email.length > 255) {
    return { error: 'Invalid email or password.' }
  }

  // Rate limiting check per client IP
  const clientIp = await getClientIp()
  const rateLimit = checkLoginRateLimit(clientIp)
  if (!rateLimit.allowed) {
    return {
      error: `Too many failed login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
    }
  }

  let destination = '/admin'

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Compare against real hash or dummy hash to mitigate user enumeration timing
    const hashToCompare = user?.passwordHash || DUMMY_HASH
    const isPasswordValid = await bcrypt.compare(password, hashToCompare)

    // Verify user existence, password match, and ADMIN role
    if (!user || !isPasswordValid || user.role !== 'ADMIN') {
      recordFailedLoginAttempt(clientIp)
      return { error: 'Invalid email or password.' }
    }

    // Authentication succeeded: reset rate limit and create opaque session
    resetLoginRateLimit(clientIp)
    await createAdminSession(user.id)

    // Determine safe destination
    if (typeof redirectToRaw === 'string') {
      destination = getSafeRedirectUrl(redirectToRaw, '/admin')
    }
  } catch (error) {
    console.error('Login action error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }

  // Redirect to verified safe admin destination
  redirect(destination)
}

/**
 * Server action to log out an administrator.
 */
export async function logoutAction(): Promise<void> {
  await deleteAdminSession()
  redirect('/admin/login')
}
