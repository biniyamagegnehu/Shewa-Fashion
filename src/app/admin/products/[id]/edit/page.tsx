import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProductForm, InitialProductData } from '@/components/admin/product-form'
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
    },
  })

  if (!product) {
    notFound()
  }

  // 4. Fetch categories for form dropdown
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })

  // 5. Format initial form data for the simplified 7-field form
  const initialData: InitialProductData = {
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description,
    categoryId: product.categoryId,
    available: product.available,
    imageUrl: product.images[0]?.url || '',
    sizes: product.options
      .filter((o) => o.type === 'SIZE' || o.type === 'SHOE_SIZE' || o.type === 'ONE_SIZE')
      .map((o) => o.value),
  }

  // Bind the product ID to the update action
  const boundAction = updateProductAction.bind(null, product.id)

  return (
    <AdminShell admin={admin} title="Edit Product" breadcrumb={`Products / Edit / ${product.name}`}>
      <div className="py-2 sm:py-4">
        <ProductForm
          initialData={initialData}
          categories={categories}
          action={boundAction}
          submitLabel="Save Changes"
          isEdit={true}
        />
      </div>
    </AdminShell>
  )
}
