import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { GalleryForm } from '@/components/admin/gallery-form'

export const instant = false

export const metadata: Metadata = {
  title: 'Add Lookbook Image | Shewa Fashion Admin',
  description: 'Add a new editorial lookbook image to the Shewa Fashion gallery.',
  robots: { index: false, follow: false },
}

export default async function NewGalleryItemPage() {
  const admin = await requireAdminSession('/admin/gallery/new')

  return (
    <AdminShell admin={admin} title="Add Lookbook Image" breadcrumb="Gallery / Add Image">
      <div className="space-y-6">
        <div>
          <Link
            href="/admin/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-main transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Lookbook Gallery
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-main">
            Add Lookbook Image
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Upload and caption an editorial photography item for the public gallery.
          </p>
        </div>

        <GalleryForm isEdit={false} />
      </div>
    </AdminShell>
  )
}
