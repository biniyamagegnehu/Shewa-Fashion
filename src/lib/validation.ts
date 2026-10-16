/**
 * Shewa Fashion — Server-Side Validation Conventions
 *
 * Lightweight validation utilities for Route Handlers and Server Actions.
 *
 * This project does not install Zod as a direct dependency because:
 *   - No client-bundle validation is needed (all validation is server-side).
 *   - The only current use-case is a small set of input shapes.
 *   - The `effect` peer brings Zod v3/v4 transitively; we DO NOT rely on
 *     that transitive copy — peer dependencies are not stable public API.
 *
 * If input validation complexity grows in future phases, add Zod explicitly
 * as a direct dependency and replace these helpers with Zod schemas.
 *
 * ────────────────────────────────────────────────────────────
 * Usage pattern (Route Handler):
 *
 *   const parsed = parseLoginInput(await request.json().catch(() => null))
 *   if (!parsed.ok) return apiValidationError(parsed.errors)
 *   const { email, password } = parsed.data
 *
 * Usage pattern (Server Action):
 *   const parsed = parseLoginInput({ email: formData.get('email'), password: ... })
 *   if (!parsed.ok) return { errors: parsed.errors }
 * ────────────────────────────────────────────────────────────
 */

import type { ValidationDetail } from '@/lib/api-response'

// ============================================================
// Core result types
// ============================================================

export interface ParseOk<T> {
  ok: true
  data: T
}

export interface ParseFail {
  ok: false
  errors: ValidationDetail[]
}

export type ParseResult<T> = ParseOk<T> | ParseFail

// ============================================================
// Internal field validators
// ============================================================

/** Validate that a raw value is a non-empty string after trimming. */
function requireString(raw: unknown, field: string, label: string): string | ValidationDetail {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { field, message: `${label} is required.` }
  }
  return raw.trim()
}

/** Validate an email address format and length. */
function requireEmail(raw: unknown, field = 'email'): string | ValidationDetail {
  const str = requireString(raw, field, 'Email address')
  if (typeof str !== 'string') return str // already an error

  const normalised = str.toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalised) || normalised.length > 254) {
    return { field, message: 'Enter a valid email address.' }
  }
  return normalised
}

// ============================================================
// Parsed input shapes
// ============================================================

export interface LoginInput {
  email: string
  password: string
}

/**
 * Validate and normalise raw login input from a form or JSON body.
 *
 * Trims whitespace, lowercases the email, and returns field-level
 * error details using the standard ValidationDetail shape.
 *
 * @example — Route Handler
 *   const body = await request.json().catch(() => null)
 *   const parsed = parseLoginInput(body)
 *   if (!parsed.ok) return apiValidationError(parsed.errors)
 *
 * @example — Server Action (FormData)
 *   const parsed = parseLoginInput({
 *     email: formData.get('email'),
 *     password: formData.get('password'),
 *   })
 *   if (!parsed.ok) return { errors: parsed.errors }
 */
export function parseLoginInput(raw: unknown): ParseResult<LoginInput> {
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, errors: [{ field: '_form', message: 'Invalid request body.' }] }
  }

  const body = raw as Record<string, unknown>
  const errors: ValidationDetail[] = []

  const emailResult = requireEmail(body.email, 'email')
  if (typeof emailResult !== 'string') errors.push(emailResult)

  const passwordResult = requireString(body.password, 'password', 'Password')
  if (typeof passwordResult !== 'string') errors.push(passwordResult)

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      email: emailResult as string,
      password: passwordResult as string,
    },
  }
}

// ============================================================
// Generic safe JSON body parser
// ============================================================

/**
 * Parse a JSON request body safely.
 * Returns null if the body is missing or not valid JSON,
 * allowing the caller to return a 400 Bad Request response.
 *
 * @example
 *   const body = await parseJsonBody(request)
 *   if (!body) return apiBadRequest('Request body must be valid JSON.')
 */
export async function parseJsonBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

// ============================================================
// Product Validation & Slug Helpers (Phase 12)
// ============================================================

/**
 * Generate a clean, URL-safe slug from a product name.
 * e.g. "Abyssinian Structured Leather Tote" -> "abyssinian-structured-leather-tote"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

/**
 * Verify that a string is a safe HTTP or HTTPS image URL.
 * Rejects javascript:, data:, file: and relative script injection schemes.
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (trimmed.length > 2000) return false

  try {
    const parsed = new URL(trimmed, 'https://shewafashion.com')
    // Accept HTTPS or HTTP schemes only
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export type ProductOptionType = 'SIZE' | 'SHOE_SIZE' | 'COLOR' | 'ONE_SIZE'

export interface ProductInputImage {
  url: string
  alt?: string
  sortOrder?: number
}

export interface ProductInputOption {
  type: ProductOptionType
  value: string
}

export interface ProductInput {
  name: string
  slug: string
  description: string
  price: number // Ethiopian Birr (ETB) full integer
  available: boolean
  featured: boolean
  categoryId: string | null
  collectionId: string | null
  images: ProductInputImage[]
  options: ProductInputOption[]
}

/**
 * Helper to extract and shape FormData into an object for parseProductInput.
 */
