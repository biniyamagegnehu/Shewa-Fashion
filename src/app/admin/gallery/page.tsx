import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { GalleryListClient } from '@/components/admin/gallery-list-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Lookbook Gallery | Shewa Fashion Admin',
  description: 'Manage visual editorial journal and lookbook gallery items.',
  robots: { index: false, follow: false },
}

export default async function AdminGalleryPage() {
  const admin = await requireAdminSession('/admin/gallery')

  const items = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      imageUrl: true,
      alt: true,
      description: true,
      sortOrder: true,
      isPublished: true,
      createdAt: true,
    },
  })

  const formattedItems = items.map((item) => ({
    ...item,
    createdAt: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(item.createdAt),
  }))

  const publishedCount = items.filter((i) => i.isPublished).length
  const draftCount = items.filter((i) => !i.isPublished).length

  return (
    <AdminShell admin={admin} title="Lookbook Gallery" breadcrumb="Editorial / Gallery">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-main">
              Lookbook Gallery
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              Curate the public editorial visual journal. Published photography is displayed at{' '}
              <Link href="/gallery" target="_blank" className="text-primary hover:underline font-medium">
                /gallery
              </Link>
              .
            </p>
          </div>
          <Link
            href="/admin/gallery/new"
            id="add-gallery-item-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Image
          </Link>
        </div>

        {/* Status Strip */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border">
            <span className="font-semibold text-main">{items.length}</span>
            <span className="text-secondary">total</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="font-semibold text-emerald-700">{publishedCount}</span>
            <span className="text-emerald-600">published</span>
          </div>
          {draftCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
              <span className="font-semibold text-amber-700">{draftCount}</span>
              <span className="text-amber-600">drafts</span>
            </div>
          )}
        </div>

        {/* Gallery Grid Client */}
        <GalleryListClient initialItems={formattedItems} />
      </div>
    </AdminShell>
  )
}
