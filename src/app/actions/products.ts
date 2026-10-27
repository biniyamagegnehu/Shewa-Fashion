'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'
import {
  slugify,
  parseProductInput,
  ProductInputImage,
  ProductInputOption,
} from '@/lib/validation'
import {
  validateImageBuffer,
  uploadProductImage,
  deleteProductImage,
  isStorageConfigured,
  isImageShared,
} from '@/lib/storage'
import { handlePrismaError } from '@/lib/errors'
import type { ValidationDetail } from '@/lib/api-response'

export interface ProductActionState {
  error?: string
  errors?: ValidationDetail[]
  success?: boolean
}

/** Upload one image file from FormData field and return the URL + storage key. */
async function uploadImageField(
  file: File,
  fieldName: string
): Promise<{ url: string; key: string } | { error: string; field: string }> {
  if (file.size === 0) return { error: 'Empty file.', field: fieldName }
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Image file exceeds the 5 MB limit.', field: fieldName }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const imgValidation = validateImageBuffer(buffer)
  if (!imgValidation.ok) {
    return { error: imgValidation.error || 'Invalid image file.', field: fieldName }
  }

  if (!isStorageConfigured()) {
    return {
      error:
        'Image storage is not configured. Please set STORAGE_BUCKET, STORAGE_ACCESS_KEY_ID, and STORAGE_SECRET_ACCESS_KEY in .env.local.',
      field: fieldName,
    }
  }

  const uploadRes = await uploadProductImage(buffer)
  if (!uploadRes.ok || !uploadRes.url) {
    return { error: uploadRes.error || 'Failed to upload image to storage.', field: fieldName }
  }

  return { url: uploadRes.url, key: uploadRes.key || uploadRes.url }
}

/**
 * Collect all image files uploaded in a multi-image form.
 * Form fields are named: image_0, image_1, image_2, ...
 * Also supports legacy field name "image" (single image, treated as position 0).
 */
async function processMultipleImageFields(
  formData: FormData
): Promise<
  | { urls: string[]; keys: string[] }
  | { error: string; field: string }
> {
  const uploadedUrls: string[] = []
  const uploadedKeys: string[] = []

  // Collect all image_N fields
  const imageEntries: { idx: number; file: File }[] = []
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^image_(\d+)$/)
    if (match && typeof value === 'object' && 'arrayBuffer' in value) {
      const file = value as File
      if (file.size > 0) {
        imageEntries.push({ idx: parseInt(match[1], 10), file })
      }
    }
  }

  // Legacy single "image" field
  const legacyField = formData.get('image')
  if (legacyField && typeof legacyField === 'object' && 'arrayBuffer' in legacyField) {
    const file = legacyField as File
    if (file.size > 0 && imageEntries.length === 0) {
      imageEntries.push({ idx: 0, file })
    }
  }

  // Sort by index for deterministic order
  imageEntries.sort((a, b) => a.idx - b.idx)

  for (const { file, idx } of imageEntries) {
    const result = await uploadImageField(file, `image_${idx}`)
    if ('error' in result) {
      // Compensate already-uploaded files
      for (const key of uploadedKeys) {
        await deleteProductImage(key).catch(() => {})
      }
      return result
    }
    uploadedUrls.push(result.url)
    uploadedKeys.push(result.key)
  }

  return { urls: uploadedUrls, keys: uploadedKeys }
}

/**
 * Server action to create a new product in the catalogue.
 * Supports multiple images via image_0, image_1, ... form fields.
 */
