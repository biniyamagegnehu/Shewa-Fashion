import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/session'

/**
 * Optimistic proxy-level route protection for /admin routes.
 *
 * NOTE: This proxy provides fast edge/server redirection for unauthenticated
 * requests lacking a session cookie. Full authorization, idle timeout, and
 * database role verification are strictly enforced on the server in Server
 * Components, Server Actions, and data access layers.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // Check for presence of an opaque session token
  const hasSessionToken = Boolean(sessionCookie && sessionCookie.length >= 16)

  // 1. Unauthenticated requests to /admin/* (excluding /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!hasSessionToken) {
      const loginUrl = new URL('/admin/login', request.url)
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('from', `${pathname}${search}`)
      }
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
