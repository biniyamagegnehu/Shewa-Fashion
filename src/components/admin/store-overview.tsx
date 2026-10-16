import React from 'react'
import Link from 'next/link'
import type { StoreSettings } from '@prisma/client'

interface StoreOverviewProps {
  settings: StoreSettings | null
}

export function StoreOverview({ settings }: StoreOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Store Identity & Configuration Card */}
      <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-gold-light border border-accent-gold/20 flex items-center justify-center text-accent-gold-hover">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h.008v.008H4.5v-.008Zm0 3h.008v.008H4.5v-.008Zm0 3h.008v.008H4.5v-.008Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-main">
                  {settings?.storeName || 'Shewa Fashion'}
                </h3>
                <p className="text-[11px] text-secondary">Brand & Store Configuration</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Store
            </span>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 text-xs">
            <div className="p-3 rounded-xl bg-background border border-border/80">
              <span className="text-secondary text-[11px] block">Store Contact</span>
              <p className="font-medium text-main mt-0.5 truncate">
                {settings?.email || 'contact@shewafashion.com'}
              </p>
              <p className="text-secondary text-[11px] mt-0.5">
                {settings?.phone || '+251 (0) 911 234 567'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border/80">
              <span className="text-secondary text-[11px] block">Location</span>
              <p className="font-medium text-main mt-0.5 truncate">
                {settings?.address || 'Bole Medhanialem, Addis Ababa'}
              </p>
              <p className="text-secondary text-[11px] mt-0.5">
                {settings?.openingHours || 'Mon – Sat: 9:00 AM – 8:00 PM'}
              </p>
            </div>
          </div>
        </div>

        {/* System & Architecture Status */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-main">PostgreSQL Connected</span>
            <span className="text-secondary/40">•</span>
            <span>Server Sessions Active</span>
          </div>
          <span className="text-secondary/70">
            Last updated: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleDateString() : 'Active'}
          </span>
        </div>
      </div>

      {/* Quick Launch & Phase Roadmap Card */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Quick Launch
            </span>
          </div>
          <p className="text-xs text-secondary leading-relaxed mb-4">
            Preview the public catalogue, customer lookbook, and storefront as a shopper.
          </p>

          <div className="space-y-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary-light/40 transition-colors text-xs font-medium text-main group"
            >
              <span className="group-hover:text-primary transition-colors">Store Home Page</span>
              <svg className="w-3.5 h-3.5 text-secondary group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </Link>

            <Link
              href="/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary-light/40 transition-colors text-xs font-medium text-main group"
            >
              <span className="group-hover:text-primary transition-colors">Product Catalogue</span>
              <svg className="w-3.5 h-3.5 text-secondary group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </Link>

            <Link
              href="/gallery"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary-light/40 transition-colors text-xs font-medium text-main group"
            >
              <span className="group-hover:text-primary transition-colors">Lookbook Gallery</span>
              <svg className="w-3.5 h-3.5 text-secondary group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-5 p-3 rounded-xl bg-primary-light/60 border border-primary/20 text-[11px] text-main">
          <p className="font-semibold text-primary">Phase 11 Active</p>
          <p className="text-secondary mt-0.5 leading-snug">
            Catalogue management and product modifications will be unlocked in Phase 12.
          </p>
        </div>
      </div>
    </div>
  )
}