export async function createProductAction(
  _prevState: ProductActionState | undefined,
  formData: FormData
): Promise<ProductActionState> {
  // 1. Enforce Server-Side Administrator Authentication
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  // 2. Validate Category (required)
  const rawCategoryId = formData.get('categoryId')
  const categoryId =
    typeof rawCategoryId === 'string' &&
    rawCategoryId.trim() &&
    rawCategoryId !== 'none' &&
    rawCategoryId !== ''
      ? rawCategoryId.trim()
      : null

  if (!categoryId) {
    return {
      errors: [
        {
          field: 'categoryId',
          message: 'Category is required. Please select a category from the list.',
        },
      ],
    }
  }

  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  })
  if (!categoryExists) {
    return {
      errors: [{ field: 'categoryId', message: 'The selected category does not exist.' }],
    }
  }

  // 3. Upload all image files
  const uploadResult = await processMultipleImageFields(formData)
  let finalImageUrls: string[] = []
  let uploadedKeys: string[] = []

  if ('error' in uploadResult) {
    return { errors: [{ field: uploadResult.field, message: uploadResult.error }] }
  } else {
    finalImageUrls = uploadResult.urls
    uploadedKeys = uploadResult.keys

    // Reorder newly uploaded images according to user-specified imageOrder
    const orderRaw = formData.get('imageOrder')
    if (typeof orderRaw === 'string' && orderRaw.trim() && finalImageUrls.length > 1) {
      const tokens = orderRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const reorderedUrls: string[] = []
      const reorderedKeys: string[] = []
      for (const token of tokens) {
        if (token.startsWith('new:')) {
          const idx = parseInt(token.slice(4), 10)
          if (uploadResult.urls[idx]) {
            reorderedUrls.push(uploadResult.urls[idx])
            if (uploadResult.keys[idx]) {
              reorderedKeys.push(uploadResult.keys[idx])
            }
          }
        }
      }
      if (reorderedUrls.length === finalImageUrls.length) {
        finalImageUrls = reorderedUrls
        uploadedKeys = reorderedKeys
      }
    }
  }

  // Support fallback imageUrl(s) if no files uploaded
  if (finalImageUrls.length === 0) {
    const rawImageUrl = formData.get('imageUrl')
    if (typeof rawImageUrl === 'string' && rawImageUrl.trim()) {
      finalImageUrls = [rawImageUrl.trim()]
    }
  }

  if (finalImageUrls.length === 0) {
    return {
      errors: [{ field: 'image', message: 'At least one product image is required.' }],
    }
  }

  // 4. Generate Unique Slug
  const rawName =
    typeof formData.get('name') === 'string' ? (formData.get('name') as string).trim() : ''
  if (!rawName) {
    return { errors: [{ field: 'name', message: 'Product name is required.' }] }
  }

  const baseSlug = slugify(rawName) || 'product'
  let slug = baseSlug
  let counter = 1
  while (true) {
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!existingSlug) break
    counter++
    slug = `${baseSlug}-${counter}`
  }

  // 5. Parse and Validate Form Payload
  const rawData = extractProductFormData(formData, {
    slug,
    imageUrls: finalImageUrls,
    categoryId,
  })
  const parsed = parseProductInput(rawData)

  if (!parsed.ok) {
    if (uploadedKeys.length > 0) {
      for (const key of uploadedKeys) {
        await deleteProductImage(key).catch((e) =>
          console.error('Failed to compensate uploaded image:', e)
        )
      }
    }
    return { errors: parsed.errors }
  }

  const { name, description, price, available, featured, collectionId, images, options } =
    parsed.data

  try {
    // 6. Persist Product with Images & Options in a Transaction
    await prisma.$transaction(async (tx) => {
      await tx.product.create({
        data: {
          name,
          slug,
          description,
          price,
          available,
          featured: featured || false,
          categoryId,
          collectionId: collectionId || null,
          images: {
            create: images.map((img, idx) => ({
              url: img.url,
              alt: img.alt || name,
              sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : idx,
            })),
          },
          options: {
            create: options.map((opt) => ({
              type: opt.type,
              value: opt.value,
            })),
          },
        },
      })
    })

    // 7. Revalidate Cache
    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
    revalidatePath('/categories')
    revalidatePath('/collections')
  } catch (error) {
    console.error('Failed to create product in database:', error)
    for (const key of uploadedKeys) {
      await deleteProductImage(key).catch((e) =>
        console.error('Failed to compensate uploaded image:', e)
      )
    }
    const errRes = handlePrismaError(
      error,
      'An unexpected database error occurred while creating the product.'
    )
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
  }

  // 8. Redirect to product management list
  redirect('/admin/products')
}

/**
 * Server action to update an existing product.
 * Supports:
 * - Adding new images (image_0, image_1, ...)
 * - Keeping existing images via keepImageIds (comma-separated ProductImage ids)
 * - Removing images by omitting their id from keepImageIds
 */
