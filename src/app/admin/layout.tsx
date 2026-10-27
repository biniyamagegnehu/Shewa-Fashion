import type { Metadata } from 'next'
import { connection } from 'next/server'

export const instant = false

export const metadata: Metadata = {
  title: 'Admin Portal | Shewa Fashion',
  description: 'Administrator management portal for Shewa Fashion.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()
  return (
    <div className="min-h-screen bg-background text-main flex flex-col">
      {children}
    </div>
  )
}
