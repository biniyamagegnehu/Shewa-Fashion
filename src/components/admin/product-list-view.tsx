'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ProductDeleteDialog } from '@/components/admin/product-delete-dialog'

export interface ProductListItem {
  id: string
  name: string
  slug: string
  price: number
  available: boolean
  featured: boolean
  categoryName: string | null
  collectionName: string | null
  imageUrl: string | null
  imageAlt: string | null
  updatedAt: string
}

interface ProductListViewProps {
  products: ProductListItem[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  hasActiveFilters: boolean
}

export function ProductListView({
  products,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  hasActiveFilters,
}: ProductListViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  // Empty state handling
  if (products.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="bg-surface rounded-2xl border border-border p-8 sm:p-14 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-background border border-border flex items-center justify-center text-secondary">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg font-bold text-main">No matching products found</h3>
          <p className="text-sm text-secondary max-w-md mx-auto mt-1.5 leading-relaxed">
            No products match your current search and filter criteria. Try adjusting your search query or clearing your active filters.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-background text-sm font-semibold text-main transition-colors"
            >
              Clear All Filters
            </button>
            <Link
              href="/admin/products/new"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs transition-colors"
            >
              Add New Product
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-surface rounded-2xl border border-border p-8 sm:p-14 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center text-primary">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
        </div>
        <h3 className="font-serif text-lg font-bold text-main">Your catalogue is empty</h3>
        <p className="text-sm text-secondary max-w-md mx-auto mt-1.5 leading-relaxed">
          No products have been created in the database yet. Click below to add your first piece to the catalogue.
        </p>
        <div className="mt-6">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create First Product
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        {/* Results summary header */}
        <div className="px-5 py-4 border-b border-border bg-background/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-secondary">
          <div>
            Showing <span className="font-semibold text-main">{startItem}</span> to{' '}
            <span className="font-semibold text-main">{endItem}</span> of{' '}
            <span className="font-semibold text-main">{totalCount}</span> products
          </div>
          <div className="flex items-center gap-2">
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>

        {/* Desktop View: Full Responsive Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-background/70 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                <th scope="col" className="py-3 px-4">Product</th>
                <th scope="col" className="py-3 px-4">Category / Collection</th>
                <th scope="col" className="py-3 px-4">Price</th>
                <th scope="col" className="py-3 px-4">Status</th>
                <th scope="col" className="py-3 px-4">Updated</th>
                <th scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-primary-light/20 transition-colors group"
                >
                  {/* Product Column */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.imageAlt || product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-secondary/40 text-xs">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-medium text-main hover:text-primary transition-colors block truncate max-w-[220px]"
                          title={product.name}
                        >
                          {product.name}
                        </Link>
                        <p className="text-[11px] text-secondary font-mono truncate max-w-[200px]">
                          /{product.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category & Collection */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      {product.categoryName ? (
                        <span className="text-xs font-medium text-main bg-background border border-border px-2 py-0.5 rounded-md">
                          {product.categoryName}
                        </span>
                      ) : (
                        <span className="text-xs text-secondary/60 italic">Uncategorized</span>
                      )}
                      {product.collectionName && (
                        <span className="text-[11px] text-secondary">
                          Col: {product.collectionName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-medium text-main whitespace-nowrap">
                    {formatPrice(product.price)}
                  </td>

                  {/* Status & Badges */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      {product.available ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                          <span>Visible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                          <span>Hidden</span>
                        </span>
                      )}
                      {product.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent-hover border border-accent/30">
                          ★ Featured
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Updated At */}
                  <td className="py-3.5 px-4 text-xs text-secondary whitespace-nowrap">
                    {product.updatedAt}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-border text-secondary hover:text-main hover:bg-background transition-colors"
                        title="View in public catalogue"
                      >
                        <span className="sr-only">View public page</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </Link>

                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="px-2.5 py-1.5 rounded-lg bg-primary-light text-primary hover:bg-primary hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Edit
                      </Link>

                      <button
                        onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                        className="p-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 transition-colors"
                        title="Delete product"
                      >
                        <span className="sr-only">Delete product</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-border">
          {products.map((product) => (
            <div key={product.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-20 rounded-xl bg-background border border-border overflow-hidden shrink-0">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt || product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary/40 text-xs">
                      No Img
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="font-serif font-bold text-main hover:text-primary transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                  </div>
                  <p className="text-[11px] font-mono text-secondary truncate">
                    /{product.slug}
                  </p>
                  <p className="text-sm font-semibold text-main mt-1">
                    {formatPrice(product.price)}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {product.available ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Visible
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Hidden
                      </span>
                    )}

                    {product.featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent-hover border border-accent/30">
                        ★ Featured
                      </span>
                    )}

                    {product.categoryName && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-background border border-border text-secondary">
                        {product.categoryName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                <span className="text-[11px] text-secondary">
                  Updated {product.updatedAt}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-border text-secondary hover:text-main"
                    title="View public"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </Link>

                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="px-3 py-1.5 rounded-lg bg-primary-light text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                    className="p-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-5 border-t border-border bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-secondary text-center sm:text-left">
              Page <span className="font-semibold text-main">{currentPage}</span> of{' '}
              <span className="font-semibold text-main">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
                aria-disabled={currentPage <= 1}
                className={`px-3 py-1.5 rounded-lg border border-border font-medium flex items-center gap-1 transition-colors ${
                  currentPage <= 1
                    ? 'opacity-40 pointer-events-none text-secondary'
                    : 'text-main hover:bg-background'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                Previous
              </Link>

              {/* Page indicator pills */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // Only show current page, 1, last, and immediate neighbors
                  if (
                    p === 1 ||
                    p === totalPages ||
                    (p >= currentPage - 1 && p <= currentPage + 1)
                  ) {
                    return (
                      <Link
                        key={p}
                        href={createPageUrl(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                          p === currentPage
                            ? 'bg-primary text-white'
                            : 'text-secondary hover:text-main hover:bg-background'
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  }
                  if (p === 2 && currentPage > 3) {
                    return <span key={p} className="text-secondary/50 px-0.5">...</span>
                  }
                  if (p === totalPages - 1 && currentPage < totalPages - 2) {
                    return <span key={p} className="text-secondary/50 px-0.5">...</span>
                  }
                  return null
                })}
              </div>

              <Link
                href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
                aria-disabled={currentPage >= totalPages}
                className={`px-3 py-1.5 rounded-lg border border-border font-medium flex items-center gap-1 transition-colors ${
                  currentPage >= totalPages
                    ? 'opacity-40 pointer-events-none text-secondary'
                    : 'text-main hover:bg-background'
                }`}
              >
                Next
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ProductDeleteDialog
          productId={deleteTarget.id}
          productName={deleteTarget.name}
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => {
            router.refresh()
          }}
        />
      )}
    </>
  )
}
