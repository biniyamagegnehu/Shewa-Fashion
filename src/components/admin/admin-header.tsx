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
    <header className="sticky top-0 z-20 w-full h-16 border-b border-border/60 transition-shadow" style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            id="mobile-menu-btn"
            onClick={onOpenMobile}
            aria-label="Open mobile navigation menu"
            className="lg:hidden min-w-[44px] min-h-[44px] -ml-2 rounded-xl text-secondary hover:text-main hover:bg-black/[0.05] transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Breadcrumb & Title */}
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[11px] text-secondary/60 font-medium mb-0.5">
              <span>Admin</span>
              <svg className="w-3 h-3 text-secondary/30" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              <span>{breadcrumb}</span>
              <svg className="w-3 h-3 text-secondary/30" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-primary font-semibold">{title}</span>
            </nav>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-main truncate leading-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: Admin info & sign out */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Avatar + name */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm"
              aria-hidden="true"
            >
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <p className="font-semibold text-main truncate max-w-[130px]">{admin.name}</p>
              <p className="text-[10px] text-secondary/70 truncate max-w-[130px]">{admin.email}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-border mx-1" aria-hidden="true" />

          {/* Sign out */}
          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              id="admin-signout-btn"
              aria-label="Sign out of admin"
              title="Sign out of admin portal"
              className="min-h-[40px] min-w-[40px] sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-secondary/70 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
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
