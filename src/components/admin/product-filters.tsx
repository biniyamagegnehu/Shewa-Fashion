'use client'

import React, { useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export interface CategoryOption {
  id: string
  name: string
  slug: string
}

export interface CollectionOption {
  id: string
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories: CategoryOption[]
  collections: CollectionOption[]
}

export function ProductFilters({ categories, collections }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentQ = searchParams.get('q') || ''
  const currentCategory = searchParams.get('category') || 'all'
  const currentCollection = searchParams.get('collection') || 'all'
  const currentStatus = searchParams.get('status') || 'all'
  const currentFeatured = searchParams.get('featured') || 'all'

  const hasActiveFilters =
    Boolean(currentQ) ||
    currentCategory !== 'all' ||
    currentCollection !== 'all' ||
    currentStatus !== 'all' ||
    currentFeatured !== 'all'

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Reset pagination to page 1 whenever filters change
    params.set('page', '1')

    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === 'all' || val.trim() === '') {
        params.delete(key)
      } else {
        params.set(key, val.trim())
      }
    })

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('q') as string
    updateFilters({ q })
  }

  const handleClear = () => {
    startTransition(() => {
      router.push(pathname)
    })
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs space-y-4">
      {/* Search Input Bar - Touch optimized (44px) */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="search"
            name="q"
            defaultValue={currentQ}
            placeholder="Search products by title, slug, or keywords…"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-main text-sm placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <svg
            className="w-5 h-5 text-secondary/60 absolute left-3.5 top-3 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 sm:flex-none h-11 px-5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all shrink-0 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 shadow-xs"
          >
            {isPending ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            )}
            <span>Search</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className="h-11 px-4 rounded-xl border border-border text-xs sm:text-sm font-semibold text-secondary hover:text-main hover:bg-background active:scale-[0.98] transition-all shrink-0 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              <span>Clear</span>
            </button>
          )}
        </div>
      </form>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        {/* Category Filter */}
        <div className="relative">
          <label htmlFor="filter-category" className="sr-only">Category</label>
          <select
            id="filter-category"
            value={currentCategory}
            onChange={(e) => updateFilters({ category: e.target.value })}
            disabled={isPending}
            className="w-full h-10 px-3 pr-8 rounded-xl border border-border bg-background text-main text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 cursor-pointer appearance-none"
          >
            <option value="all">📁 All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Collection Filter */}
        <div className="relative">
          <label htmlFor="filter-collection" className="sr-only">Collection</label>
          <select
            id="filter-collection"
            value={currentCollection}
            onChange={(e) => updateFilters({ collection: e.target.value })}
            disabled={isPending}
            className="w-full h-10 px-3 pr-8 rounded-xl border border-border bg-background text-main text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 cursor-pointer appearance-none"
          >
            <option value="all">🏷️ All Collections</option>
            {collections.map((col) => (
              <option key={col.id} value={col.slug}>
                {col.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Availability Filter */}
        <div className="relative">
          <label htmlFor="filter-status" className="sr-only">Visibility</label>
          <select
            id="filter-status"
            value={currentStatus}
            onChange={(e) => updateFilters({ status: e.target.value })}
            disabled={isPending}
            className="w-full h-10 px-3 pr-8 rounded-xl border border-border bg-background text-main text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 cursor-pointer appearance-none"
          >
            <option value="all">👁️ All Visibility</option>
            <option value="available">🟢 Visible in shop</option>
            <option value="unavailable">⚪ Hidden from shop</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Featured Filter */}
        <div className="relative">
          <label htmlFor="filter-featured" className="sr-only">Featured Status</label>
          <select
            id="filter-featured"
            value={currentFeatured}
            onChange={(e) => updateFilters({ featured: e.target.value })}
            disabled={isPending}
            className="w-full h-10 px-3 pr-8 rounded-xl border border-border bg-background text-main text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 cursor-pointer appearance-none"
          >
            <option value="all">⭐ All Products</option>
            <option value="featured">★ Featured only</option>
            <option value="standard">Standard only</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
