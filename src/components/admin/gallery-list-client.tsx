'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GalleryDeleteDialog, type GalleryItemToDelete } from './gallery-delete-dialog'

export interface GalleryListItem {
  id: string
  title: string
  imageUrl: string
  alt: string
  description: string | null
  sortOrder: number
  isPublished: boolean
  createdAt: string
}

interface GalleryListClientProps {
  initialItems: GalleryListItem[]
}

export function GalleryListClient({ initialItems }: GalleryListClientProps) {
  const [items, setItems] = useState<GalleryListItem[]>(initialItems)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [itemToDelete, setItemToDelete] = useState<GalleryItemToDelete | null>(null)

  function handleDeleteSuccess(deletedId: string) {
    setItems((prev) => prev.filter((item) => item.id !== deletedId))
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()))

    if (!matchesSearch) return false
    if (filter === 'published') return item.isPublished
    if (filter === 'draft') return !item.isPublished
    return true
  })

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input (44px touch height) */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lookbook by title or caption..."
            className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm rounded-xl border border-border bg-surface text-main placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-border self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`min-h-[38px] px-3.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary hover:text-main hover:bg-background'
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('published')}
            className={`min-h-[38px] px-3.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'published'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-secondary hover:text-main hover:bg-background'
            }`}
          >
            Published ({items.filter((i) => i.isPublished).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('draft')}
            className={`min-h-[38px] px-3.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'draft'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-secondary hover:text-main hover:bg-background'
            }`}
          >
            Drafts ({items.filter((i) => !i.isPublished).length})
          </button>
        </div>
      </div>

      {/* Gallery Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-surface border border-border space-y-3.5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 text-accent-gold flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h2 className="font-serif text-lg font-bold text-main">
            {search ? 'No matching images found' : 'No lookbook images yet'}
          </h2>
          <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto leading-relaxed">
            {search
              ? 'Try modifying your search query or switching filter tabs.'
              : 'Add editorial campaign photography to showcase your collections in the public lookbook.'}
          </p>
          {!search && (
            <div className="pt-2">
              <Link
                href="/admin/gallery/new"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add First Image
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-surface border border-border overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
            >
              {/* Image preview with status badges */}
              <div className="relative aspect-4/3 w-full bg-background overflow-hidden border-b border-border">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.alt || item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-secondary">
                    No image
                  </div>
                )}

                {/* Status Badges Overlay */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-xs backdrop-blur-md ${
                      item.isPublished
                        ? 'bg-emerald-600/90 text-white'
                        : 'bg-amber-600/90 text-white'
                    }`}
                  >
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/65 text-white backdrop-blur-md">
                    #{item.sortOrder}
                  </span>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-sm font-bold text-main line-clamp-1" title={item.title}>
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-xs text-secondary mt-1 line-clamp-2 leading-relaxed" title={item.description}>
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-secondary/50 italic mt-1">No description</p>
                  )}
                </div>

                {/* Card actions: Touch-friendly */}
                <div className="flex items-center justify-between pt-3 border-t border-border/80">
                  <span className="text-[11px] text-secondary font-mono">{item.createdAt}</span>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/gallery/${item.id}/edit`}
                      className="h-10 px-3 rounded-xl bg-primary-light text-primary hover:bg-primary hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition-all"
                      title="Edit item"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      <span>Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setItemToDelete({
                          id: item.id,
                          title: item.title,
                          imageUrl: item.imageUrl,
                        })
                      }
                      className="h-10 w-10 rounded-xl border border-error/30 text-error hover:bg-error/10 inline-flex items-center justify-center transition-colors"
                      title="Delete item"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <GalleryDeleteDialog
        item={itemToDelete}
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
