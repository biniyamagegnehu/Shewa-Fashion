import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { verifyAdminSession, getSafeRedirectUrl } from '@/lib/auth'
import { LoginForm } from '@/components/admin/login-form'

export const instant = false

export const metadata: Metadata = {
  title: 'Admin Sign In | Shewa Fashion',
  description: 'Sign in to Shewa Fashion administration portal.',
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
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#F7F9FC] via-background to-primary-light/15 relative overflow-hidden text-main selection:bg-primary-light selection:text-primary">
      {/* Subtle Ambient Decorative Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Top Bar Navigation */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-secondary hover:text-main px-3 py-1.5 rounded-xl border border-border/70 bg-surface/80 backdrop-blur-xs hover:bg-surface hover:border-primary/40 transition-all shadow-2xs group"
        >
          <svg
            className="w-4 h-4 text-secondary group-hover:text-primary group-hover:-translate-x-0.5 transition-all"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span>Return to Store</span>
        </Link>

        {/* Live System Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface/80 backdrop-blur-xs border border-border/70 text-[11px] font-semibold text-secondary shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="text-secondary/80">Portal</span>
          <span className="text-emerald-700 font-bold">Secure</span>
        </div>
      </header>

      {/* Central Login Card Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <LoginForm redirectTo={params.from ? safeRedirect : undefined} />
        </div>
      </main>

      {/* Discreet Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6 text-center text-xs text-secondary/70 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border/40">
        <p>© {new Date().getFullYear()} Shewa Fashion. All administrative rights reserved.</p>
        <p className="text-[11px] text-secondary/60">
          Authorized personnel only • Protected with 256-bit encryption
        </p>
      </footer>
    </div>
  )
}
