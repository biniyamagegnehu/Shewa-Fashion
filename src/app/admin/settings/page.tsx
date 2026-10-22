import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'
import { SettingsForm } from '@/components/admin/settings-form'

export const instant = false

export const metadata: Metadata = {
  title: 'Store Settings | Shewa Fashion Admin',
  description: 'Manage store details, contact information, hours, and social media channels.',
  robots: { index: false, follow: false },
}

export default async function AdminSettingsPage() {
  const admin = await requireAdminSession('/admin/settings')

  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'singleton' },
    select: {
      storeName: true,
      description: true,
      logoUrl: true,
      phone: true,
      email: true,
      whatsapp: true,
      address: true,
      openingHours: true,
      instagram: true,
      facebook: true,
      tiktok: true,
      telegram: true,
      googleMapsUrl: true,
    },
  })

  return (
    <AdminShell admin={admin} title="Store Settings" breadcrumb="Configuration / Store Settings">
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-main">
            Store Settings
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Manage your store&apos;s public identity, customer contact details, and social channels. Changes update across the website.
          </p>
        </div>

        <SettingsForm initialSettings={settings} />
      </div>
    </AdminShell>
  )
}
