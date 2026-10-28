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

  const admin = await verifyAdminSession()
  if (admin) {
    redirect(safeRedirect)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background to-primary-light/20 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 w-full flex justify-center">
        <LoginForm redirectTo={params.from ? safeRedirect : undefined} />
      </div>
    </div>
  )
}
