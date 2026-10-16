'use client'

import React from 'react'
import Link from 'next/link'
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
    <header className="sticky top-0 z-20 w-full h-16 bg-surface/90 backdrop-blur-md border-b border-border transition-shadow">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & breadcrumb title */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onOpenMobile}
            aria-label="Open mobile navigation menu"
            className="lg:hidden p-2 -ml-2 rounded-lg text-secondary hover:text-main hover:bg-black/[0.04] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Breadcrumb & Title */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-secondary font-medium hidden sm:flex">
              <span>Shewa Fashion</span>
              <span className="text-secondary/40">/</span>
              <span>{breadcrumb}</span>
              <span className="text-secondary/40">/</span>
              <span className="text-primary font-semibold">{title}</span>
            </div>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-main truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: Store link & Account summary */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Quick link to public store */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-secondary hover:text-primary hover:bg-primary-light/60 transition-colors border border-border/70"
          >
            <span>Store Front</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </Link>

          {/* Admin Avatar & Details */}
          <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-border/80">
            <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0 select-none border border-primary/20">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <p className="font-semibold text-main truncate max-w-[120px]">{admin.name}</p>
              <p className="text-[10px] text-secondary truncate max-w-[120px]">{admin.email}</p>
            </div>

            <form action={logoutAction} className="sm:hidden">
              <button
                type="submit"
                aria-label="Sign out"
                className="p-1.5 rounded-lg text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
