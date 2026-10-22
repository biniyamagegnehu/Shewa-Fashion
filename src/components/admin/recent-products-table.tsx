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
      <div className="bg-surface rounded-2xl border border-border p-8 sm:p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center text-primary">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
        </div>
        <h2 id="recent-products-heading" className="font-serif text-lg font-semibold text-main">
          No products yet
        </h2>
        <p className="text-xs text-secondary max-w-sm mx-auto mt-1.5 leading-relaxed">
          Your catalogue is empty. Add your first product to start selling.
        </p>
        <div className="mt-4">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs transition-colors"
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
          <h2 className="font-serif text-lg font-bold text-main">Recent Products</h2>
          <p className="text-xs text-secondary mt-0.5">
            Showing the latest {products.length} catalogue items sorted by creation date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg bg-primary-light"
          >
            <span>View All Products</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

      </div>

      {/* ============================================================ */}
      {/* Desktop Table View (visible on sm+)                          */}
      {/* ============================================================ */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/50 text-secondary uppercase tracking-wider text-[10px]">
              <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Product</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">Category</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">Collection</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">Price (ETB)</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">Status</th>
              <th scope="col" className="py-3.5 pl-3 pr-6 font-semibold text-right">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {products.map((item) => (
              <tr key={item.id} className="hover:bg-background/40 transition-colors">
                {/* Product Name & Image */}
                <td className="py-3.5 pl-6 pr-3 font-medium text-main">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-background border border-border shrink-0 relative flex items-center justify-center text-secondary/40">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt || item.name}
                          width={40}
                          height={40}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-main truncate max-w-[200px]">{item.name}</p>
                      <p className="text-[11px] text-secondary/80 font-mono truncate max-w-[200px]">/{item.slug}</p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-3 py-3.5 text-secondary">
                  {item.categoryName ? (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-background border border-border text-main">
                      {item.categoryName}
                    </span>
                  ) : (
                    <span className="text-secondary/50">—</span>
                  )}
                </td>

                {/* Collection */}
                <td className="px-3 py-3.5 text-secondary">
                  {item.collectionName ? (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary-light text-primary border border-primary/20">
                      {item.collectionName}
                    </span>
                  ) : (
                    <span className="text-secondary/50">—</span>
                  )}
                </td>

                {/* Price */}
                <td className="px-3 py-3.5 font-semibold text-main whitespace-nowrap">
                  {item.price.toLocaleString()} ETB
                </td>

                {/* Status */}
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.available ? 'bg-emerald-500' : 'bg-secondary/40'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-medium ${
                        item.available ? 'text-emerald-700' : 'text-secondary'
                      }`}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                    {item.featured && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-accent-gold-light text-accent-gold-hover border border-accent-gold/30 ml-1">
                        Featured
                      </span>
                    )}
                  </div>
                </td>

                {/* Date Added */}
                <td className="py-3.5 pl-3 pr-6 text-right text-secondary text-[11px] whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================================================ */}
      {/* Mobile Card List View (visible below sm, zero overflow)     */}
      {/* ============================================================ */}
      <div className="sm:hidden divide-y divide-border/60">
        {products.map((item) => (
          <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-background/40 transition-colors">
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-background border border-border shrink-0 relative flex items-center justify-center text-secondary/40">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt || item.name}
                  width={56}
                  height={56}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-main text-xs truncate">{item.name}</p>
                <span className="font-bold text-main text-xs shrink-0">
                  {item.price.toLocaleString()} ETB
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {item.categoryName && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-background border border-border text-secondary">
                    {item.categoryName}
                  </span>
                )}
                {item.collectionName && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary-light text-primary border border-primary/20">
                    {item.collectionName}
                  </span>
                )}
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    item.available
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-secondary'
                  }`}
                >
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <p className="text-[10px] text-secondary/70 mt-1.5">
                Added {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
