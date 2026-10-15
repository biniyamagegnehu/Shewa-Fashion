'use client'

import React, { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

function HeaderInner() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return null
  }
  return <Navbar />
}

function FooterInner() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return null
  }
  return <Footer />
}

export function AppHeader() {
  return (
    <Suspense fallback={null}>
      <HeaderInner />
    </Suspense>
  )
}

export function AppFooter() {
  return (
    <Suspense fallback={null}>
      <FooterInner />
    </Suspense>
  )
}
