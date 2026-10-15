import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { verifyAdminSession } from '@/lib/auth'
import { LoginForm } from '@/components/admin/login-form'

export const instant = false

export const metadata: Metadata = {
  title: 'Admin Sign In | Shewa Fashion',
  description: 'Sign in to Shewa Fashion administration.',
}

export default async function AdminLoginPage() {
  // If already authenticated as admin, redirect to admin dashboard
  const admin = await verifyAdminSession()
  if (admin) {
    redirect('/admin')
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  )
}
