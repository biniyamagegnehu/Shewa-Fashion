'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CollectionDeleteDialog } from '@/components/admin/collection-delete-dialog'

interface CollectionItem {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  productCount: number
  createdAt: string
}

interface CollectionListClientProps {
  collections: CollectionItem[]
}

export function CollectionListClient({ collections }: CollectionListClientProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<CollectionItem | null>(null)

  if (collections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-10 sm:p-14 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4 text-primary">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
          </svg>
        </div>
        <p className="font-serif text-lg font-bold text-main">No collections yet</p>
        <p className="text-xs sm:text-sm text-secondary mt-1.5 mb-5 max-w-sm mx-auto">
          Create curated groupings like New Arrivals, Summer Trends, or Traditional specials.
        </p>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add First Collection
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Mobile cards (Touch optimized >=44px) */}
      <div className="sm:hidden space-y-3.5">
        {collections.map((col) => (
          <div key={col.id} className="bg-surface rounded-2xl border border-border p-4 sm:p-5 flex flex-col gap-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-serif font-bold text-base text-main truncate">{col.name}</p>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      col.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${col.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {col.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-secondary mt-0.5">/{col.slug}</p>
                {col.description && (
                  <p className="text-xs text-secondary mt-1.5 line-clamp-2 leading-relaxed">{col.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-light border border-primary/10 shrink-0">
                <span className="font-bold text-xs text-primary">{col.productCount}</span>
                <span className="text-[11px] text-primary/70">items</span>
              </div>
            </div>

            {/* Mobile Actions: Touch-friendly min 44px */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/70">
              <Link
                href={`/admin/collections/${col.id}/edit`}
                className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 shadow-xs transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
                Edit
              </Link>
              <Link
                href={`/collections/${col.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 w-11 inline-flex items-center justify-center rounded-xl border border-border text-secondary hover:text-primary hover:border-primary/40 hover:bg-background active:scale-95 transition-all"
                title="View public page"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(col)}
                className="h-11 w-11 inline-flex items-center justify-center rounded-xl border border-error/30 text-error hover:bg-error/10 active:scale-95 transition-all"
                title="Delete collection"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table (TailAdmin Style) */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/70">
              <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-secondary">Name / Slug</th>
              <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-secondary hidden md:table-cell">Description</th>
              <th className="text-center px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-secondary">Products</th>
              <th className="text-center px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-secondary">Status</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {collections.map((col) => (
              <tr key={col.id} className="hover:bg-primary-light/20 transition-colors">
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/collections/${col.id}/edit`}
                    className="font-semibold text-main hover:text-primary transition-colors text-sm"
                  >
                    {col.name}
                  </Link>
                  <p className="text-[11px] font-mono text-secondary mt-0.5">/{col.slug}</p>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  {col.description ? (
                    <p className="text-xs text-secondary line-clamp-2 max-w-xs">{col.description}</p>
                  ) : (
                    <span className="text-xs text-secondary/40 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-light border border-primary/10 text-xs font-semibold text-primary">
                    {col.productCount}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      col.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${col.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {col.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/collections/${col.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View public page"
                      className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-background border border-border transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/collections/${col.id}/edit`}
                      title="Edit collection"
                      className="px-3 py-1.5 rounded-xl bg-primary-light text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(col)}
                      title="Delete collection"
                      className="p-2 rounded-xl border border-error/30 text-error hover:bg-error/10 transition-colors"
                    >
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

      {deleteTarget && (
        <CollectionDeleteDialog
          collectionId={deleteTarget.id}
          collectionName={deleteTarget.name}
          productCount={deleteTarget.productCount}
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
