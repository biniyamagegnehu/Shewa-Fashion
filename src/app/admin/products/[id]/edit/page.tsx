import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProductForm } from '@/components/admin/product-form'
import { updateProductAction } from '@/app/actions/products'

export const instant = false

export const metadata: Metadata = {
  title: 'Edit Product | Shewa Fashion Admin',
  description: 'Update catalogue product information, pricing, options, and status.',
  robots: {
    index: false,
    follow: false,
  },
}

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  // 1. Resolve route params per Next.js 16 conventions
  const { id } = await params

  // 2. Strict server-side admin authentication and authorization
  const admin = await requireAdminSession(`/admin/products/${id}/edit`)

  // 3. Fetch product with relations, or return 404
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      options: true,
      category: {
        select: { id: true, name: true },
      },
      collection: {
        select: { id: true, name: true },
      },
    },
  })

  if (!product) {
    notFound()
  }

  // 4. Fetch categories and collections for form dropdowns
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

  // 5. Format initial form data
  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    categoryId: product.categoryId,
    collectionId: product.collectionId,
    available: product.available,
    featured: product.featured,
    images: product.images.map((img) => ({
      url: img.url,
      alt: img.alt || undefined,
    })),
    options: product.options.map((opt) => ({
      type: opt.type,
      value: opt.value,
    })),
  }

  // Bind the product ID to the update action
  const boundAction = updateProductAction.bind(null, product.id)

  return (
    <AdminShell admin={admin} title="Edit Product" breadcrumb={`Products / Edit / ${product.name}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-main">
            Edit: {product.name}
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Update pricing, descriptions, images, options, or toggle public availability.
          </p>
        </div>

        <ProductForm
          initialData={initialData}
          categories={categories}
          collections={collections}
          action={boundAction}
          submitLabel="Update Product"
          isEdit={true}
        />
      </div>
    </AdminShell>
  )
}