export function extractProductFormData(formData: FormData): Record<string, unknown> {
  const name = formData.get('name')
  const slug = formData.get('slug')
  const description = formData.get('description')
  const price = formData.get('price')
  const available = formData.get('available')
  const featured = formData.get('featured')
  const categoryId = formData.get('categoryId')
  const collectionId = formData.get('collectionId')
  const imageUrl = formData.get('imageUrl')
  const imageAlt = formData.get('imageAlt')

  // Collect images: either via primary imageUrl + imageAlt or via raw JSON
  const images: ProductInputImage[] = []
  const rawImagesJson = formData.get('imagesJson')
  if (typeof rawImagesJson === 'string' && rawImagesJson.trim()) {
    try {
      const parsedImages = JSON.parse(rawImagesJson)
      if (Array.isArray(parsedImages)) {
        parsedImages.forEach((img, idx) => {
          if (img && typeof img.url === 'string') {
            images.push({
              url: img.url.trim(),
              alt: typeof img.alt === 'string' ? img.alt.trim() : '',
              sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : idx,
            })
          }
        })
      }
    } catch {
      // Fallback
    }
  }

  // Also check primary single imageUrl field if imagesJson wasn't provided or empty
  if (images.length === 0 && typeof imageUrl === 'string' && imageUrl.trim()) {
    images.push({
      url: imageUrl.trim(),
      alt: typeof imageAlt === 'string' ? imageAlt.trim() : '',
      sortOrder: 0,
    })
  }

  // Collect options: sizes, colors, etc.
  const options: ProductInputOption[] = []
  const rawOptionsJson = formData.get('optionsJson')
  if (typeof rawOptionsJson === 'string' && rawOptionsJson.trim()) {
    try {
      const parsedOptions = JSON.parse(rawOptionsJson)
      if (Array.isArray(parsedOptions)) {
        parsedOptions.forEach((opt) => {
          if (opt && typeof opt.type === 'string' && typeof opt.value === 'string') {
            options.push({
              type: opt.type as ProductOptionType,
              value: opt.value.trim(),
            })
          }
        })
      }
    } catch {
      // Fallback
    }
  }

  // Also parse comma-separated sizes string if optionsJson was empty
  const rawSizes = formData.get('sizes')
  if (typeof rawSizes === 'string' && rawSizes.trim()) {
    rawSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((val) => {
        options.push({ type: 'SIZE', value: val })
      })
  }

  // Also parse comma-separated colors string if provided
  const rawColors = formData.get('colors')
  if (typeof rawColors === 'string' && rawColors.trim()) {
    rawColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((val) => {
        options.push({ type: 'COLOR', value: val })
      })
  }

  return {
    name,
    slug,
    description,
    price,
    available,
    featured,
    categoryId,
    collectionId,
    imageUrl,
    imageAlt,
    images,
    options,
  }
}

/**
 * Validate and normalize product input from Server Actions, FormData, or JSON body.
 */
