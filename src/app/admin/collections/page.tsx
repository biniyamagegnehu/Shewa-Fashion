import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { CollectionListClient } from '@/components/admin/collection-list-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Collections | Shewa Fashion Admin',
  description: 'Manage curated product collections for the Shewa Fashion store.',
  robots: { index: false, follow: false },
}

export default async function AdminCollectionsPage() {
  const admin = await requireAdminSession('/admin/collections')

  const collections = await prisma.collection.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isActive: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  })

  const items = collections.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    isActive: c.isActive,
    productCount: c._count.products,
    createdAt: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(c.createdAt),
  }))

  return (
    <AdminShell admin={admin} title="Collections" breadcrumb="Catalogue / Collections">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-main">Collections</h1>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              Manage curated groupings such as New Arrivals and Best Sellers.
            </p>
          </div>
          <Link
            href="/admin/collections/new"
            id="add-collection-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Collection
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border">
            <span className="font-semibold text-main">{items.length}</span>
            <span className="text-secondary">total</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="font-semibold text-emerald-700">{items.filter((c) => c.isActive).length}</span>
            <span className="text-emerald-600">active</span>
          </div>
          {items.filter((c) => !c.isActive).length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
              <span className="font-semibold text-amber-700">{items.filter((c) => !c.isActive).length}</span>
              <span className="text-amber-600">inactive</span>
            </div>
          )}
        </div>

        <CollectionListClient collections={items} />
      </div>
    </AdminShell>
  )
}
