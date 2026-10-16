import { NextRequest } from 'next/server'
import { verifyAdminSession } from '@/lib/auth'
import { apiSuccess, apiUnauthenticated } from '@/lib/api-response'

/**
 * GET /api/auth/me
 * Retrieves current authenticated administrator profile.
 * Returns 401 UNAUTHENTICATED if unauthenticated or session invalid.
 */
export async function GET(_request: NextRequest) {
  const admin = await verifyAdminSession()

  if (!admin) {
    return apiUnauthenticated('Authentication required.')
  }

  return apiSuccess({
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  })
}
