'use client'

import React, { useActionState, useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ProductActionState } from '@/app/actions/products'

export interface CategoryOption {
  id: string
  name: string
  slug?: string
}

export interface ProductImageData {
  /** Undefined for images not yet in the DB (new uploads) */
  id?: string
  url: string
  alt?: string
}

export interface InitialProductData {
  id?: string
  name?: string
  description?: string
  price?: number
  categoryId?: string | null
  available?: boolean
  /** Multiple images — replaces old single imageUrl */
  images?: ProductImageData[]
  /** Legacy single-image field — still accepted for backwards compatibility */
  imageUrl?: string
  sizes?: string[]
}

interface ProductFormProps {
  initialData?: InitialProductData
  categories: CategoryOption[]
  action: (
    prevState: ProductActionState | undefined,
    formData: FormData
  ) => Promise<ProductActionState>
  submitLabel?: string
  isEdit?: boolean
}

// Standard Ethiopian apparel & universal sizes
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']

// Validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_IMAGES = 8

// ─── Image slot type ────────────────────────────────────────────────────────
/** Existing DB image waiting to be kept */
interface ExistingSlot {
  kind: 'existing'
  id: string
  url: string
  alt: string
}
/** Newly selected local file, not yet uploaded */
interface NewSlot {
  kind: 'new'
  index: number  // index in the newFiles array
  previewUrl: string
  file: File
}
type ImageSlot = ExistingSlot | NewSlot

