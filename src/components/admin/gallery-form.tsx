'use client'

import React, { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  createGalleryItemAction,
  updateGalleryItemAction,
  type GalleryActionState,
} from '@/app/actions/gallery'

export interface GalleryFormItem {
  id?: string
  title?: string
  imageUrl?: string
  alt?: string
  description?: string | null
  sortOrder?: number
  isPublished?: boolean
}

interface GalleryFormProps {
  initialData?: GalleryFormItem
  isEdit?: boolean
}

export function GalleryForm({ initialData, isEdit = false }: GalleryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<GalleryActionState>({})

  // Form field state
  const [title, setTitle] = useState(initialData?.title || '')
  const [alt, setAlt] = useState(initialData?.alt || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [sortOrder, setSortOrder] = useState<string>(
    initialData?.sortOrder !== undefined ? String(initialData.sortOrder) : '0'
  )
  const [isPublished, setIsPublished] = useState<boolean>(
    initialData?.isPublished !== undefined ? initialData.isPublished : true
  )
  const [directImageUrl, setDirectImageUrl] = useState(initialData?.imageUrl || '')

  // File upload state & preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageUrl || '')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      const objUrl = URL.createObjectURL(file)
      setPreviewUrl(objUrl)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      const objUrl = URL.createObjectURL(file)
      setPreviewUrl(objUrl)
    }
  }

  function handleRemoveImage() {
    setSelectedFile(null)
    setPreviewUrl('')
    setDirectImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function getFieldError(fieldName: string): string | undefined {
    return formState.errors?.find((e) => e.field === fieldName)?.message
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState({})

    const formData = new FormData()
    if (isEdit && initialData?.id) {
      formData.set('id', initialData.id)
    }
    formData.set('title', title)
    formData.set('alt', alt || title)
    formData.set('description', description)
    formData.set('sortOrder', sortOrder)
    formData.set('isPublished', isPublished ? 'true' : 'false')

    if (selectedFile) {
      formData.set('image', selectedFile)
    } else if (directImageUrl) {
      formData.set('imageUrl', directImageUrl)
    }

    startTransition(async () => {
      const action = isEdit ? updateGalleryItemAction : createGalleryItemAction
      const res = await action(undefined, formData)
      if (res.success) {
        router.push('/admin/gallery')
        router.refresh()
      } else {
        setFormState(res)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* General error alert */}
      {formState.error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {formState.error}
        </div>
      )}

      {/* Image Upload & Preview Card */}
      <div className="rounded-2xl bg-surface border border-border p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
            Lookbook Image <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-secondary">
            High-resolution photography showcasing garments, tailoring, or runway vignettes (JPEG, PNG, WebP, AVIF up to 5MB).
          </p>
        </div>

        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative aspect-4/3 sm:aspect-16/10 w-full rounded-xl overflow-hidden bg-background border border-border">
              <Image
                src={previewUrl}
                alt={title || 'Gallery image preview'}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-secondary truncate max-w-[260px]">
                {selectedFile ? selectedFile.name : directImageUrl ? 'URL image' : 'Saved image'}
              </span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-3 py-1.5 rounded-lg border border-border text-red-600 hover:bg-red-50 transition-colors"
              >
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-secondary/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleFileChange}
              className="hidden"
              id="gallery-file-input"
            />
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-main mb-1">
              Drag & drop an image here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-semibold"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-secondary">Supports JPG, PNG, WebP, AVIF up to 5MB</p>
          </div>
        )}

        {/* Fallback direct URL input */}
        <div className="pt-2 border-t border-border/80">
          <label htmlFor="imageUrl" className="block text-xs font-medium text-secondary mb-1">
            Or provide image URL directly:
          </label>
          <input
            id="imageUrl"
            type="text"
            value={directImageUrl}
            onChange={(e) => {
              setDirectImageUrl(e.target.value)
              if (!selectedFile) setPreviewUrl(e.target.value)
            }}
            placeholder="https://images.unsplash.com/... or storage URL"
            className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main"
          />
        </div>

        {getFieldError('image') && (
          <p className="text-xs text-red-600 mt-1">{getFieldError('image')}</p>
        )}
      </div>

      {/* Metadata Card */}
      <div className="rounded-2xl bg-surface border border-border p-5 sm:p-6 space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
            Title / Caption <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Habesha Modern Tailoring — Piazza Studio"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              getFieldError('title') ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {getFieldError('title') && (
            <p className="text-xs text-red-600 mt-1">{getFieldError('title')}</p>
          )}
        </div>

        {/* Alt text */}
        <div>
          <label htmlFor="alt" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
            Alt Text (Accessibility)
          </label>
          <input
            id="alt"
            name="alt"
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descriptive image text for screen readers (defaults to Title)"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-[11px] text-secondary mt-1">
            Leave blank to automatically use the title as the image alternative text.
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
            Editorial Story / Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional context about the fabric, weaving technique, or location."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
          {getFieldError('description') && (
            <p className="text-xs text-red-600 mt-1">{getFieldError('description')}</p>
          )}
        </div>

        {/* Two-column layout for Sort Order & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Sort order */}
          <div>
            <label htmlFor="sortOrder" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
              Display Order
            </label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              step={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[11px] text-secondary mt-1">
              Lower numbers display first in the public lookbook (0, 1, 2, ...).
            </p>
          </div>

          {/* Visibility toggle */}
          <div className="flex flex-col justify-center pt-2 sm:pt-0">
            <span className="block text-xs font-bold uppercase tracking-wider text-main mb-2">
              Publication Status
            </span>
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative" />
              <span className="text-xs font-medium text-main">
                {isPublished ? (
                  <span className="text-emerald-700 font-semibold">Published (Live)</span>
                ) : (
                  <span className="text-amber-700 font-semibold">Draft (Hidden)</span>
                )}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/admin/gallery"
          className="px-4 py-2.5 rounded-xl border border-border text-xs sm:text-sm font-semibold text-secondary hover:text-main hover:bg-black/[0.03] transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          id="save-gallery-item-btn"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving...
            </>
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Create Gallery Item'
          )}
        </button>
      </div>
    </form>
  )
}
