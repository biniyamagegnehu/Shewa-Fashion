import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { CategoryListClient } from '@/components/admin/category-list-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Categories | Shewa Fashion Admin',
  description: 'Manage catalogue categories for the Shewa Fashion store.',
  robots: { index: false, follow: false },
}

export default async function AdminCategoriesPage() {
  const admin = await requireAdminSession('/admin/categories')

  const categories = await prisma.category.findMany({
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

  const items = categories.map((c) => ({
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
    <AdminShell admin={admin} title="Categories" breadcrumb="Catalogue / Categories">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-main">Categories</h1>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              Manage top-level catalogue groupings. Changes apply immediately to the public store.
            </p>
          </div>
          <Link
            href="/admin/categories/new"
            id="add-category-btn"
            className="h-11 inline-flex items-center gap-2 px-5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-white text-sm font-semibold shadow-xs transition-all self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Category
          </Link>
        </div>

        <div className="flex flex-wrap gap-2.5 text-xs">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border shadow-xs">
            <span className="font-bold text-main">{items.length}</span>
            <span className="text-secondary">total</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-emerald-700">{items.filter((c) => c.isActive).length}</span>
            <span className="text-emerald-700">active</span>
          </div>
          {items.filter((c) => !c.isActive).length > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="font-bold text-amber-700">{items.filter((c) => !c.isActive).length}</span>
              <span className="text-amber-700">inactive</span>
            </div>
          )}
        </div>

        <CategoryListClient categories={items} />
      </div>
    </AdminShell>
  )
}
