import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatsCards, DashboardStats } from '@/components/admin/stats-card'
import { RecentProductsTable, RecentProductItem } from '@/components/admin/recent-products-table'
import { StoreOverview } from '@/components/admin/store-overview'
import type { StoreSettings } from '@prisma/client'

export const instant = false

export const metadata: Metadata = {
  title: 'Admin Dashboard | Shewa Fashion',
  description: 'Management portal and catalogue overview for Shewa Fashion.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminDashboardPage() {
  const admin = await requireAdminSession('/admin')

  let stats: DashboardStats = {
    totalProducts: 0,
    availableProducts: 0,
    featuredProducts: 0,
    totalCategories: 0,
    totalCollections: 0,
    totalGalleryItems: 0,
  }

  let recentProducts: RecentProductItem[] = []
  let storeSettings: StoreSettings | null = null
  let queryError = false

  try {
    const [
      totalProducts,
      availableProducts,
      featuredProducts,
      totalCategories,
      totalCollections,
      totalGalleryItems,
      settings,
      rawProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { available: true } }),
      prisma.product.count({ where: { featured: true } }),
      prisma.category.count(),
      prisma.collection.count(),
      prisma.galleryItem.count(),
      prisma.storeSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.product.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          available: true,
          featured: true,
          createdAt: true,
          category: {
            select: { name: true },
          },
          collection: {
            select: { name: true },
          },
          images: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
            select: { url: true, alt: true },
          },
        },
      }),
    ])

    stats = {
      totalProducts,
      availableProducts,
      featuredProducts,
      totalCategories,
      totalCollections,
      totalGalleryItems,
    }

    storeSettings = settings

    recentProducts = rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      available: p.available,
      featured: p.featured,
      createdAt: p.createdAt,
      categoryName: p.category?.name ?? null,
      collectionName: p.collection?.name ?? null,
      imageUrl: p.images[0]?.url ?? null,
      imageAlt: p.images[0]?.alt ?? null,
    }))
  } catch (error) {
    console.error('Failed to load admin dashboard statistics from database:', error)
    queryError = true
  }

  return (
    <AdminShell admin={admin} title="Overview" breadcrumb="Management">
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Greeting Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-primary-light/30 rounded-2xl border border-border p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light border border-primary/10 text-xs font-semibold text-primary mb-2.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-main">
              Welcome back, {admin.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-1.5 max-w-2xl leading-relaxed">
              Here&apos;s your store status today — review product performance, monitor inventory, and keep your luxury catalogue fresh.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 relative z-10">
            <Link
              href="/admin/products/new"
              className="h-11 inline-flex items-center gap-2 px-5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-white text-sm font-semibold shadow-xs transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Database Query Error Alert */}
        {queryError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3"
          >
            <svg
              className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <div>
              <p className="font-semibold text-amber-950">Could not load store statistics</p>
              <p className="text-amber-800 text-xs mt-0.5">
                The database could not be reached. Please check your connection and refresh the page.
              </p>
            </div>
          </div>
        )}

        {/* 1. Statistics Cards */}
        <section aria-labelledby="overview-stats-heading">
          <h2 id="overview-stats-heading" className="sr-only">
            Catalogue Overview Statistics
          </h2>
          <StatsCards stats={stats} />
        </section>

        {/* 2. Recent Products Table */}
        <section aria-labelledby="recent-products-heading">
          <RecentProductsTable products={recentProducts} />
        </section>

        {/* 3. Store Identity & Quick Launch */}
        <section aria-labelledby="store-overview-heading">
          <StoreOverview settings={storeSettings} />
        </section>
      </div>
    </AdminShell>
  )
}
