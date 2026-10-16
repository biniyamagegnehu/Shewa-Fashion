import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { verifyAdminSession, getSafeRedirectUrl } from '@/lib/auth'
import { LoginForm } from '@/components/admin/login-form'

export const instant = false

export const metadata: Metadata = {
  title: 'Admin Sign In | Shewa Fashion',
  description: 'Sign in to Shewa Fashion administration.',
}

interface AdminLoginPageProps {
  searchParams: Promise<{ from?: string }>
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams
  const safeRedirect = getSafeRedirectUrl(params.from, '/admin')

  // If already authenticated as admin, redirect to target or admin dashboard
  const admin = await verifyAdminSession()
  if (admin) {
    redirect(safeRedirect)
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm redirectTo={params.from ? safeRedirect : undefined} />
    </div>
  )
}
