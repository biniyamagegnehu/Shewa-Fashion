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
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="search"
            name="q"
            defaultValue={currentQ}
            placeholder="Search products by name or description…"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-main text-xs sm:text-sm placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
          <svg
            className="w-4 h-4 text-secondary/60 absolute left-3.5 top-3 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-4 h-10 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors shrink-0 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          {isPending ? (
            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <span>Search</span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            className="px-3 h-10 rounded-xl border border-border text-xs font-semibold text-secondary hover:text-main hover:bg-black/[0.03] transition-colors shrink-0"
          >
            Clear
          </button>
        )}
      </form>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        {/* Category Filter */}
        <div>
          <label htmlFor="filter-category" className="sr-only">Category</label>
          <select
            id="filter-category"
            value={currentCategory}
            onChange={(e) => updateFilters({ category: e.target.value })}
            disabled={isPending}
            className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Collection Filter */}
        <div>
          <label htmlFor="filter-collection" className="sr-only">Collection</label>
          <select
            id="filter-collection"
            value={currentCollection}
            onChange={(e) => updateFilters({ collection: e.target.value })}
            disabled={isPending}
            className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50"
          >
            <option value="all">All Collections</option>
            {collections.map((col) => (
              <option key={col.id} value={col.slug}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div>
          <label htmlFor="filter-status" className="sr-only">Availability</label>
          <select
            id="filter-status"
            value={currentStatus}
            onChange={(e) => updateFilters({ status: e.target.value })}
            disabled={isPending}
            className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50"
          >
            <option value="all">All Status</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
          </select>
        </div>

        {/* Featured Filter */}
        <div>
          <label htmlFor="filter-featured" className="sr-only">Featured</label>
          <select
            id="filter-featured"
            value={currentFeatured}
            onChange={(e) => updateFilters({ featured: e.target.value })}
            disabled={isPending}
            className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50"
          >
            <option value="all">All Products</option>
            <option value="featured">Featured Only</option>
            <option value="standard">Standard Only</option>
          </select>
        </div>
      </div>
    </div>
  )
}