export function ProductForm({
  initialData,
  categories,
  action,
  submitLabel = 'Save Product',
  isEdit = false,
}: ProductFormProps) {
  // ── Text field states ────────────────────────────────────────────────────
  const [name, setName] = useState(initialData?.name || '')
  const [price, setPrice] = useState(
    initialData?.price !== undefined ? String(initialData.price) : ''
  )
  const [description, setDescription] = useState(initialData?.description || '')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialData?.sizes || [])
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false)
  const [customSizeText, setCustomSizeText] = useState('')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [status, setStatus] = useState<'published' | 'draft'>(
    initialData?.available === false ? 'draft' : 'published'
  )

  // ── Multi-image state ────────────────────────────────────────────────────
  // Build initial slots from initialData
  const buildInitialSlots = (): ImageSlot[] => {
    const imgs = initialData?.images
    if (imgs && imgs.length > 0) {
      return imgs.map((img) =>
        img.id
          ? { kind: 'existing' as const, id: img.id, url: img.url, alt: img.alt || '' }
          : { kind: 'new' as const, index: 0, previewUrl: img.url, file: new File([], '') }
      )
    }
    // Legacy single imageUrl
    if (initialData?.imageUrl) {
      return [{ kind: 'existing' as const, id: '__legacy__', url: initialData.imageUrl, alt: '' }]
    }
    return []
  }

  const [slots, setSlots] = useState<ImageSlot[]>(buildInitialSlots)
  const slotsRef = useRef<ImageSlot[]>(slots)
  useEffect(() => {
    slotsRef.current = slots
  }, [slots])

  // Wrapped form action that appends all image files, keepImageIds, and imageOrder to FormData
  const wrappedAction = async (
    prevState: ProductActionState | undefined,
    formData: FormData
  ) => {
    const currentSlots = slotsRef.current

    // 1. Identify which existing images to keep
    const keepIds = currentSlots
      .filter((s): s is ExistingSlot => s.kind === 'existing' && s.id !== '__legacy__')
      .map((s) => s.id)
      .join(',')
    formData.set('keepImageIds', keepIds)

    // 2. Attach newly added image files as image_0, image_1, ...
    const newSlots = currentSlots.filter((s): s is NewSlot => s.kind === 'new')
    newSlots.forEach((slot, idx) => {
      formData.set(`image_${idx}`, slot.file)
    })

    // 3. Compute imageOrder tokens (e.g. "existing:abc,new:0,existing:def")
    const orderTokens = currentSlots.map((s) => {
      if (s.kind === 'existing') return `existing:${s.id}`
      const newIdx = newSlots.indexOf(s)
      return `new:${newIdx}`
    })
    formData.set('imageOrder', orderTokens.join(','))

    // 4. Legacy single image fallback if any
    const legacySlot = currentSlots.find(
      (s): s is ExistingSlot => s.kind === 'existing' && s.id === '__legacy__'
    )
    if (legacySlot) {
      formData.set('imageUrl', legacySlot.url)
    }

    return action(prevState, formData)
  }

  const [state, formAction, isPending] = useActionState(wrappedAction, undefined)
  const [newFiles, setNewFiles] = useState<File[]>([])
  // Object URLs we created ourselves (for cleanup on unmount)
  const objectUrlsRef = useRef<string[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup all created object URLs on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const urls = objectUrlsRef.current
      for (const url of urls) {
        URL.revokeObjectURL(url)
      }
    }
  }, [])

  // ── Image processing ─────────────────────────────────────────────────────
  const processFiles = useCallback((files: FileList | File[]) => {
    setImageError(null)
    const fileArr = Array.from(files)

    if (slots.length + fileArr.length > MAX_IMAGES) {
      setImageError(`You can upload a maximum of ${MAX_IMAGES} images per product.`)
      return
    }

    const validFiles: File[] = []
    for (const file of fileArr) {
      if (file.size > MAX_FILE_SIZE) {
        setImageError(`"${file.name}" exceeds the 5 MB limit. Please choose a smaller file.`)
        return
      }
      if (!VALID_TYPES.includes(file.type)) {
        setImageError(`"${file.name}" is not a supported format. Use JPEG, PNG, WebP, or AVIF.`)
        return
      }
      validFiles.push(file)
    }

    setNewFiles((prev) => {
      const nextFiles = [...prev, ...validFiles]
      const newSlots: NewSlot[] = validFiles.map((file, localIdx) => {
        const previewUrl = URL.createObjectURL(file)
        objectUrlsRef.current.push(previewUrl)
        return {
          kind: 'new' as const,
          index: prev.length + localIdx,
          previewUrl,
          file,
        }
      })
      setSlots((prevSlots) => [...prevSlots, ...newSlots])
      return nextFiles
    })
  }, [slots.length])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      e.target.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const removeSlot = (idx: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== idx))
    setImageError(null)
  }

  const moveSlot = (from: number, to: number) => {
    if (to < 0 || to >= slots.length) return
    setSlots((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  // Derived values for hidden inputs
  const keepImageIds = slots
    .filter((s): s is ExistingSlot => s.kind === 'existing' && s.id !== '__legacy__')
    .map((s) => s.id)
    .join(',')

  const newSlots = slots.filter((s): s is NewSlot => s.kind === 'new')
  const imageOrder = slots
    .map((s) => {
      if (s.kind === 'existing') return `existing:${s.id}`
      const newIdx = newSlots.indexOf(s)
      return `new:${newIdx}`
    })
    .join(',')

  // ── Size helpers ─────────────────────────────────────────────────────────
  const toggleSize = (sizeValue: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeValue) ? prev.filter((s) => s !== sizeValue) : [...prev, sizeValue]
    )
  }

  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = customSizeText.trim()
    if (!trimmed) return
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed])
    }
    setCustomSizeText('')
    setShowCustomSizeInput(false)
  }

  const getFieldError = (fieldName: string) => {
    return state?.errors?.find((err) => err.field === fieldName)?.message
  }

  const imageErrorMessage = imageError || getFieldError('image')

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Top Navigation & Header */}
      <div className="mb-5 sm:mb-6">
        <Link
          href="/admin/products"
          id="back-to-products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-main transition-colors mb-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-1 -ml-1 py-0.5"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span>Back to products</span>
        </Link>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-main tracking-tight">
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1 leading-relaxed">
          {isEdit
            ? 'Update product details, images, or catalogue visibility below.'
            : 'Fill in the product details and upload images to add to your catalogue.'}
        </p>
      </div>

      {/* Global Action Error Banner */}
      {state?.error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-2xs"
        >
          <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span className="leading-snug font-medium">{state.error}</span>
        </div>
      )}

      {/* Single Compact Form Card */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <form action={formAction} noValidate className="p-5 sm:p-7 space-y-5 sm:space-y-6">

          {/* ================================================================
              FIELD 1: PRODUCT NAME
             ================================================================ */}
          <div>
            <label htmlFor="product-name" className="block text-xs font-semibold uppercase tracking-wider text-main mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              id="product-name"
              name="name"
              type="text"
              required
              disabled={isPending}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(getFieldError('name'))}
              aria-describedby={getFieldError('name') ? 'product-name-error' : undefined}
              placeholder="e.g. Habesha Kemis — Hand-Woven Silk"
              className={`w-full h-11 px-3.5 rounded-xl border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                getFieldError('name')
                  ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                  : 'border-border'
              }`}
            />
            {getFieldError('name') && (
              <p id="product-name-error" className="mt-1.5 text-xs text-red-600 font-medium">
                {getFieldError('name')}
              </p>
            )}
          </div>

          {/* ================================================================
              FIELD 2: PRICE
             ================================================================ */}
          <div>
            <label htmlFor="product-price" className="block text-xs font-semibold uppercase tracking-wider text-main mb-1.5">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="product-price"
                name="price"
                type="number"
                min="1"
                step="1"
                required
                disabled={isPending}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={Boolean(getFieldError('price'))}
                aria-describedby={getFieldError('price') ? 'product-price-error' : undefined}
                placeholder="3500"
                className={`w-full h-11 pl-3.5 pr-14 rounded-xl border bg-background text-main text-sm font-semibold transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  getFieldError('price')
                    ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                    : 'border-border'
                }`}
              />
              <span className="absolute right-3.5 text-xs font-bold text-secondary select-none">ETB</span>
            </div>
            <p className="text-[11px] text-secondary mt-1">Amount in Ethiopian Birr (ETB full Birr integer).</p>
            {getFieldError('price') && (
              <p id="product-price-error" className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('price')}</p>
            )}
          </div>

          {/* ================================================================
              FIELD 3: IMAGES (Multi-image uploader)
             ================================================================ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-main">
                Photos {!isEdit && <span className="text-red-500">*</span>}
                <span className="text-[11px] text-secondary font-normal lowercase ml-1">
                  ({slots.length}/{MAX_IMAGES})
                </span>
              </label>
              {isEdit && slots.length === 0 && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                  At least 1 image required
                </span>
              )}
            </div>

            {/* Hidden fields for server action */}
            {newFiles.map((file, idx) => (
              <input
                key={idx}
                type="file"
                name={`image_${idx}`}
                className="sr-only"
                ref={(el) => {
                  if (el) {
                    // Programmatically attach the file to this hidden input
                    const dt = new DataTransfer()
                    dt.items.add(file)
                    el.files = dt.files
                  }
                }}
                readOnly
              />
            ))}
            <input type="hidden" name="keepImageIds" value={keepImageIds} />
            <input type="hidden" name="imageOrder" value={imageOrder} />

            {/* Image Grid Preview */}
            {slots.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-3">
                {slots.map((slot, idx) => (
                  <div
                    key={
                      slot.kind === 'existing'
                        ? slot.id
                        : `new-${slot.index}`
                    }
                    className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-background"
                  >
                    <Image
                      src={slot.kind === 'existing' ? slot.url : slot.previewUrl}
                      alt={slot.kind === 'existing' ? slot.alt || 'Product image' : slot.file.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />

                    {/* Primary badge */}
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 z-10 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-white shadow-xs pointer-events-none">
                        Main
                      </span>
                    )}

                    {/* Prominent "X" button to remove this single image */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSlot(idx)
                      }}
                      className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label="Remove image"
                      title="Remove image"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end justify-center pb-2 gap-1 opacity-0 group-hover:opacity-100">
                      {/* Move left */}
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveSlot(idx, idx - 1)}
                          className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-main flex items-center justify-center shadow-xs transition-colors"
                          title="Move left"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                          </svg>
                        </button>
                      )}
                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeSlot(idx)}
                        className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs transition-colors"
                        title="Remove image"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {/* Move right */}
                      {idx < slots.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveSlot(idx, idx + 1)}
                          className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-main flex items-center justify-center shadow-xs transition-colors"
                          title="Move right"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add more slot (if below max) */}
                {slots.length < MAX_IMAGES && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary bg-background hover:bg-primary-light/30 transition-all flex flex-col items-center justify-center gap-1 text-secondary hover:text-primary group"
                    title="Add more photos"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-[10px] font-semibold">Add</span>
                  </button>
                )}
              </div>
            )}

            {/* Drop Zone (shown when no images OR to add more) */}
            {slots.length === 0 && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed cursor-pointer transition-all p-6 sm:p-8 text-center flex flex-col items-center gap-2.5 ${
                  dragOver
                    ? 'border-primary bg-primary-light/20 ring-2 ring-primary/20'
                    : imageErrorMessage
                    ? 'border-red-400 bg-red-50/10'
                    : 'border-border bg-background/50 hover:border-primary hover:bg-primary-light/10'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-main">Drop photos here</span>
                  <p className="text-[11px] text-secondary mt-0.5">
                    or tap to select from your gallery or files
                  </p>
                </div>
                <span className="text-[11px] text-secondary/70">
                  JPEG, PNG, WebP, AVIF • Max 5 MB each • Up to {MAX_IMAGES} photos
                </span>
              </div>
            )}

            {/* Add more button (shown when slots exist but below max) */}
            {slots.length > 0 && slots.length < MAX_IMAGES && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-xl border border-dashed transition-all px-4 py-2.5 flex items-center gap-2 text-xs font-medium ${
                  dragOver
                    ? 'border-primary bg-primary-light/20 text-primary'
                    : 'border-border text-secondary'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Drop more photos here, or use the + tile above</span>
              </div>
            )}

            {/* Hidden real file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={isPending}
              onChange={handleFileInputChange}
              className="sr-only"
              aria-label="Select product photos"
            />

            {imageErrorMessage && (
              <p className="mt-2 text-xs text-red-600 font-medium">{imageErrorMessage}</p>
            )}

            {slots.length > 1 && (
              <p className="mt-1.5 text-[11px] text-secondary">
                Hover a photo to reorder or remove it. The first photo is shown as the main image.
              </p>
            )}
          </div>

          {/* ================================================================
              FIELD 4: DESCRIPTION
             ================================================================ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="product-description" className="block text-xs font-semibold uppercase tracking-wider text-main">
                Description <span className="text-[11px] text-secondary font-normal lowercase">(optional)</span>
              </label>
              <span className="text-[11px] text-secondary">{description.length}/3000</span>
            </div>
            <textarea
              id="product-description"
              name="description"
              rows={3}
              disabled={isPending}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={Boolean(getFieldError('description'))}
              aria-describedby={getFieldError('description') ? 'product-desc-error' : undefined}
              placeholder="Describe fabric, embroidery, tailoring, or styling notes (optional)..."
              className={`w-full p-3 rounded-xl border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y ${
                getFieldError('description')
                  ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                  : 'border-border'
              }`}
            />
            {getFieldError('description') && (
              <p id="product-desc-error" className="mt-1.5 text-xs text-red-600 font-medium">
                {getFieldError('description')}
              </p>
            )}
          </div>

          {/* ================================================================
              FIELD 5: SIZE (Compact multi-select chip group)
             ================================================================ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-main">
                Size <span className="text-[11px] text-secondary font-normal lowercase">(optional)</span>
              </label>
              {selectedSizes.length > 0 && (
                <span className="text-[11px] text-secondary font-medium">
                  {selectedSizes.length} selected
                </span>
              )}
            </div>

            <input type="hidden" name="sizes" value={selectedSizes.join(',')} />

            <div className="flex flex-wrap gap-2 pt-0.5">
              {STANDARD_SIZES.map((sz) => {
                const isSelected = selectedSizes.includes(sz)
                return (
                  <button
                    key={sz}
                    type="button"
                    disabled={isPending}
                    onClick={() => toggleSize(sz)}
                    className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer select-none ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-background text-main border-border hover:border-primary/50'
                    }`}
                  >
                    {sz}
                  </button>
                )
              })}

              {selectedSizes
                .filter((sz) => !STANDARD_SIZES.includes(sz))
                .map((customSz) => (
                  <button
                    key={customSz}
                    type="button"
                    disabled={isPending}
                    onClick={() => toggleSize(customSz)}
                    className="h-9 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer bg-primary text-white border-primary shadow-xs flex items-center gap-1.5"
                  >
                    <span>{customSz}</span>
                    <span className="text-white/80 hover:text-white font-bold">×</span>
                  </button>
                ))}

              {showCustomSizeInput ? (
                <div className="inline-flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. 39 or 4-5Y"
                    value={customSizeText}
                    onChange={(e) => setCustomSizeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSize() }
                      else if (e.key === 'Escape') setShowCustomSizeInput(false)
                    }}
                    className="h-9 w-28 px-2.5 rounded-xl border border-primary bg-background text-main text-xs focus:outline-none"
                  />
                  <button type="button" onClick={() => handleAddCustomSize()} className="h-9 px-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors">Add</button>
                  <button type="button" onClick={() => setShowCustomSizeInput(false)} className="h-9 px-2 text-xs text-secondary hover:text-main">Cancel</button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowCustomSizeInput(true)}
                  className="h-9 px-3 rounded-xl text-xs font-medium text-secondary hover:text-main border border-dashed border-border hover:border-primary transition-colors flex items-center gap-1"
                >
                  <span>+</span>
                  <span>Custom</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-secondary mt-1.5">
              Select available sizes for this product, or leave blank if size does not apply.
            </p>
          </div>

          {/* ================================================================
              FIELD 6: CATEGORY
             ================================================================ */}
          <div>
            <label htmlFor="product-category" className="block text-xs font-semibold uppercase tracking-wider text-main mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            {categories.length > 0 ? (
              <select
                id="product-category"
                name="categoryId"
                required
                disabled={isPending}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-invalid={Boolean(getFieldError('categoryId'))}
                aria-describedby={getFieldError('categoryId') ? 'product-cat-error' : undefined}
                className={`w-full h-11 px-3 rounded-xl border bg-background text-main text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  getFieldError('categoryId')
                    ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                    : 'border-border'
                }`}
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                No categories found. Please create a category first.
              </div>
            )}
            {getFieldError('categoryId') && (
              <p id="product-cat-error" className="mt-1.5 text-xs text-red-600 font-medium">
                {getFieldError('categoryId')}
              </p>
            )}
          </div>

          {/* ================================================================
              FIELD 7: CATALOGUE VISIBILITY
             ================================================================ */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-main mb-1.5">
              Visibility <span className="text-red-500">*</span>
            </label>

            <input
              type="hidden"
              name="available"
              value={status === 'published' ? 'true' : 'false'}
            />

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-background border border-border">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setStatus('published')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  status === 'published'
                    ? 'bg-surface text-emerald-800 border border-emerald-300 shadow-2xs font-bold'
                    : 'text-secondary hover:text-main'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status === 'published' ? 'bg-emerald-500' : 'bg-secondary/40'}`} aria-hidden="true" />
                <span>Visible in catalogue</span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => setStatus('draft')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  status === 'draft'
                    ? 'bg-surface text-amber-800 border border-amber-300 shadow-2xs font-bold'
                    : 'text-secondary hover:text-main'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status === 'draft' ? 'bg-amber-500' : 'bg-secondary/40'}`} aria-hidden="true" />
                <span>Hidden from catalogue</span>
              </button>
            </div>

            <p className="text-[11px] text-secondary mt-1">
              {status === 'published'
                ? 'Shoppers can find and view this product on your website.'
                : 'This product is hidden. Only you can see it in the admin panel.'}
            </p>
          </div>

          {/* ================================================================
              SUBMIT BUTTON
             ================================================================ */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || slots.length === 0}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2.5 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving product…</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>{submitLabel}</span>
                </>
              )}
            </button>
            {slots.length === 0 && !isPending && (
              <p className="text-center text-xs text-secondary mt-2">
                Add at least one photo before saving.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
