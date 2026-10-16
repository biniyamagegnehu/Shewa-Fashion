import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProductForm } from '@/components/admin/product-form'
import { createProductAction } from '@/app/actions/products'

export const instant = false

export const metadata: Metadata = {
  title: 'Add New Product | Shewa Fashion Admin',
  description: 'Create a new product record in the Shewa Fashion catalogue.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function NewProductPage() {
  // 1. Strict server-side admin authentication and authorization
  const admin = await requireAdminSession('/admin/products/new')

  // 2. Fetch categories and collections for form dropdowns
  const [categories, collections] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.collection.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])

  return (
    <AdminShell admin={admin} title="New Product" breadcrumb="Products / Create">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-main">
            Add New Product
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Fill in the details below to publish or draft a new piece in the Shewa Fashion catalogue.
          </p>
        </div>

        <ProductForm
          categories={categories}
          collections={collections}
          action={createProductAction}
          submitLabel="Create Product"
          isEdit={false}
        />
      </div>
    </AdminShell>
  )
}
