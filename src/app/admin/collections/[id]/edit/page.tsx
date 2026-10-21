import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { CollectionForm } from '@/components/admin/collection-form'
import { updateCollectionAction } from '@/app/actions/collections'

export const instant = false

export const metadata: Metadata = {
  title: 'Edit Collection | Shewa Fashion Admin',
  description: 'Update an existing curated product collection.',
  robots: { index: false, follow: false },
}

interface EditCollectionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const { id } = await params
  const admin = await requireAdminSession(`/admin/collections/${id}/edit`)

  const collection = await prisma.collection.findUnique({
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

  if (!collection) {
    notFound()
  }

  const boundAction = updateCollectionAction.bind(null, collection.id)

  return (
    <AdminShell
      admin={admin}
      title="Edit Collection"
      breadcrumb={`Catalogue / Collections / Edit / ${collection.name}`}
    >
      <div className="py-2 sm:py-4">
        <div className="mb-6">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-main">
            Edit: {collection.name}
          </h1>
          <p className="text-xs text-secondary mt-1">
            Current slug:{' '}
            <code className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">
              {collection.slug}
            </code>{' '}
            · {collection._count.products} product{collection._count.products !== 1 ? 's' : ''} in
            this collection
          </p>
          {collection._count.products > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              ⚠ Renaming will update the URL slug. Public links to{' '}
              <strong>/collections/{collection.slug}</strong> will no longer work unless you keep the
              same name.
            </div>
          )}
        </div>
        <CollectionForm
          initialData={{
            id: collection.id,
            name: collection.name,
            description: collection.description,
            isActive: collection.isActive,
          }}
          action={boundAction}
          submitLabel="Save Changes"
          isEdit={true}
        />
      </div>
    </AdminShell>
  )
}
