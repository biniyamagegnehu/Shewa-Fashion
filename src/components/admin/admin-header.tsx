import React from 'react'
import { logoutAction } from '@/app/actions/auth'
import type { AuthenticatedAdmin } from '@/lib/auth'

interface AdminHeaderProps {
  admin: AuthenticatedAdmin
  title?: string
  breadcrumb?: string
  onOpenMobile: () => void
}

export function AdminHeader({
  admin,
  title = 'Overview',
  breadcrumb = 'Management',
  onOpenMobile,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-surface/95 backdrop-blur-md border-b border-border transition-shadow">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & breadcrumb title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobile}
            aria-label="Open mobile navigation menu"
            className="lg:hidden min-w-[44px] min-h-[44px] -ml-2 rounded-xl text-secondary hover:text-main hover:bg-black/[0.04] transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Breadcrumb & Title */}
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-[11px] text-secondary font-medium">
              <span>Shewa Fashion</span>
              <span className="text-secondary/40" aria-hidden="true">/</span>
              <span>{breadcrumb}</span>
              <span className="text-secondary/40" aria-hidden="true">/</span>
              <span className="text-primary font-semibold">{title}</span>
            </nav>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-main truncate leading-tight mt-0.5">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: Admin profile & Sign out */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Admin Avatar & Details */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0 select-none border border-primary/20"
              aria-hidden="true"
            >
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <p className="font-semibold text-main truncate max-w-[140px]">{admin.name}</p>
              <p className="text-[10px] text-secondary truncate max-w-[140px]">{admin.email}</p>
            </div>
          </div>

          {/* Sign Out Button (desktop text + mobile icon, both >=44px touch target) */}
          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              aria-label="Sign out of admin"
              title="Sign out of admin portal"
              className="min-h-[44px] min-w-[44px] sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-secondary hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

