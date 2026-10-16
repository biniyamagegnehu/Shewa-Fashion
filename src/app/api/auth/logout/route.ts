import { NextRequest } from 'next/server'
import { deleteAdminSession } from '@/lib/session'
import { verifyCsrfOrigin } from '@/lib/auth'
import { apiForbidden, apiNoContent } from '@/lib/api-response'

/**
 * POST /api/auth/logout
 * Invalidates the administrator session in PostgreSQL and clears the session cookie.
 * Returns HTTP 204 No Content per specifications.
 */
export async function POST(request: NextRequest) {
  // CSRF protection for state-changing logout
  if (!verifyCsrfOrigin(request)) {
    return apiForbidden('Cross-site request forgery protection triggered.')
  }

  await deleteAdminSession()

  return apiNoContent()
}
