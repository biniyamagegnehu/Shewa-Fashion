'use client'

import React, { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import type { StoreSettingsRecord } from '@/lib/products'

interface ChromeProps {
  settings?: StoreSettingsRecord | null
}

function HeaderInner({ settings }: ChromeProps) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return null
  }
  return <Navbar settings={settings} />
}

function FooterInner({ settings }: ChromeProps) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return null
  }
  return <Footer settings={settings} />
}

export function AppHeader({ settings }: ChromeProps) {
  return (
    <Suspense fallback={null}>
      <HeaderInner settings={settings} />
    </Suspense>
  )
}

export function AppFooter({ settings }: ChromeProps) {
  return (
    <Suspense fallback={null}>
      <FooterInner settings={settings} />
    </Suspense>
  )
}
