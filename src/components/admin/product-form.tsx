'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { slugify, isValidImageUrl, ProductInput } from '@/lib/validation'
import type { ProductActionState } from '@/app/actions/products'
import type { CategoryOption, CollectionOption } from '@/components/admin/product-filters'

interface ProductFormProps {
  initialData?: Partial<ProductInput> & { id?: string }
  categories: CategoryOption[]
  collections: CollectionOption[]
  action: (prevState: ProductActionState | undefined, formData: FormData) => Promise<ProductActionState>
  submitLabel?: string
  isEdit?: boolean
}

export function ProductForm({
  initialData,
  categories,
  collections,
  action,
  submitLabel = 'Save Product',
  isEdit = false,
}: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined)

  // Local state for interactive enhancements
  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug))
  const [imageUrl, setImageUrl] = useState(initialData?.images?.[0]?.url || '')
  const [imageError, setImageError] = useState(false)

  // Options initial state
  const initialSizes = initialData?.options
    ?.filter((o) => o.type === 'SIZE' || o.type === 'SHOE_SIZE')
    .map((o) => o.value)
    .join(', ') || ''

  const initialColors = initialData?.options
    ?.filter((o) => o.type === 'COLOR')
    .map((o) => o.value)
    .join(', ') || ''

  const [sizes, setSizes] = useState(initialSizes)
  const [colors, setColors] = useState(initialColors)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    if (!slugTouched && !isEdit) {
      setSlug(slugify(newName))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true)
    setSlug(slugify(e.target.value))
  }

  const getFieldError = (fieldName: string) => {
    return state?.errors?.find((err) => err.field === fieldName)?.message
  }

  const isPreviewValid = Boolean(imageUrl && isValidImageUrl(imageUrl) && !imageError)

  return (
    <form action={formAction} noValidate className="space-y-6 sm:space-y-8">
      {/* Global Form Error Banner */}
      {state?.error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3"
        >
          <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span className="leading-snug">{state.error}</span>
        </div>
      )}

      {/* Grid: Main Column (left 2/3) + Sidebar Meta (right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Core Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Details */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-xs space-y-5">
            <h2 className="font-serif text-base sm:text-lg font-bold text-main border-b border-border pb-3">
              Basic Information
            </h2>

            {/* Product Name */}
            <div>
              <label htmlFor="product-name" className="block text-xs font-semibold uppercase tracking-wider text-main mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="product-name"
                name="name"
                type="text"
                required
                disabled={isPending}
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Abyssinian Structured Leather Tote"
                className={`w-full h-11 px-3.5 rounded-xl border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  getFieldError('name') ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                }`}
              />
              {getFieldError('name') && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('name')}</p>
              )}
            </div>

            {/* Product Slug */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="product-slug" className="block text-xs font-semibold uppercase tracking-wider text-main">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSlug(slugify(name))
                    setSlugTouched(false)
                  }}
                  className="text-[11px] text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Regenerate from Name
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs text-secondary/60 select-none">/shop/</span>
                <input
                  id="product-slug"
                  name="slug"
                  type="text"
                  required
                  disabled={isPending}
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="abyssinian-structured-leather-tote"
                  className={`w-full h-11 pl-16 pr-3.5 rounded-xl border bg-background text-main text-sm font-mono transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    getFieldError('slug') ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                  }`}
                />
              </div>
              {getFieldError('slug') && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('slug')}</p>
              )}
            </div>

            {/* Product Description */}
            <div>
              <label htmlFor="product-description" className="block text-xs font-semibold uppercase tracking-wider text-main mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="product-description"
                name="description"
                rows={5}
                required
                disabled={isPending}
                defaultValue={initialData?.description || ''}
                placeholder="Describe the fabric, heritage embroidery, design cut, and styling details…"
                className={`w-full p-3.5 rounded-xl border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y ${
                  getFieldError('description') ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                }`}
              />
              {getFieldError('description') && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('description')}</p>
              )}
            </div>
          </div>

          {/* Card: Media & Images */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-xs space-y-5">
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-main border-b border-border pb-3">
                Product Image
              </h2>
              <p className="text-xs text-secondary mt-1">
                Provide a secure web-accessible image URL. (Phase 15 will introduce file uploads).
              </p>
            </div>

            <div>
              <label htmlFor="product-imageUrl" className="block text-xs font-semibold uppercase tracking-wider text-main mb-2">
                Primary Image URL
              </label>
              <input
                id="product-imageUrl"
                name="imageUrl"
                type="url"
                disabled={isPending}
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setImageError(false)
                }}
                placeholder="https://images.unsplash.com/photo-…"
                className={`w-full h-11 px-3.5 rounded-xl border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  getFieldError('imageUrl') ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                }`}
              />
              {getFieldError('imageUrl') && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('imageUrl')}</p>
              )}
            </div>

            {/* Optional Image Alt */}
            <div>
              <label htmlFor="product-imageAlt" className="block text-xs font-semibold uppercase tracking-wider text-main mb-2">
                Image Alt Text
              </label>
              <input
                id="product-imageAlt"
                name="imageAlt"
                type="text"
                disabled={isPending}
                defaultValue={initialData?.images?.[0]?.alt || ''}
                placeholder="Accessible description of the product image"
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Live Image Preview */}
            <div className="pt-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                Image Preview
              </span>
              <div className="w-full sm:w-48 h-48 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden relative">
                {isPreviewValid ? (
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    unoptimized
                    onError={() => setImageError(true)}
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-8 h-8 mx-auto text-secondary/40 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span className="text-[11px] text-secondary/60">
                      {imageUrl && imageError ? 'Unable to load image from URL' : 'No image URL provided'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card: Product Options (Sizes & Colors) */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-xs space-y-5">
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-main border-b border-border pb-3">
                Variants & Options
              </h2>
              <p className="text-xs text-secondary mt-1">
                Enter comma-separated values to automatically generate product size and colour options.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="product-sizes" className="block text-xs font-semibold uppercase tracking-wider text-main mb-2">
                  Sizes (comma-separated)
                </label>
                <input
                  id="product-sizes"
                  name="sizes"
                  type="text"
                  disabled={isPending}
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  placeholder="e.g. S, M, L, XL or 38, 39, 40"
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="product-colors" className="block text-xs font-semibold uppercase tracking-wider text-main mb-2">
                  Colours (comma-separated)
                </label>
                <input
                  id="product-colors"
                  name="colors"
                  type="text"
                  disabled={isPending}
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder="e.g. Ivory, Indigo, Gold, Emerald"
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Organization & Status */}
        <div className="space-y-6">
          {/* Card: Pricing */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-main border-b border-border pb-3">
              Pricing (ETB)
            </h2>

            <div>
              <label htmlFor="product-price" className="block text-xs font-semibold uppercase tracking-wider text-main mb-2">
                Price in Ethiopian Birr <span className="text-red-500">*</span>
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
                  defaultValue={initialData?.price ?? ''}
                  placeholder="4800"
                  className={`w-full h-11 pl-3.5 pr-14 rounded-xl border bg-background text-main text-sm font-semibold transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    getFieldError('price') ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                  }`}
                />
                <span className="absolute right-3.5 text-xs font-bold text-secondary select-none">ETB</span>
              </div>
              <p className="text-[11px] text-secondary mt-1">Full-Birr integer amount (no decimals).</p>
              {getFieldError('price') && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('price')}</p>
              )}
            </div>
          </div>

          {/* Card: Catalogue Organization */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-main border-b border-border pb-3">
              Taxonomy & Grouping
            </h2>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="product-category" className="block text-xs font-semibold uppercase tracking-wider text-main mb-2">
                Category
              </label>
              <select
                id="product-category"
                name="categoryId"
                disabled={isPending}
                defaultValue={initialData?.categoryId || 'none'}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="none">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {getFieldError('categoryId') && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('categoryId')}</p>
              )}
            </div>

            {/* Collection Dropdown */}
            <div>
              <label htmlFor="product-collection" className="block text-xs font-semibold uppercase tracking-wider text-main mb-2">
                Primary Collection
              </label>
              <select
                id="product-collection"
                name="collectionId"
                disabled={isPending}
                defaultValue={initialData?.collectionId || 'none'}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="none">No Collection</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
              {getFieldError('collectionId') && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{getFieldError('collectionId')}</p>
              )}
            </div>
          </div>

          {/* Card: Visibility & Status */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-main border-b border-border pb-3">
              Catalogue Status
            </h2>

            {/* Available Toggle */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="product-available"
                name="available"
                type="checkbox"
                disabled={isPending}
                defaultChecked={initialData?.available ?? true}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <label htmlFor="product-available" className="block text-xs font-bold text-main cursor-pointer">
                  Available in Catalogue
                </label>
                <p className="text-[11px] text-secondary mt-0.5 leading-snug">
                  When enabled, customers can view and browse this product on the public storefront.
                </p>
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-start gap-3 pt-2 border-t border-border/60">
              <input
                id="product-featured"
                name="featured"
                type="checkbox"
                disabled={isPending}
                defaultChecked={initialData?.featured ?? false}
                className="mt-1 w-4 h-4 rounded border-border text-accent-gold focus:ring-accent-gold"
              />
              <div>
                <label htmlFor="product-featured" className="block text-xs font-bold text-main cursor-pointer">
                  Featured Product
                </label>
                <p className="text-[11px] text-secondary mt-0.5 leading-snug">
                  Spotlight this item in the homepage featured showcase and curated highlights.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
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
              href="/admin/products"
              className="w-full h-11 rounded-xl border border-border hover:bg-black/[0.03] text-main text-xs font-semibold transition-colors flex items-center justify-center"
            >
              Cancel & Return
            </Link>
          </div>
        </div>
      </div>
    </form>
  )
}