export async function updateProductAction(
  productId: string,
  _prevState: ProductActionState | undefined,
  formData: FormData
): Promise<ProductActionState> {
  // 1. Enforce Server-Side Administrator Authentication
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  if (!productId || typeof productId !== 'string') {
    return { error: 'Invalid product ID.' }
  }

  // 2. Confirm Product Exists & Load Current Relations
  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      options: true,
    },
  })

  if (!existing) {
    return { error: 'Product not found.' }
  }

  // 3. Validate Category
  const rawCategoryId = formData.get('categoryId')
  const categoryId =
    typeof rawCategoryId === 'string' &&
    rawCategoryId.trim() &&
    rawCategoryId !== 'none' &&
    rawCategoryId !== ''
      ? rawCategoryId.trim()
      : null

  if (!categoryId) {
    return {
      errors: [
        {
          field: 'categoryId',
          message: 'Category is required. Please select a category from the list.',
        },
      ],
    }
  }

  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  })
  if (!categoryExists) {
    return {
      errors: [{ field: 'categoryId', message: 'The selected category does not exist.' }],
    }
  }

  // 4. Determine which existing images to KEEP
  // keepImageIds is a comma-separated list of ProductImage ids the admin wants to keep
  const keepIdsRaw = formData.get('keepImageIds')
  const keepIds: string[] =
    typeof keepIdsRaw === 'string' && keepIdsRaw.trim()
      ? keepIdsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : existing.images.map((img) => img.id) // default: keep all if not specified

  const keptImages = existing.images.filter((img) => keepIds.includes(img.id))
  const removedImages = existing.images.filter((img) => !keepIds.includes(img.id))

  // 5. Upload any new image files
  const uploadResult = await processMultipleImageFields(formData)
  let newImageUrls: string[] = []
  let newlyUploadedKeys: string[] = []

  if ('error' in uploadResult) {
    return { errors: [{ field: uploadResult.field, message: uploadResult.error }] }
  } else {
    newImageUrls = uploadResult.urls
    newlyUploadedKeys = uploadResult.keys
  }

  // Build the final ordered image list: kept existing first (in their sort order), then new ones
  // The admin can pass imageOrder to specify the full order as a comma-separated list of
  // "existing:<id>" or "new:<index>" tokens
  const orderRaw = formData.get('imageOrder')
  const finalImages: { url: string; alt: string; sortOrder: number; existingId?: string }[] = []

  if (typeof orderRaw === 'string' && orderRaw.trim()) {
    const tokens = orderRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (token.startsWith('existing:')) {
        const imgId = token.slice('existing:'.length)
        const img = keptImages.find((ki) => ki.id === imgId)
        if (img) {
          finalImages.push({ url: img.url, alt: img.alt, sortOrder: i, existingId: img.id })
        }
      } else if (token.startsWith('new:')) {
        const newIdx = parseInt(token.slice('new:'.length), 10)
        const url = newImageUrls[newIdx]
        if (url) {
          finalImages.push({ url, alt: existing.name, sortOrder: i })
        }
      }
    }
  } else {
    // No explicit order — kept images first, then new ones
    for (const img of keptImages) {
      finalImages.push({
        url: img.url,
        alt: img.alt,
        sortOrder: finalImages.length,
        existingId: img.id,
      })
    }
    for (const url of newImageUrls) {
      finalImages.push({ url, alt: existing.name, sortOrder: finalImages.length })
    }
  }

  // Support legacy fallback imageUrl
  if (finalImages.length === 0) {
    const rawImageUrl = formData.get('imageUrl')
    if (typeof rawImageUrl === 'string' && rawImageUrl.trim()) {
      finalImages.push({ url: rawImageUrl.trim(), alt: existing.name, sortOrder: 0 })
    }
  }

  if (finalImages.length === 0) {
    // Compensate new uploads
    for (const key of newlyUploadedKeys) {
      await deleteProductImage(key).catch(() => {})
    }
    return {
      errors: [{ field: 'image', message: 'At least one product image is required.' }],
    }
  }

  // 6. Slug Uniqueness & Auto-Generation
  const rawName =
    typeof formData.get('name') === 'string' ? (formData.get('name') as string).trim() : ''
  if (!rawName) {
    return { errors: [{ field: 'name', message: 'Product name is required.' }] }
  }

  let slug = existing.slug
  if (rawName !== existing.name) {
    const baseSlug = slugify(rawName) || 'product'
    slug = baseSlug
    let counter = 1
    while (true) {
      const conflict = await prisma.product.findFirst({
        where: { slug, id: { not: productId } },
        select: { id: true },
      })
      if (!conflict) break
      counter++
      slug = `${baseSlug}-${counter}`
    }
  }

  // 7. Parse and Validate Form Payload
  const rawData = extractProductFormData(formData, {
    slug,
    imageUrls: finalImages.map((fi) => fi.url),
    categoryId,
  })
  const parsed = parseProductInput(rawData)

  if (!parsed.ok) {
    for (const key of newlyUploadedKeys) {
      await deleteProductImage(key).catch((e) =>
        console.error('Failed to compensate uploaded image:', e)
      )
    }
    return { errors: parsed.errors }
  }

  const { name, description, price, available } = parsed.data

  // Preserve non-size options
  const existingNonSizeOptions = existing.options.filter(
    (o) => o.type !== 'SIZE' && o.type !== 'SHOE_SIZE' && o.type !== 'ONE_SIZE'
  )
  const newSizeOptions = parsed.data.options.filter(
    (o) => o.type === 'SIZE' || o.type === 'SHOE_SIZE' || o.type === 'ONE_SIZE'
  )
  const mergedOptions = [
    ...existingNonSizeOptions.map((o) => ({ type: o.type, value: o.value })),
    ...newSizeOptions,
  ]

  try {
    // 8. Update in Transaction
    await prisma.$transaction(async (tx) => {
      // Delete removed images from DB
      for (const img of removedImages) {
        await tx.productImage.delete({ where: { id: img.id } })
      }

      // Re-create options
      await tx.productOption.deleteMany({ where: { productId } })

      await tx.product.update({
        where: { id: productId },
        data: {
          name,
          slug,
          description,
          price,
          available,
          categoryId,
          options: {
            create: mergedOptions.map((opt) => ({
              type: opt.type,
              value: opt.value,
            })),
          },
        },
      })

      // Update sort orders of kept images
      for (const fi of finalImages) {
        if (fi.existingId) {
          await tx.productImage.update({
            where: { id: fi.existingId },
            data: { sortOrder: fi.sortOrder },
          })
        } else {
          // New uploaded image — insert
          await tx.productImage.create({
            data: {
              productId,
              url: fi.url,
              alt: fi.alt,
              sortOrder: fi.sortOrder,
            },
          })
        }
      }
    })

    // 9. Storage Clean-up: delete removed images if not shared
    for (const img of removedImages) {
      const shared = await isImageShared(img.url)
      if (!shared) {
        await deleteProductImage(img.url).catch((err) =>
          console.error('Failed to clean up removed image:', err)
        )
      }
    }

    // 10. Revalidate Cache
    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${productId}/edit`)
    revalidatePath(`/shop/${slug}`)
    if (existing.slug !== slug) {
      revalidatePath(`/shop/${existing.slug}`)
    }
    revalidatePath('/shop')
    revalidatePath('/categories')
    revalidatePath('/collections')
  } catch (error) {
    console.error('Failed to update product in database:', error)
    for (const key of newlyUploadedKeys) {
      await deleteProductImage(key).catch((e) =>
        console.error('Failed to compensate uploaded image:', e)
      )
    }
    const errRes = handlePrismaError(
      error,
      'An unexpected database error occurred while updating the product.'
    )
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
  }

  // 11. Redirect to product management list
  redirect('/admin/products')
}

/**
 * Server action to delete a product from PostgreSQL.
 */
export async function deleteProductAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Administrator access required.' }
  }

  if (!productId || typeof productId !== 'string') {
    return { success: false, error: 'Invalid product ID.' }
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        slug: true,
        name: true,
        images: { select: { url: true } },
      },
    })

    if (!product) {
      return { success: false, error: 'Product not found or already deleted.' }
    }

    const imagesToCleanup = product.images.map((img) => img.url)

    await prisma.product.delete({ where: { id: productId } })

    for (const imgUrl of imagesToCleanup) {
      const shared = await isImageShared(imgUrl)
      if (!shared) {
        await deleteProductImage(imgUrl).catch((err) =>
          console.error('Failed to delete asset from storage:', err)
        )
      }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath(`/shop/${product.slug}`)
    revalidatePath('/shop')
    revalidatePath('/categories')
    revalidatePath('/collections')

    return { success: true }
  } catch (error) {
    console.error('Failed to delete product from database:', error)
    const errRes = handlePrismaError(error, 'Failed to delete product due to a database constraint.')
    return { success: false, error: errRes.message }
  }
}

/**
 * Helper to extract and shape FormData into an object for parseProductInput.
 */
function extractProductFormData(
  formData: FormData,
  overrides?: { slug?: string; imageUrls?: string[]; categoryId?: string | null }
): Record<string, unknown> {
  const name = formData.get('name')
  const slug = overrides?.slug || formData.get('slug')
  const description = formData.get('description')
  const price = formData.get('price')
  const available =
    formData.get('available') === 'true' ||
    formData.get('available') === 'published' ||
    formData.get('available') === 'on' ||
    formData.get('available') === '1'
  const featured =
    formData.get('featured') === 'true' ||
    formData.get('featured') === 'on' ||
    formData.get('featured') === '1'
  const categoryId =
    overrides?.categoryId !== undefined ? overrides.categoryId : formData.get('categoryId')
  const collectionId = formData.get('collectionId')

  // Build images array from provided URLs
  const images: ProductInputImage[] = []
  const imageUrls = overrides?.imageUrls || []
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i]
    if (url) {
      images.push({
        url,
        alt: typeof name === 'string' ? name.trim() : 'Product image',
        sortOrder: i,
      })
    }
  }

  // Collect sizes into options
  const options: ProductInputOption[] = []
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

  // Support colors if provided
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
    images,
    options,
  }
}
