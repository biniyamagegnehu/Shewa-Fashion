import React from 'react'
import Link from 'next/link'

export interface DashboardStats {
  totalProducts: number
  availableProducts: number
  featuredProducts: number
  totalCategories: number
  totalCollections: number
  totalGalleryItems: number
}

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      subtitle: `${stats.availableProducts} visible in shop`,
      href: '/admin/products',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
      accentClass: 'bg-blue-50 text-blue-600 border-blue-100',
      trend: `${stats.featuredProducts} featured`,
      trendColor: 'text-blue-600',
    },
    {
      title: 'Categories',
      value: stats.totalCategories.toLocaleString(),
      subtitle: 'Product groupings',
      href: '/admin/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      ),
      accentClass: 'bg-violet-50 text-violet-600 border-violet-100',
      trend: 'Organised',
      trendColor: 'text-violet-600',
    },
    {
      title: 'Collections',
      value: stats.totalCollections.toLocaleString(),
      subtitle: 'Themed product groups',
      href: '/admin/collections',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
        </svg>
      ),
      accentClass: 'bg-amber-50 text-amber-600 border-amber-100',
      trend: 'Curated',
      trendColor: 'text-amber-600',
    },
    {
      title: 'Gallery Photos',
      value: stats.totalGalleryItems.toLocaleString(),
      subtitle: 'Lookbook & campaigns',
      href: '/admin/gallery',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
      accentClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      trend: 'Live',
      trendColor: 'text-emerald-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {cards.map((card) => (
        <Link
          key={card.title}
          href={card.href}
          className="group bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider truncate pr-2">
              {card.title}
            </span>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border ${card.accentClass} transition-transform group-hover:scale-105`}>
              {card.icon}
            </div>
          </div>

          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-main tabular-nums">
              {card.value}
            </div>
            <p className="text-[10px] sm:text-xs text-secondary mt-1">{card.subtitle}</p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-border/60">
            <span className={`text-[10px] font-semibold ${card.trendColor}`}>
              {card.trend}
            </span>
            <svg className={`w-3 h-3 ml-auto opacity-0 group-hover:opacity-70 transition-opacity ${card.trendColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  )
}
