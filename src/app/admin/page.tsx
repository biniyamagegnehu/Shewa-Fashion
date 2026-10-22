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
  // 1. Strict server-side authentication & role authorization
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

  // 2. Direct server-side PostgreSQL queries
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
    // Log server-side only; never expose database errors to client
    console.error('Failed to load admin dashboard statistics from database:', error)
    queryError = true
  }

  return (
    <AdminShell admin={admin} title="Overview" breadcrumb="Management">
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Greeting Banner */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary mb-1">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-main">
              Welcome back, {admin.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-1 max-w-2xl leading-relaxed">
              Here&apos;s what&apos;s happening in your store today — manage products, update categories, and keep your catalogue fresh.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Database Query Error Alert (if database fails) */}
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

