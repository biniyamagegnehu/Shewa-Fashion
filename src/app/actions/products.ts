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
import type { ValidationDetail } from '@/lib/api-response'

export interface ProductActionState {
  error?: string
  errors?: ValidationDetail[]
  success?: boolean
}

/**
 * Server action to create a new product in the catalogue.
 * Automatically handles unique slug generation and image file upload.
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

  // 2. Validate Category (required dropdown populated from real database categories)
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

  // 3. Handle Product Image File Upload
  const imageField = formData.get('image')
  let finalImageUrl = ''
  let uploadedKey: string | null = null

  if (imageField && typeof imageField === 'object' && 'arrayBuffer' in imageField) {
    const file = imageField as File
    if (file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const imgValidation = validateImageBuffer(buffer)
      if (!imgValidation.ok) {
        return {
          errors: [{ field: 'image', message: imgValidation.error || 'Invalid image file.' }],
        }
      }

      if (!isStorageConfigured()) {
        return {
          error:
            'Image storage is not configured. Please set STORAGE_BUCKET, STORAGE_ACCESS_KEY_ID, and STORAGE_SECRET_ACCESS_KEY in .env.local to enable product image uploads.',
        }
      }

      const uploadRes = await uploadProductImage(buffer)
      if (!uploadRes.ok || !uploadRes.url) {
        return { error: uploadRes.error || 'Failed to upload image file to storage.' }
      }
      finalImageUrl = uploadRes.url
      uploadedKey = uploadRes.key || uploadRes.url
    }
  }

  // Support fallback URL if provided programmatically / via test suite
  if (!finalImageUrl) {
    const rawImageUrl = formData.get('imageUrl')
    if (typeof rawImageUrl === 'string' && rawImageUrl.trim()) {
      finalImageUrl = rawImageUrl.trim()
    }
  }

  if (!finalImageUrl) {
    return {
      errors: [{ field: 'image', message: 'Product image is required. Please choose an image file.' }],
    }
  }

  // 4. Generate Unique Slug Automatically from Name
  const rawName = typeof formData.get('name') === 'string' ? (formData.get('name') as string).trim() : ''
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
  const rawData = extractProductFormData(formData, { slug, imageUrl: finalImageUrl, categoryId })
  const parsed = parseProductInput(rawData)

  if (!parsed.ok) {
    // If a new image was uploaded to storage, clean it up to prevent orphaned files
    if (uploadedKey) {
      await deleteProductImage(uploadedKey).catch((e) => console.error('Failed to compensate uploaded image:', e))
    }
    return { errors: parsed.errors }
  }

  const { name, description, price, available, featured, collectionId, images, options } = parsed.data

  try {
    // 6. Persist Product with Images & Options in a Transaction
    await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
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
      return newProduct
    })

    // 7. Revalidate Cache for Public & Admin Routes
    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
    revalidatePath('/categories')
    revalidatePath('/collections')
  } catch (error) {
    console.error('Failed to create product in database:', error)
    if (uploadedKey) {
      await deleteProductImage(uploadedKey).catch((e) => console.error('Failed to compensate uploaded image:', e))
    }
    return { error: 'An unexpected database error occurred while creating the product.' }
  }

  // 8. Redirect to product management list
  redirect('/admin/products')
}

/**
 * Server action to update an existing product.
 * Preserves non-form fields (such as collection or featured flag), safely handles image replacement,
 * and maintains unique slugs.
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

  // 3. Validate Category (required dropdown)
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

  // 4. Handle Product Image (replacement vs keeping current image)
  const imageField = formData.get('image')
  let finalImageUrl = ''
  let newlyUploadedKey: string | null = null
  let imageWasReplaced = false

  if (imageField && typeof imageField === 'object' && 'arrayBuffer' in imageField) {
    const file = imageField as File
    if (file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const imgValidation = validateImageBuffer(buffer)
      if (!imgValidation.ok) {
        return {
          errors: [{ field: 'image', message: imgValidation.error || 'Invalid image file.' }],
        }
      }

      if (!isStorageConfigured()) {
        return {
          error:
            'Image storage is not configured. Please set STORAGE_BUCKET, STORAGE_ACCESS_KEY_ID, and STORAGE_SECRET_ACCESS_KEY in .env.local to enable product image uploads.',
        }
      }

      const uploadRes = await uploadProductImage(buffer)
      if (!uploadRes.ok || !uploadRes.url) {
        return { error: uploadRes.error || 'Failed to upload image file to storage.' }
      }
      finalImageUrl = uploadRes.url
      newlyUploadedKey = uploadRes.key || uploadRes.url
      imageWasReplaced = true
    }
  }

  // Fallback to manual imageUrl if supplied
  if (!finalImageUrl) {
    const rawImageUrl = formData.get('imageUrl')
    if (typeof rawImageUrl === 'string' && rawImageUrl.trim()) {
      finalImageUrl = rawImageUrl.trim()
      if (finalImageUrl !== existing.images[0]?.url) {
        imageWasReplaced = true
      }
    }
  }

  // If no new image was selected, preserve the existing saved image
  if (!finalImageUrl) {
    finalImageUrl = existing.images[0]?.url || ''
  }

  if (!finalImageUrl) {
    return {
      errors: [{ field: 'image', message: 'Product image is required.' }],
    }
  }

  // 5. Slug Uniqueness & Auto-Generation
  const rawName = typeof formData.get('name') === 'string' ? (formData.get('name') as string).trim() : ''
  if (!rawName) {
    return { errors: [{ field: 'name', message: 'Product name is required.' }] }
  }

  let slug = existing.slug
  if (rawName !== existing.name) {
    // Generate new unique slug if name was updated
    const baseSlug = slugify(rawName) || 'product'
    slug = baseSlug
    let counter = 1
    while (true) {
      const conflict = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: productId },
        },
        select: { id: true },
      })
      if (!conflict) break
      counter++
      slug = `${baseSlug}-${counter}`
    }
  }

  // 6. Parse and Validate Form Payload
  const rawData = extractProductFormData(formData, { slug, imageUrl: finalImageUrl, categoryId })
  const parsed = parseProductInput(rawData)

  if (!parsed.ok) {
    if (newlyUploadedKey) {
      await deleteProductImage(newlyUploadedKey).catch((e) =>
        console.error('Failed to compensate uploaded image:', e)
      )
    }
    return { errors: parsed.errors }
  }

  const { name, description, price, available } = parsed.data

  // Preserve non-size options (e.g. COLOR options that were already in the DB)
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

  const oldImageUrl = existing.images[0]?.url

  try {
    // 7. Update in Transaction: update fields, replace images and options
    await prisma.$transaction(async (tx) => {
      // Re-create options
      await tx.productOption.deleteMany({ where: { productId } })

      // If image was replaced, update images
      if (imageWasReplaced) {
        await tx.productImage.deleteMany({ where: { productId } })
      }

      await tx.product.update({
        where: { id: productId },
        data: {
          name,
          slug,
          description,
          price,
          available,
          // Preserve collectionId and featured if not on the form
          categoryId,
          ...(imageWasReplaced
            ? {
                images: {
                  create: [
                    {
                      url: finalImageUrl,
                      alt: name,
                      sortOrder: 0,
                    },
                  ],
                },
              }
            : {}),
          options: {
            create: mergedOptions.map((opt) => ({
              type: opt.type,
              value: opt.value,
            })),
          },
        },
      })
    })

    // 8. Storage Clean-up: If image was replaced successfully, clean up obsolete file
    if (imageWasReplaced && oldImageUrl && oldImageUrl !== finalImageUrl) {
      // Verify no other product, gallery item, or setting is using the old image URL
      const shared = await isImageShared(oldImageUrl)
      if (!shared) {
        await deleteProductImage(oldImageUrl).catch((err) =>
          console.error('Failed to clean up obsolete image:', err)
        )
      }
    }

    // 9. Revalidate Cache
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
    if (newlyUploadedKey) {
      await deleteProductImage(newlyUploadedKey).catch((e) =>
        console.error('Failed to compensate uploaded image:', e)
      )
    }
    return { error: 'An unexpected database error occurred while updating the product.' }
  }

  // 10. Redirect to product management list
  redirect('/admin/products')
}

/**
 * Server action to delete a product from PostgreSQL.
 * Cascades options and images, and cleans up unshared stored image assets.
 */
