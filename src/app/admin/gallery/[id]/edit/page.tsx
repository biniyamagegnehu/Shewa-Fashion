import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { GalleryForm } from '@/components/admin/gallery-form'

export const instant = false

export const metadata: Metadata = {
  title: 'Edit Lookbook Image | Shewa Fashion Admin',
  description: 'Edit editorial lookbook image details and publication status.',
  robots: { index: false, follow: false },
}

interface EditGalleryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditGalleryPage({ params }: EditGalleryPageProps) {
  const admin = await requireAdminSession('/admin/gallery')
  const { id } = await params

  const item = await prisma.galleryItem.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      alt: true,
      description: true,
      sortOrder: true,
      isPublished: true,
    },
  })

  if (!item) {
    notFound()
  }

  return (
    <AdminShell admin={admin} title="Edit Lookbook Image" breadcrumb="Gallery / Edit Image">
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
            Edit Lookbook Image
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Update caption, story, display order, or replace photography.
          </p>
        </div>

        <GalleryForm initialData={item} isEdit={true} />
      </div>
    </AdminShell>
  )
}
