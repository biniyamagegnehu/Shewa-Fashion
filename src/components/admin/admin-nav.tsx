'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import type { AuthenticatedAdmin } from '@/lib/auth'

export interface NavItem {
  name: string
  href: string
  icon: (props: { className?: string }) => React.JSX.Element
  phaseBadge?: string
  isAvailable: boolean
}

export const navItems: NavItem[] = [
  {
    name: 'Overview',
    href: '/admin',
    isAvailable: true,
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    name: 'Products',
    href: '/admin/products',
    isAvailable: true,
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    isAvailable: true,
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    name: 'Collections',
    href: '/admin/collections',
    isAvailable: true,
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
      </svg>
    ),
  },
  {
    name: 'Gallery',
    href: '/admin/gallery',
    isAvailable: true,
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    isAvailable: true,
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  {
    name: 'Image Infrastructure',
    href: '#',
    isAvailable: false,
    phaseBadge: 'Phase 15',
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
      </svg>
    ),
  },
]

interface AdminNavProps {
  admin: AuthenticatedAdmin
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function AdminNav({ admin, mobileOpen, onCloseMobile }: AdminNavProps) {
  const pathname = usePathname()

  // Close mobile drawer on ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) {
        onCloseMobile()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen, onCloseMobile])

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const renderNavLinks = () => (
    <ul className="space-y-1.5 px-3">
      {navItems.map((item) => {
        const isActive =
          item.isAvailable &&
          (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))

        if (!item.isAvailable) {
          return (
            <li key={item.name}>
              <div
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-secondary/60 cursor-not-allowed select-none bg-transparent hover:bg-black/[0.02] transition-colors"
                title={`${item.name} will be available in ${item.phaseBadge}`}
                aria-disabled="true"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-secondary/40 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.phaseBadge && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-black/[0.04] text-secondary/70 border border-border/50">
                    {item.phaseBadge}
                  </span>
                )}
              </div>
            </li>
          )
        }

        return (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary-light text-primary font-semibold shadow-xs'
                  : 'text-main hover:bg-black/[0.03] hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-primary' : 'text-secondary'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  const renderUserCard = () => (
    <div className="p-3 border-t border-border mt-auto bg-surface/50">
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/80">
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-main truncate">{admin.name}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary-light text-primary">
              {admin.role}
            </span>
          </div>
          <p className="text-[11px] text-secondary truncate mt-0.5">{admin.email}</p>
        </div>
        <form action={logoutAction} className="shrink-0">
          <button
            type="submit"
            aria-label="Sign Out"
            title="Sign Out of Admin Portal"
            className="p-1.5 rounded-lg text-secondary hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </button>
        </form>
      </div>

      <div className="mt-3 px-1 flex items-center justify-between text-[11px] text-secondary">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
        >
          <span>View Public Store</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </Link>
        <span className="text-[10px] text-secondary/60">v0.1.0</span>
      </div>
    </div>
  )

  return (
    <>
      {/* ============================================================ */}
      {/* Desktop Sidebar (hidden on mobile, fixed on lg+)              */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-surface border-r border-border">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/admin" className="flex items-baseline gap-1 group">
            <span className="font-serif text-lg font-bold tracking-tight text-main group-hover:text-primary transition-colors">
              Shewa Fashion
            </span>
            <span className="text-accent-gold text-xl font-serif">.</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary-light text-primary">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-5 overflow-y-auto">
          <div className="px-5 mb-3 text-[10px] font-bold uppercase tracking-wider text-secondary/70">
            Management
          </div>
          {renderNavLinks()}
        </div>

        {/* User Card & Logout */}
        {renderUserCard()}
      </aside>

      {/* ============================================================ */}
      {/* Mobile Drawer (visible when mobileOpen is true)               */}
      {/* ============================================================ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin Navigation Menu">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-surface border-r border-border flex flex-col shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-border">
              <Link href="/admin" onClick={onCloseMobile} className="flex items-baseline gap-1">
                <span className="font-serif text-lg font-bold tracking-tight text-main">
                  Shewa Fashion
                </span>
                <span className="text-accent-gold text-xl font-serif">.</span>
              </Link>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="p-2 -mr-2 rounded-lg text-secondary hover:text-main hover:bg-black/[0.04] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 py-4 overflow-y-auto">
              <div className="px-5 mb-2.5 text-[10px] font-bold uppercase tracking-wider text-secondary/70">
                Management
              </div>
              {renderNavLinks()}
            </div>

            {/* Drawer User Card */}
            {renderUserCard()}
          </div>
        </div>
      )}
    </>
  )
}
