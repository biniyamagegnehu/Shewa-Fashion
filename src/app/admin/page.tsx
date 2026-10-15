import type { Metadata } from 'next'
import { requireAdminSession } from '@/lib/auth'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export const instant = false

export const metadata: Metadata = {
  title: 'Admin Dashboard | Shewa Fashion',
  description: 'Shewa Fashion administration dashboard.',
}

export default async function AdminDashboardPage() {
  const admin = await requireAdminSession()

  return (
    <div className="flex-1 flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="w-full bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-semibold tracking-wide text-main">
              Shewa Fashion
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-main">{admin.name}</p>
              <p className="text-[11px] text-secondary">{admin.email}</p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-border rounded-2xl p-8 sm:p-12 shadow-xs text-center max-w-2xl mx-auto my-12">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary-light flex items-center justify-center text-primary">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
          </div>

          <h2 className="font-serif text-2xl font-semibold text-main mb-2">
            Secure Admin Authentication Active
          </h2>
          <p className="text-sm text-secondary mb-6 leading-relaxed">
            You are securely authenticated as an administrator. The complete admin dashboard widgets, catalogue management, and inventory controls will be implemented in a subsequent phase.
          </p>

          <div className="bg-background rounded-xl p-4 border border-border text-left space-y-2 mb-8">
            <div className="flex justify-between text-xs py-1 border-b border-border/60">
              <span className="text-secondary">Administrator Name:</span>
              <span className="font-semibold text-main">{admin.name}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/60">
              <span className="text-secondary">Email:</span>
              <span className="font-medium text-main">{admin.email}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/60">
              <span className="text-secondary">Assigned Role:</span>
              <span className="inline-block uppercase tracking-wider text-[11px] font-bold text-primary">
                {admin.role}
              </span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-secondary">Session Status:</span>
              <span className="text-emerald-700 font-medium">Valid & Active</span>
            </div>
          </div>

          <form action={logoutAction}>
            <Button type="submit" variant="primary" size="md">
              Sign Out
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
