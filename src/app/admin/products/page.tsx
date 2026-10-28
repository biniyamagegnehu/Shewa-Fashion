import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProductFilters } from '@/components/admin/product-filters'
import { ProductListView, ProductListItem } from '@/components/admin/product-list-view'
import type { Prisma } from '@prisma/client'

export const instant = false

export const metadata: Metadata = {
  title: 'Products Management | Shewa Fashion Admin',
  description: 'Manage catalogue products, pricing, availability, and attributes.',
  robots: {
    index: false,
    follow: false,
  },
}

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const admin = await requireAdminSession('/admin/products')
  const params = await searchParams

  const q = typeof params.q === 'string' ? params.q.trim() : ''
  const category = typeof params.category === 'string' ? params.category.trim() : 'all'
  const collection = typeof params.collection === 'string' ? params.collection.trim() : 'all'
  const status = typeof params.status === 'string' ? params.status.trim() : 'all'
  const featured = typeof params.featured === 'string' ? params.featured.trim() : 'all'

  const rawPage = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage
  const pageSize = 10

  const conditions: Prisma.ProductWhereInput[] = []

  if (q) {
    conditions.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    })
  }

  if (category && category !== 'all') {
    conditions.push({
      category: {
        OR: [{ id: category }, { slug: category }],
      },
    })
  }

  if (collection && collection !== 'all') {
    conditions.push({
      collection: {
        OR: [{ id: collection }, { slug: collection }],
      },
    })
  }

  if (status === 'available') {
    conditions.push({ available: true })
  } else if (status === 'draft') {
    conditions.push({ available: false })
  }

  if (featured === 'true') {
    conditions.push({ featured: true })
  } else if (featured === 'false') {
    conditions.push({ featured: false })
  }

  const where: Prisma.ProductWhereInput =
    conditions.length > 0 ? { AND: conditions } : {}

  const hasActiveFilters =
    Boolean(q) ||
    category !== 'all' ||
    collection !== 'all' ||
    status !== 'all' ||
    featured !== 'all'

  const [totalCount, rawProducts, categories, collections] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        available: true,
        featured: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
          select: {
            url: true,
            alt: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.collection.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const products: ProductListItem[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    available: p.available,
    featured: p.featured,
    categoryName: p.category?.name || null,
    collectionName: p.collection?.name || null,
    imageUrl: p.images[0]?.url || null,
    imageAlt: p.images[0]?.alt || null,
    updatedAt: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(p.updatedAt),
  }))

  return (
    <AdminShell admin={admin} title="Products" breadcrumb="Catalogue Management">
      <div className="space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-main">
              Products Catalogue
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              Manage your clothing, footwear, and accessory listings, pricing, and visibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products/new"
              className="h-11 inline-flex items-center gap-2 px-5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-white text-sm font-semibold shadow-xs transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>New Product</span>
            </Link>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <ProductFilters categories={categories} collections={collections} />

        {/* Product Table / Cards View */}
        <ProductListView
          products={products}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </AdminShell>
  )
}
