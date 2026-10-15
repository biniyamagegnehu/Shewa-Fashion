import type { Metadata } from 'next'

export const instant = false

export const metadata: Metadata = {
  title: 'Admin Portal | Shewa Fashion',
  description: 'Administrator management portal for Shewa Fashion.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-main flex flex-col">
      {children}
    </div>
  )
}
