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
      {/* Sidebar */}
      <AdminNav
        admin={admin}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main column — offset by 64 (16rem = 256px) on lg+ */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <AdminHeader
          admin={admin}
          title={title}
          breadcrumb={breadcrumb}
          onOpenMobile={() => setMobileOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-border/50 py-4 px-4 sm:px-6 lg:px-8 text-center sm:text-left text-[11px] text-secondary/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Shewa Fashion. All rights reserved.</p>
          <p className="text-[10px]">Secure Admin Session · PostgreSQL</p>
        </footer>
      </div>
    </div>
  )
}