export async function deleteProductAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Enforce Server-Side Administrator Authentication
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Administrator access required.' }
  }

  if (!productId || typeof productId !== 'string') {
    return { success: false, error: 'Invalid product ID.' }
  }

  try {
    // 2. Confirm Existence and Fetch Images for Storage Cleanup
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

    // 3. Delete Product (ProductImage and ProductOption cascade automatically)
    await prisma.product.delete({
      where: { id: productId },
    })

    // 4. Safely clean up stored images if not shared with another product, gallery item, or setting
    for (const imgUrl of imagesToCleanup) {
      const shared = await isImageShared(imgUrl)
      if (!shared) {
        await deleteProductImage(imgUrl).catch((err) =>
          console.error('Failed to delete asset from storage:', err)
        )
      }
    }

    // 5. Revalidate Affected Routes
    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath(`/shop/${product.slug}`)
    revalidatePath('/shop')
    revalidatePath('/categories')
    revalidatePath('/collections')

    return { success: true }
  } catch (error) {
    console.error('Failed to delete product from database:', error)
    return { success: false, error: 'Failed to delete product due to a database constraint.' }
  }
}

/**
 * Helper to extract and shape FormData into an object for parseProductInput.
 */
function extractProductFormData(
  formData: FormData,
  overrides?: { slug?: string; imageUrl?: string; categoryId?: string | null }
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
  const categoryId = overrides?.categoryId !== undefined ? overrides.categoryId : formData.get('categoryId')
  const collectionId = formData.get('collectionId')

  // Collect images
  const images: ProductInputImage[] = []
  const primaryImageUrl = overrides?.imageUrl || formData.get('imageUrl')
  if (typeof primaryImageUrl === 'string' && primaryImageUrl.trim()) {
    images.push({
      url: primaryImageUrl.trim(),
      alt: typeof name === 'string' ? name.trim() : 'Product image',
      sortOrder: 0,
    })
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
