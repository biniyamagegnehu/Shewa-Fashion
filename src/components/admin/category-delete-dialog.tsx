'use client'

import React, { useState, useTransition, useEffect, useRef } from 'react'
import { deleteCategoryAction } from '@/app/actions/categories'

interface CategoryDeleteDialogProps {
  categoryId: string
  categoryName: string
  productCount: number
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CategoryDeleteDialog({
  categoryId,
  categoryName,
  productCount,
  isOpen,
  onClose,
  onSuccess,
}: CategoryDeleteDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const modalCardRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  // Focus management, Tab trapping, and Escape handling (WCAG 2.2 AA)
  useEffect(() => {
    if (!isOpen) return

    previousActiveElementRef.current = document.activeElement as HTMLElement | null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        onClose()
        return
      }

      if (e.key === 'Tab' && modalCardRef.current) {
        const focusables = modalCardRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return

        const firstElement = focusables[0]
        const lastElement = focusables[focusables.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    const timer = setTimeout(() => {
      const firstBtn = modalCardRef.current?.querySelector<HTMLElement>('button')
      firstBtn?.focus()
    }, 50)

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      previousActiveElementRef.current?.focus()
    }
  }, [isOpen, isPending, onClose])

  if (!isOpen) return null

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId)
      if (result.success) {
        onClose()
        if (onSuccess) onSuccess()
      } else {
        setError(result.error || 'Failed to delete category. Please try again.')
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cat-delete-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => { if (!isPending) onClose() }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalCardRef}
        className="relative w-full max-w-md bg-surface rounded-2xl border border-border shadow-2xl p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-200"
      >
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </div>

        <h3 id="cat-delete-dialog-title" className="font-serif text-lg sm:text-xl font-bold text-main">
          Delete Category
        </h3>

        <p className="text-xs sm:text-sm text-secondary mt-2 leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-main">&ldquo;{categoryName}&rdquo;</span>?
        </p>

        {productCount > 0 ? (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
            <strong>⚠ {productCount} product{productCount !== 1 ? 's' : ''} use this category.</strong>
            <br />
            Deleting it will unlink those products — they will become uncategorised but will{' '}
            <strong>not be deleted</strong>. You can re-assign them via the Products page.
          </div>
        ) : (
          <p className="text-xs text-secondary/80 mt-1.5 leading-relaxed">
            This category has no products. It will be permanently removed.
          </p>
        )}

        {error && (
          <div role="alert" className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-main hover:bg-black/[0.03] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Deleting…</span>
              </>
            ) : (
              <span>Delete Category</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
