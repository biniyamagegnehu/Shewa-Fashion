import type { Metadata } from 'next'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { CollectionForm } from '@/components/admin/collection-form'
import { createCollectionAction } from '@/app/actions/collections'

export const instant = false

export const metadata: Metadata = {
  title: 'Add Collection | Shewa Fashion Admin',
  description: 'Create a new curated product collection.',
  robots: { index: false, follow: false },
}

export default async function NewCollectionPage() {
  const admin = await requireAdminSession('/admin/collections/new')

  return (
    <AdminShell admin={admin} title="Add Collection" breadcrumb="Catalogue / Collections / Add">
      <div className="py-2 sm:py-4">
        <div className="mb-6">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-main">New Collection</h1>
          <p className="text-xs text-secondary mt-1">
            Collections group products into curated sets like New Arrivals or Best Sellers.
          </p>
        </div>
        <CollectionForm action={createCollectionAction} submitLabel="Create Collection" isEdit={false} />
      </div>
    </AdminShell>
  )
}
