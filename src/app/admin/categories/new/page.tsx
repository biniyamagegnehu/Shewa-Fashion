import type { Metadata } from 'next'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { CategoryForm } from '@/components/admin/category-form'
import { createCategoryAction } from '@/app/actions/categories'

export const instant = false

export const metadata: Metadata = {
  title: 'Add Category | Shewa Fashion Admin',
  description: 'Create a new catalogue category for the Shewa Fashion store.',
  robots: { index: false, follow: false },
}

export default async function NewCategoryPage() {
  const admin = await requireAdminSession('/admin/categories/new')

  return (
    <AdminShell admin={admin} title="Add Category" breadcrumb="Catalogue / Categories / Add">
      <div className="py-2 sm:py-4">
        <div className="mb-6">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-main">New Category</h1>
          <p className="text-xs text-secondary mt-1">
            The slug is auto-generated from the name and must be unique across all categories.
          </p>
        </div>
        <CategoryForm action={createCategoryAction} submitLabel="Create Category" isEdit={false} />
      </div>
    </AdminShell>
  )
}
