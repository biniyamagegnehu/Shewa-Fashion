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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        ref={modalCardRef}
        className="w-full max-w-md rounded-3xl bg-surface border border-border p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 id="delete-dialog-title" className="font-serif text-xl font-bold text-main">
              Delete Gallery Item
            </h2>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              Are you sure you want to remove this image from the editorial lookbook?
            </p>
          </div>
        </div>

        {/* Item preview card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-background border border-border">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface shrink-0 border border-border">
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
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Actions: Minimum 44px height for mobile */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto h-11 px-5 rounded-xl border border-border text-xs sm:text-sm font-semibold text-secondary hover:text-main hover:bg-background active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            id="confirm-delete-gallery-btn"
            className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Deleting…</span>
              </>
            ) : (
              <span>Delete Image</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
