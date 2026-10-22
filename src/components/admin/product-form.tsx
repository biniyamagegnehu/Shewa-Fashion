'use client'

import React, { useActionState, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ProductActionState } from '@/app/actions/products'

export interface CategoryOption {
  id: string
  name: string
  slug?: string
}

export interface InitialProductData {
  id?: string
  name?: string
  description?: string
  price?: number
  categoryId?: string | null
  available?: boolean
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

export function ProductForm({
  initialData,
  categories,
  action,
  submitLabel = 'Save Product',
  isEdit = false,
}: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined)

  // 1. Product Name state
  const [name, setName] = useState(initialData?.name || '')

  // 2. Price state
  const [price, setPrice] = useState(
    initialData?.price !== undefined ? String(initialData.price) : ''
  )

  // 3. Image Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageUrl || '')
  const [clientImageError, setClientImageError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentObjectUrlRef = useRef<string | null>(null)

  // Revoke any created object URL on unmount
  useEffect(() => {
    return () => {
      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current)
      }
    }
  }, [])

  // 4. Description state
  const [description, setDescription] = useState(initialData?.description || '')

  // 5. Size Selection state (multi-select chip group)
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialData?.sizes || [])
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false)
  const [customSizeText, setCustomSizeText] = useState('')

  // 6. Category state
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')

  // 7. Catalogue Status state ('published' | 'draft')
  const [status, setStatus] = useState<'published' | 'draft'>(
    initialData?.available === false ? 'draft' : 'published'
  )

  // Process selected file (used by both input change and drag & drop)
  const processSelectedFile = (file: File) => {
    // Client-side quick size guard (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setClientImageError('Image file exceeds the 5 MB limit. Please select a smaller photo.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Client-side quick MIME check
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!validTypes.includes(file.type)) {
      setClientImageError('Unsupported format. Please select a JPEG, PNG, WebP, or AVIF image.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current)
    }

    const objectUrl = URL.createObjectURL(file)
    currentObjectUrlRef.current = objectUrl
    setSelectedFile(file)
    setPreviewUrl(objectUrl)
    setClientImageError(null)
  }

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processSelectedFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processSelectedFile(file)
    }
  }

  const handleRemoveSelectedFile = () => {
    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current)
      currentObjectUrlRef.current = null
    }
    setSelectedFile(null)
    setClientImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setPreviewUrl(initialData?.imageUrl || '')
  }

  // Toggle size chip selection
  const toggleSize = (sizeValue: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeValue) ? prev.filter((s) => s !== sizeValue) : [...prev, sizeValue]
    )
  }

  // Add custom size (e.g. shoe size 39 or kids 4-5Y)
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

  const imageErrorMessage = clientImageError || getFieldError('image')

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
            ? 'Update the product details, image, or catalogue visibility below.'
            : 'Enter product details and upload an image to save to the catalogue.'}
        </p>
      </div>

      {/* Global Action Error Banner */}
      {state?.error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-2xs"
        >
          <svg
            className="w-5 h-5 shrink-0 mt-0.5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          <span className="leading-snug font-medium">{state.error}</span>
        </div>
      )}

      {/* Single Compact Form Card */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <form action={formAction} noValidate className="p-5 sm:p-7 space-y-5 sm:space-y-6">
          {/* ========================================================
              FIELD 1: PRODUCT NAME (Required text input)
             ======================================================== */}
          <div>
            <label
              htmlFor="product-name"
              className="block text-xs font-semibold uppercase tracking-wider text-main mb-1.5"
            >
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
              placeholder="e.g. Shewa Silk Kemis"
              className={`w-full h-11 px-3.5 rounded-xl border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                getFieldError('name')
                  ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                  : 'border-border'
              }`}
            />
            {getFieldError('name') && (
              <p id="product-name-error" className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('name')}</p>
            )}
          </div>

          {/* ========================================================
              FIELD 2: PRICE (Required numeric input in ETB)
             ======================================================== */}
          <div>
            <label
              htmlFor="product-price"
              className="block text-xs font-semibold uppercase tracking-wider text-main mb-1.5"
            >
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
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
              <span className="absolute right-3.5 text-xs font-bold text-secondary select-none">
                ETB
              </span>
            </div>
            <p className="text-[11px] text-secondary mt-1">
              Amount in Ethiopian Birr (ETB full Birr integer).
            </p>
            {getFieldError('price') && (
              <p id="product-price-error" className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('price')}</p>
            )}
          </div>

          {/* ========================================================
              FIELD 3: IMAGE (Required file upload / current preview)
             ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="product-image-input"
                className="block text-xs font-semibold uppercase tracking-wider text-main cursor-pointer"
              >
                Image {isEdit ? '' : <span className="text-red-500">*</span>}
              </label>
              {isEdit && !selectedFile && previewUrl && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  Current image saved
                </span>
              )}
            </div>

            {/* Hidden native file input for mobile & desktop */}
            <input
              ref={fileInputRef}
              id="product-image-input"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={isPending}
              onChange={handleFileChange}
              className="sr-only"
            />

            {/* Image Upload Area & Preview Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-xl border transition-all ${
                dragActive
                  ? 'border-primary ring-2 ring-primary/20 bg-primary-light/20'
                  : imageErrorMessage
                  ? 'border-red-500 bg-red-50/10'
                  : 'border-border bg-background/50 hover:bg-background'
              }`}
            >
              {previewUrl ? (
                /* Preview State (shows selected file or current saved image) */
                <div className="p-3.5 flex flex-col sm:flex-row items-center gap-3.5">
                  <div className="relative w-24 h-24 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border border-border bg-black/5">
                    <Image
                      src={previewUrl}
                      alt="Product preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                    <p className="text-xs font-semibold text-main truncate max-w-xs">
                      {selectedFile ? selectedFile.name : 'Saved product image'}
                    </p>
                    <p className="text-[11px] text-secondary">
                      {selectedFile
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                        : 'Image is stored in catalogue'}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors px-2.5 py-1 rounded-md hover:bg-primary-light"
                      >
                        {selectedFile ? 'Change File' : 'Replace Image'}
                      </button>
                      {selectedFile && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={handleRemoveSelectedFile}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
                        >
                          {isEdit ? 'Revert' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Upload State: tap anywhere to choose image */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 sm:p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 select-none"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary mb-0.5">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.75}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-main hover:border-primary transition-colors shadow-2xs">
                      Choose Image
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary">
                    Tap to select from phone gallery or files (PNG, JPG, WebP, max 5 MB).
                  </p>
                </div>
              )}
            </div>

            {imageErrorMessage && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{imageErrorMessage}</p>
            )}
          </div>

          {/* ========================================================
              FIELD 4: DESCRIPTION (Optional multiline text area)
             ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="product-description"
                className="block text-xs font-semibold uppercase tracking-wider text-main"
              >
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

          {/* ========================================================
              FIELD 5: SIZE (Compact multi-select chip group)
             ======================================================== */}
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

            {/* Hidden field passing selected sizes to Server Action */}
            <input type="hidden" name="sizes" value={selectedSizes.join(',')} />

            {/* Chip Selection Group */}
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

              {/* Any active custom sizes outside standard list */}
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

              {/* Add Custom Size Button / Input */}
              {showCustomSizeInput ? (
                <div className="inline-flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. 39 or 4-5Y"
                    value={customSizeText}
                    onChange={(e) => setCustomSizeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomSize()
                      } else if (e.key === 'Escape') {
                        setShowCustomSizeInput(false)
                      }
                    }}
                    className="h-9 w-28 px-2.5 rounded-xl border border-primary bg-background text-main text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomSize()}
                    className="h-9 px-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomSizeInput(false)}
                    className="h-9 px-2 text-xs text-secondary hover:text-main"
                  >
                    Cancel
                  </button>
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

          {/* ========================================================
              FIELD 6: CATEGORY (Required dropdown from database)
             ======================================================== */}
          <div>
            <label
              htmlFor="product-category"
              className="block text-xs font-semibold uppercase tracking-wider text-main mb-1.5"
            >
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
                No categories found in the database. Please seed or create categories first.
              </div>
            )}
            {getFieldError('categoryId') && (
              <p id="product-cat-error" className="mt-1.5 text-xs text-red-600 font-medium">
                {getFieldError('categoryId')}
              </p>
            )}
          </div>

          {/* ========================================================
              FIELD 7: CATALOGUE STATUS (Segmented status control)
             ======================================================== */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-main mb-1.5">
              Visibility <span className="text-red-500">*</span>
            </label>

            {/* Hidden field for Server Action: available="true" | "false" */}
            <input
              type="hidden"
              name="available"
              value={status === 'published' ? 'true' : 'false'}
            />

            {/* Accessible Segmented Control: Visible vs Hidden */}
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
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === 'published' ? 'bg-emerald-500' : 'bg-secondary/40'
                  }`}
                  aria-hidden="true"
                />
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
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === 'draft' ? 'bg-amber-500' : 'bg-secondary/40'
                  }`}
                  aria-hidden="true"
                />
                <span>Hidden from catalogue</span>
              </button>
            </div>

            <p className="text-[11px] text-secondary mt-1">
              {status === 'published'
                ? 'Shoppers can find and view this product on your website.'
                : 'This product is hidden. Only you can see it in the admin panel.'}
            </p>
          </div>

          {/* ========================================================
              BOTTOM ACTIONS (Primary Save + Secondary Cancel)
             ======================================================== */}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <button
              type="submit"
              disabled={isPending}
              id="submit-product-btn"
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{submitLabel}</span>
              )}
            </button>

            <Link
              href="/admin/products"
              id="cancel-product-btn"
              className="w-full h-10 rounded-xl hover:bg-black/[0.03] text-secondary hover:text-main text-xs font-medium transition-colors flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
