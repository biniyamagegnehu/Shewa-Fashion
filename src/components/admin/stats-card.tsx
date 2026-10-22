import React from 'react'

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
      subtitle: `${stats.availableProducts} visible in catalogue`,
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
      badgeText: `${stats.availableProducts} in shop`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Categories',
      value: stats.totalCategories.toLocaleString(),
      subtitle: 'Product groupings in your store',
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      ),
      badgeText: 'Organised',
      badgeColor: 'bg-primary-light text-primary border-primary/20',
    },
    {
      title: 'Collections',
      value: stats.totalCollections.toLocaleString(),
      subtitle: 'Themed groups of products',
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
        </svg>
      ),
      badgeText: 'Curated',
      badgeColor: 'bg-accent-gold-light text-accent-gold-hover border-accent-gold/30',
    },
    {
      title: 'Gallery Photos',
      value: stats.totalGalleryItems.toLocaleString(),
      subtitle: 'Lookbook & campaign images',
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
      badgeText: 'Live',
      badgeColor: 'bg-primary-light text-primary border-primary/20',
    },
  ]


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs hover:border-border/80 transition-shadow flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              {card.title}
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0 border border-primary/10">
              {card.icon}
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-main">
                {card.value}
              </span>
              {card.badgeText && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                >
                  {card.badgeText}
                </span>
              )}
            </div>
            <p className="text-xs text-secondary mt-1.5">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
