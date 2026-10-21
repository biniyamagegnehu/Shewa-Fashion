import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { CategoryForm } from '@/components/admin/category-form'
import { updateCategoryAction } from '@/app/actions/categories'

export const instant = false

export const metadata: Metadata = {
  title: 'Edit Category | Shewa Fashion Admin',
  description: 'Update an existing catalogue category.',
  robots: { index: false, follow: false },
}

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const admin = await requireAdminSession(`/admin/categories/${id}/edit`)

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      slug: true,
      _count: { select: { products: true } },
    },
  })

  if (!category) {
    notFound()
  }

  const boundAction = updateCategoryAction.bind(null, category.id)

  return (
    <AdminShell
      admin={admin}
      title="Edit Category"
      breadcrumb={`Catalogue / Categories / Edit / ${category.name}`}
    >
      <div className="py-2 sm:py-4">
        <div className="mb-6">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-main">
            Edit: {category.name}
          </h1>
          <p className="text-xs text-secondary mt-1">
            Current slug: <code className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">{category.slug}</code>
            {' '}· {category._count.products} product{category._count.products !== 1 ? 's' : ''} in this category
          </p>
          {category._count.products > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              ⚠ Renaming this category will update its URL slug. Existing public links to{' '}
              <strong>/categories/{category.slug}</strong> will no longer work unless you keep the same name.
            </div>
          )}
        </div>
        <CategoryForm
          initialData={{
            id: category.id,
            name: category.name,
            description: category.description,
            isActive: category.isActive,
          }}
          action={boundAction}
          submitLabel="Save Changes"
          isEdit={true}
        />
      </div>
    </AdminShell>
  )
}
