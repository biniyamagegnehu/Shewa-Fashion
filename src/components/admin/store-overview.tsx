import React from 'react'
import Link from 'next/link'
import type { StoreSettings } from '@prisma/client'

interface StoreOverviewProps {
  settings: StoreSettings | null
}

export function StoreOverview({ settings }: StoreOverviewProps) {
  const quickLinks = [
    {
      label: 'Add Product',
      description: 'List a new clothing or accessory item',
      href: '/admin/products/new',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
      iconBg: 'bg-primary/10 text-primary',
      primary: true,
    },
    {
      label: 'Manage Categories',
      description: 'Organise how products are grouped',
      href: '/admin/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      ),
      iconBg: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Add Gallery Photo',
      description: 'Upload lookbook & campaign photography',
      href: '/admin/gallery/new',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Edit Store Settings',
      description: 'Update branding, contacts & operating hours',
      href: '/admin/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
      {/* Store Info Card */}
      <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3.5 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h.008v.008H4.5v-.008Zm0 3h.008v.008H4.5v-.008Zm0 3h.008v.008H4.5v-.008Z" />
              </svg>
            </div>
            <div>
              <h2 id="store-overview-heading" className="font-serif text-base font-bold text-main">
                {settings?.storeName || 'Shewa Fashion'}
              </h2>
              <p className="text-[11px] text-secondary">Store Profile & Status</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Store
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4 text-xs">
            <div className="p-4 rounded-xl bg-background/80 border border-border/80">
              <span className="text-[11px] text-secondary block font-medium mb-1">Contact Email</span>
              <p className="font-semibold text-main truncate">
                {settings?.email || <span className="text-secondary/60 italic font-normal">Not configured</span>}
              </p>
              {settings?.phone && (
                <p className="text-secondary text-xs mt-1">{settings.phone}</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-background/80 border border-border/80">
              <span className="text-[11px] text-secondary block font-medium mb-1">Physical Location</span>
              <p className="font-semibold text-main truncate">
                {settings?.address || <span className="text-secondary/60 italic font-normal">Not configured</span>}
              </p>
              {settings?.openingHours && (
                <p className="text-secondary text-xs mt-1">{settings.openingHours}</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3.5 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-secondary">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="font-medium text-main">PostgreSQL Connected</span>
            <span className="text-secondary/40" aria-hidden="true">•</span>
            <span>Auth Active</span>
          </div>
          <span className="text-secondary/70">
            Updated:{' '}
            {settings?.updatedAt
              ? new Date(settings.updatedAt).toLocaleDateString()
              : 'Never'}
          </span>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs flex flex-col">
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
            Quick Actions
          </h2>
          <p className="text-xs text-secondary mt-0.5">Frequent tasks for catalog management</p>
        </div>

        <div className="space-y-2.5 flex-1">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`min-h-[54px] flex items-center gap-3.5 p-3 rounded-xl border transition-all active:scale-[0.98] group ${
                link.primary
                  ? 'bg-primary text-white border-primary hover:bg-primary-hover shadow-xs'
                  : 'border-border hover:border-primary/40 hover:bg-primary-light/30 text-main'
              }`}
            >
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  link.primary
                    ? 'bg-white/20 text-white'
                    : link.iconBg
                }`}
              >
                {link.icon}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold ${
                    link.primary ? 'text-white' : 'text-main group-hover:text-primary transition-colors'
                  }`}
                >
                  {link.label}
                </p>
                <p
                  className={`text-[11px] leading-tight mt-0.5 ${
                    link.primary ? 'text-white/80' : 'text-secondary'
                  }`}
                >
                  {link.description}
                </p>
              </div>
              <svg
                className={`w-4 h-4 ml-auto shrink-0 ${
                  link.primary ? 'text-white/80' : 'text-secondary/50 group-hover:text-primary transition-colors'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
