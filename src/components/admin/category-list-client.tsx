'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CategoryDeleteDialog } from '@/components/admin/category-delete-dialog'

interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  productCount: number
  createdAt: string
}

interface CategoryListClientProps {
  categories: CategoryItem[]
}

export function CategoryListClient({ categories }: CategoryListClientProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null)

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
        </div>
        <p className="font-serif text-base font-bold text-main">No categories yet</p>
        <p className="text-xs text-secondary mt-1 mb-4">Create your first category to organise your products.</p>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add First Category
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-surface rounded-2xl border border-border p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-main truncate">{cat.name}</p>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                      cat.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-[11px] text-secondary mt-0.5">/{cat.slug}</p>
                {cat.description && (
                  <p className="text-xs text-secondary mt-1 line-clamp-2">{cat.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-light border border-primary/10 shrink-0">
                <span className="font-semibold text-xs text-primary">{cat.productCount}</span>
                <span className="text-[10px] text-primary/70">products</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <Link
                href={`/admin/categories/${cat.id}/edit`}
                className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-semibold text-main hover:bg-black/[0.03] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
                Edit
              </Link>
              <Link
                href={`/categories/${cat.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 inline-flex items-center justify-center rounded-xl border border-border text-xs text-secondary hover:text-primary hover:border-primary/40 transition-colors"
                title="View public page"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(cat)}
                className="h-9 px-3 inline-flex items-center justify-center rounded-xl border border-border text-xs text-secondary hover:text-red-600 hover:border-red-200 hover:bg-red-50/30 transition-colors"
                title="Delete category"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-secondary">Name / Slug</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-secondary hidden md:table-cell">Description</th>
              <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-secondary">Products</th>
              <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-secondary">Status</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-background/50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-main text-sm">{cat.name}</p>
                  <p className="text-[11px] text-secondary mt-0.5">/{cat.slug}</p>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  {cat.description ? (
                    <p className="text-xs text-secondary line-clamp-2 max-w-xs">{cat.description}</p>
                  ) : (
                    <span className="text-xs text-secondary/40 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-light border border-primary/10 text-xs font-semibold text-primary">
                    {cat.productCount}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                      cat.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/categories/${cat.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View public page"
                      className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-primary-light transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/categories/${cat.id}/edit`}
                      title="Edit category"
                      className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-primary-light transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cat)}
                      title="Delete category"
                      className="p-2 rounded-lg text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Delete Dialog */}
      {deleteTarget && (
        <CategoryDeleteDialog
          categoryId={deleteTarget.id}
          categoryName={deleteTarget.name}
          productCount={deleteTarget.productCount}
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => {
            setDeleteTarget(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
