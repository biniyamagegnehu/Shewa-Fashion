'use client'

import React, { useState } from 'react'
import { AdminNav } from '@/components/admin/admin-nav'
import { AdminHeader } from '@/components/admin/admin-header'
import type { AuthenticatedAdmin } from '@/lib/auth'

interface AdminShellProps {
  admin: AuthenticatedAdmin
  title?: string
  breadcrumb?: string
  children: React.ReactNode
}

export function AdminShell({
  admin,
  title = 'Overview',
  breadcrumb = 'Management',
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-main flex flex-col overflow-x-hidden">
      {/* Sidebar Navigation (Desktop Fixed + Mobile Off-Canvas Drawer) */}
      <AdminNav
        admin={admin}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Column (Offset by 64 (16rem) on lg+ screens to clear fixed sidebar) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <AdminHeader
          admin={admin}
          title={title}
          breadcrumb={breadcrumb}
          onOpenMobile={() => setMobileOpen(true)}
        />

        {/* Page Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-border py-4 px-4 sm:px-6 lg:px-8 bg-surface/50 text-center sm:text-left text-xs text-secondary flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Shewa Fashion. All rights reserved.</p>
          <p className="text-[11px] text-secondary/70">
            Secure Administrator Session • PostgreSQL Persistent Data
          </p>
        </footer>
      </div>
    </div>
  )
}
