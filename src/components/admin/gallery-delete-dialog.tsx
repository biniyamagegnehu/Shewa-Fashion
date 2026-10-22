'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { deleteGalleryItemAction } from '@/app/actions/gallery'

export interface GalleryItemToDelete {
  id: string
  title: string
  imageUrl: string
}

interface GalleryDeleteDialogProps {
  item: GalleryItemToDelete | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (deletedId: string) => void
}

export function GalleryDeleteDialog({
  item,
  isOpen,
  onClose,
  onSuccess,
}: GalleryDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalCardRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  // Focus management, Tab trapping, and Escape handling (WCAG 2.2 AA)
  useEffect(() => {
    if (!isOpen) return

    previousActiveElementRef.current = document.activeElement as HTMLElement | null

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isDeleting) {
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
  }, [isOpen, isDeleting, onClose])

  if (!isOpen || !item) return null

  async function handleDelete() {
    if (!item) return
    setIsDeleting(true)
    setError(null)

    try {
      const res = await deleteGalleryItemAction(item.id)
      if (res.success) {
        onSuccess(item.id)
        onClose()
      } else {
        setError(res.error || 'Failed to delete gallery item.')
      }
    } catch {
      setError('An unexpected error occurred while deleting.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        ref={modalCardRef}
        className="w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 id="delete-dialog-title" className="font-serif text-lg font-bold text-main">
              Delete Gallery Item
            </h2>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              Are you sure you want to remove this image from the editorial lookbook?
            </p>
          </div>
        </div>

        {/* Item preview card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-surface shrink-0 border border-border">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-secondary">
                No img
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-main truncate">{item.title}</p>
            <p className="text-xs text-secondary truncate mt-0.5">
              Associated image file will be safely removed if not shared by products.
            </p>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-border text-xs sm:text-sm font-medium text-secondary hover:text-main hover:bg-black/[0.03] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            id="confirm-delete-gallery-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Deleting...
              </>
            ) : (
              'Delete Item'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
