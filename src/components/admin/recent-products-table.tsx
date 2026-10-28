import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface RecentProductItem {
  id: string
  name: string
  slug: string
  price: number
  available: boolean
  featured: boolean
  createdAt: Date
  categoryName?: string | null
  collectionName?: string | null
  imageUrl?: string | null
  imageAlt?: string | null
}

interface RecentProductsTableProps {
  products: RecentProductItem[]
}

export function RecentProductsTable({ products }: RecentProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-10 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
        </div>
        <h2 id="recent-products-heading" className="font-serif text-lg font-semibold text-main">No products yet</h2>
        <p className="text-xs text-secondary max-w-sm mx-auto mt-1.5 leading-relaxed">
          Your catalogue is empty. Add your first product to start selling.
        </p>
        <div className="mt-5">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add First Product
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="p-5 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 id="recent-products-heading" className="font-serif text-lg font-bold text-main">Recent Products</h2>
          <p className="text-xs text-secondary mt-0.5">
            Latest {products.length} items in your catalogue
          </p>
        </div>
        <Link
          href="/admin/products"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg bg-primary-light hover:bg-primary-light/80 transition-colors"
        >
          <span>View All</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/60 text-secondary uppercase tracking-wider text-[10px]">
              <th scope="col" className="py-3 pl-5 pr-3 font-semibold">Product</th>
              <th scope="col" className="px-3 py-3 font-semibold">Category</th>
              <th scope="col" className="px-3 py-3 font-semibold">Collection</th>
              <th scope="col" className="px-3 py-3 font-semibold">Price (ETB)</th>
              <th scope="col" className="px-3 py-3 font-semibold">Status</th>
              <th scope="col" className="py-3 pl-3 pr-5 font-semibold text-right">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {products.map((item) => (
              <tr key={item.id} className="hover:bg-primary-light/20 transition-colors group">
                <td className="py-3.5 pl-5 pr-3 font-medium text-main">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 rounded-lg overflow-hidden bg-background border border-border shrink-0 relative flex items-center justify-center text-secondary/30">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.imageAlt || item.name} width={40} height={48} unoptimized className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${item.id}/edit`} className="font-semibold text-main hover:text-primary transition-colors block truncate max-w-[180px]">
                        {item.name}
                      </Link>
                      <p className="text-[10px] text-secondary/60 font-mono truncate">/{item.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  {item.categoryName ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-background border border-border text-main">
                      {item.categoryName}
                    </span>
                  ) : <span className="text-secondary/40">—</span>}
                </td>
                <td className="px-3 py-3.5">
                  {item.collectionName ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-light text-primary border border-primary/15">
                      {item.collectionName}
                    </span>
                  ) : <span className="text-secondary/40">—</span>}
                </td>
                <td className="px-3 py-3.5 font-semibold text-main whitespace-nowrap">
                  {item.price.toLocaleString()}
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    item.available
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    {item.available ? 'Visible' : 'Hidden'}
                  </span>
                  {item.featured && (
                    <span className="ml-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-gold-light text-accent-gold-hover border border-accent-gold/30">
                      ★
                    </span>
                  )}
                </td>
                <td className="py-3.5 pl-3 pr-5 text-right text-[10px] text-secondary/70 whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack */}
      <div className="sm:hidden divide-y divide-border/50">
        {products.map((item) => (
          <Link key={item.id} href={`/admin/products/${item.id}/edit`} className="flex items-start gap-3 p-4 hover:bg-background/50 transition-colors active:bg-primary-light/30">
            <div className="w-14 h-16 rounded-xl overflow-hidden bg-background border border-border shrink-0 relative flex items-center justify-center text-secondary/30">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.imageAlt || item.name} width={56} height={64} unoptimized className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-main text-sm truncate flex-1">{item.name}</p>
                <p className="font-bold text-main text-sm shrink-0 ml-2">{item.price.toLocaleString()} ETB</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  item.available
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {item.available ? 'Visible' : 'Hidden'}
                </span>
                {item.categoryName && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-background border border-border text-secondary">
                    {item.categoryName}
                  </span>
                )}
                {item.featured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-gold-light text-accent-gold-hover border border-accent-gold/30">
                    ★ Featured
                  </span>
                )}
              </div>
              <p className="text-[10px] text-secondary/60 mt-1.5">
                Added {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <svg className="w-4 h-4 text-secondary/30 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