export function parseProductInput(raw: unknown): ParseResult<ProductInput> {
  let body: Record<string, unknown>
  if (typeof FormData !== 'undefined' && raw instanceof FormData) {
    body = extractProductFormData(raw)
  } else if (raw !== null && typeof raw === 'object') {
    body = raw as Record<string, unknown>
  } else {
    return { ok: false, errors: [{ field: '_form', message: 'Invalid product payload.' }] }
  }

  const errors: ValidationDetail[] = []

  // 1. Name (required, 2 - 120 chars)
  const nameResult = requireString(body.name, 'name', 'Product name')
  let name = ''
  if (typeof nameResult !== 'string') {
    errors.push(nameResult)
  } else if (nameResult.length < 2) {
    errors.push({ field: 'name', message: 'Product name must be at least 2 characters.' })
  } else if (nameResult.length > 120) {
    errors.push({ field: 'name', message: 'Product name cannot exceed 120 characters.' })
  } else {
    name = nameResult
  }

  // 2. Slug (optional in raw input; auto-generated from name if omitted)
  let slug = typeof body.slug === 'string' && body.slug.trim() ? slugify(body.slug) : slugify(name)
  if (!slug) {
    errors.push({ field: 'slug', message: 'A valid product slug is required.' })
  } else if (slug.length < 2 || slug.length > 150) {
    errors.push({ field: 'slug', message: 'Product slug must be between 2 and 150 characters.' })
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push({ field: 'slug', message: 'Slug can only contain lowercase alphanumeric characters and hyphens.' })
  }

  // 3. Description (required, 5 - 3000 chars)
  const descResult = requireString(body.description, 'description', 'Description')
  let description = ''
  if (typeof descResult !== 'string') {
    errors.push(descResult)
  } else if (descResult.length < 5) {
    errors.push({ field: 'description', message: 'Description must be at least 5 characters.' })
  } else if (descResult.length > 3000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 3,000 characters.' })
  } else {
    description = descResult
  }

  // 4. Price (ETB integer, must be >= 0 and <= 10,000,000)
  let price = 0
  const rawPrice = body.price
  if (rawPrice === undefined || rawPrice === null || rawPrice === '') {
    errors.push({ field: 'price', message: 'Price is required.' })
  } else {
    const numPrice = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice)
    if (isNaN(numPrice) || !Number.isFinite(numPrice)) {
      errors.push({ field: 'price', message: 'Price must be a valid number.' })
    } else if (numPrice < 0) {
      errors.push({ field: 'price', message: 'Price cannot be negative.' })
    } else if (numPrice > 10_000_000) {
      errors.push({ field: 'price', message: 'Price cannot exceed 10,000,000 ETB.' })
    } else {
      // Currency convention: Prices are stored as full-Birr integers (no floating-point cents)
      price = Math.round(numPrice)
    }
  }

  // 5. Available & Featured (booleans)
  const available = body.available === true || body.available === 'true' || body.available === 'on' || body.available === 1
  const featured = body.featured === true || body.featured === 'true' || body.featured === 'on' || body.featured === 1

  // 6. Category ID (optional string cuid or null)
  let categoryId: string | null = null
  if (typeof body.categoryId === 'string' && body.categoryId.trim() && body.categoryId !== 'none' && body.categoryId !== '') {
    categoryId = body.categoryId.trim()
  }

  // 7. Collection ID (optional string cuid or null)
  let collectionId: string | null = null
  if (typeof body.collectionId === 'string' && body.collectionId.trim() && body.collectionId !== 'none' && body.collectionId !== '') {
    collectionId = body.collectionId.trim()
  }

  // 8. Images (array of { url, alt, sortOrder })
  const images: ProductInputImage[] = []
  if (Array.isArray(body.images) && body.images.length > 0) {
    body.images.forEach((img, idx) => {
      if (typeof img === 'string') {
        const str = img.trim()
        if (isValidImageUrl(str)) {
          images.push({ url: str, alt: name || 'Product image', sortOrder: idx })
        } else {
          errors.push({ field: 'imageUrl', message: 'Enter a valid image URL starting with http://, https://, or /' })
        }
      } else if (typeof img === 'object' && img !== null && typeof (img as any).url === 'string') {
        const urlStr = ((img as any).url as string).trim()
        if (isValidImageUrl(urlStr)) {
          images.push({
            url: urlStr,
            alt: typeof (img as any).alt === 'string' && (img as any).alt.trim() ? (img as any).alt.trim() : (name || 'Product image'),
            sortOrder: typeof (img as any).sortOrder === 'number' ? (img as any).sortOrder : idx,
          })
        } else {
          errors.push({ field: 'imageUrl', message: 'Enter a valid image URL starting with http://, https://, or /' })
        }
      }
    })
  } else if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    // Single imageUrl field convenience
    const singleUrl = body.imageUrl.trim()
    if (!isValidImageUrl(singleUrl)) {
      errors.push({ field: 'imageUrl', message: 'Enter a valid image URL starting with http:// or https://' })
    } else {
      images.push({
        url: singleUrl,
        alt: typeof body.imageAlt === 'string' && body.imageAlt.trim() ? body.imageAlt.trim() : (name || 'Product image'),
        sortOrder: 0,
      })
    }
  }

  // 9. Options (array of { type, value })
  const options: ProductInputOption[] = []
  const allowedOptionTypes = new Set(['SIZE', 'SHOE_SIZE', 'COLOR', 'ONE_SIZE'])
  if (Array.isArray(body.options)) {
    body.options.forEach((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        const typeStr = ((opt as any).type as string)?.toUpperCase()
        const valueStr = ((opt as any).value as string)?.trim()
        if (allowedOptionTypes.has(typeStr) && valueStr && valueStr.length <= 50) {
          options.push({ type: typeStr as ProductOptionType, value: valueStr })
        }
      }
    })
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      name,
      slug,
      description,
      price,
      available,
      featured,
      categoryId,
      collectionId,
      images,
      options,
    },
  }
}
