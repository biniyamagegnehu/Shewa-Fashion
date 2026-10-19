import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProductForm } from '@/components/admin/product-form'
import { createProductAction } from '@/app/actions/products'

export const instant = false

export const metadata: Metadata = {
  title: 'Add Product | Shewa Fashion Admin',
  description: 'Add a new product to the Shewa Fashion catalogue.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function NewProductPage() {
  // 1. Strict server-side admin authentication and authorization
  const admin = await requireAdminSession('/admin/products/new')

  // 2. Fetch categories for form dropdown
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })

  return (
    <AdminShell admin={admin} title="Add Product" breadcrumb="Products / Add">
      <div className="py-2 sm:py-4">
        <ProductForm
          categories={categories}
          action={createProductAction}
          submitLabel="Save Product"
          isEdit={false}
        />
      </div>
    </AdminShell>
  )
}
