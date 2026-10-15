import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'shewa_admin_session'

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    return new TextEncoder().encode('shewa-fashion-admin-development-secret-key-32bytes!')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Optimistic proxy-level route protection for /admin routes.
 *
 * NOTE: This proxy provides fast edge/server redirection for unauthenticated
 * requests, but full authorization and database role verification are strictly
 * enforced on the server in Server Components, Server Actions, and data access layers.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value

  let isValidSession = false

  if (sessionCookie) {
    try {
      const key = getSecretKey()
      const { payload } = await jwtVerify(sessionCookie, key, {
        algorithms: ['HS256'],
      })
      if (payload.userId && payload.role === 'ADMIN') {
        isValidSession = true
      }
    } catch {
      isValidSession = false
    }
  }

  // 1. If trying to visit /admin/login while already holding a valid session token
  if (pathname === '/admin/login') {
    if (isValidSession) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // 2. If visiting any protected /admin route without a valid session token
  if (pathname.startsWith('/admin')) {
    if (!isValidSession) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
