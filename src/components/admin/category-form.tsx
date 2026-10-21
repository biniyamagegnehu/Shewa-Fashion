'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import type { CategoryActionState } from '@/app/actions/categories'

export interface CategoryFormProps {
  initialData?: {
    id?: string
    name?: string
    description?: string | null
    isActive?: boolean
  }
  action: (
    prevState: CategoryActionState | undefined,
    formData: FormData
  ) => Promise<CategoryActionState>
  submitLabel?: string
  isEdit?: boolean
}

export function CategoryForm({
  initialData,
  action,
  submitLabel = 'Save Category',
  isEdit = false,
}: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined)

  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isActive, setIsActive] = useState(initialData?.isActive !== false)

  function getFieldError(field: string): string | undefined {
    return state?.errors?.find((e) => e.field === field)?.message
  }

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      {/* Global error */}
      {state?.error && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* ── Name ── */}
      <div>
        <label
          htmlFor="category-name"
          className="block text-xs font-semibold uppercase tracking-wider text-main mb-1.5"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="category-name"
          name="name"
          type="text"
          required
          autoFocus={!isEdit}
          maxLength={80}
          disabled={isPending}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Women, Men, Kids, Accessories…"
          className={`w-full h-11 px-3.5 rounded-xl border bg-background text-main text-sm placeholder:text-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            getFieldError('name')
              ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
              : 'border-border'
          }`}
        />
        {getFieldError('name') && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('name')}</p>
        )}
      </div>

      {/* ── Description ── */}
      <div>
        <label
          htmlFor="category-description"
          className="block text-xs font-semibold uppercase tracking-wider text-main mb-1.5"
        >
          Description <span className="text-secondary font-normal">(optional)</span>
        </label>
        <textarea
          id="category-description"
          name="description"
          rows={3}
          maxLength={500}
          disabled={isPending}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description shown on the public categories page…"
          className={`w-full px-3.5 py-2.5 rounded-xl border bg-background text-main text-sm placeholder:text-secondary/50 resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            getFieldError('description')
              ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
              : 'border-border'
          }`}
        />
        <div className="flex items-center justify-between mt-1">
          {getFieldError('description') ? (
            <p className="text-xs text-red-600 font-medium">{getFieldError('description')}</p>
          ) : (
            <span />
          )}
          <span className="text-[11px] text-secondary">{description.length}/500</span>
        </div>
      </div>

      {/* ── Active Status (edit only) ── */}
      {isEdit && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-main mb-2">
            Visibility
          </label>
          <input type="hidden" name="isActive" value={isActive ? 'true' : 'false'} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsActive(true)}
              className={`flex-1 h-10 rounded-xl border text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-background border-border text-secondary hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              ✓ Active
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsActive(false)}
              className={`flex-1 h-10 rounded-xl border text-xs font-semibold transition-all ${
                !isActive
                  ? 'bg-amber-50 border-amber-400 text-amber-700'
                  : 'bg-background border-border text-secondary hover:border-amber-300 hover:text-amber-700'
              }`}
            >
              ○ Inactive
            </button>
          </div>
          <p className="text-[11px] text-secondary mt-1.5">
            Inactive categories are hidden from the public catalogue but not deleted.
          </p>
        </div>
      )}

      {/* ── Slug preview ── */}
      {name.trim() && (
        <div className="px-3.5 py-2.5 rounded-xl bg-background border border-border/70 text-xs text-secondary">
          <span className="font-medium text-main">Slug: </span>
          {name.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '') || '—'}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Saving…</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
        <Link
          href="/admin/categories"
          className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-main hover:bg-black/[0.03] transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
