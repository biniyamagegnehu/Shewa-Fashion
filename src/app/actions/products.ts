'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'
import {
  parseProductInput,
  ProductInput,
  ProductOptionType,
  ProductInputImage,
  ProductInputOption,
} from '@/lib/validation'
import type { ValidationDetail } from '@/lib/api-response'

export interface ProductActionState {
  error?: string
  errors?: ValidationDetail[]
  success?: boolean
}

/**
 * Server action to create a new product in the catalogue.
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

  // 2. Parse Raw Form Data
  const rawData = extractProductFormData(formData)
  const parsed = parseProductInput(rawData)

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const {
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
  } = parsed.data

  try {
    // 3. Verify Slug Uniqueness
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (existingSlug) {
      return {
        errors: [{ field: 'slug', message: `A product with slug "${slug}" already exists.` }],
      }
    }

    // 4. Verify Category Reference (if provided)
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      })
      if (!categoryExists) {
        return {
          errors: [{ field: 'categoryId', message: 'The selected category does not exist.' }],
        }
      }
    }

    // 5. Verify Collection Reference (if provided)
    if (collectionId) {
      const collectionExists = await prisma.collection.findUnique({
        where: { id: collectionId },
        select: { id: true },
      })
      if (!collectionExists) {
        return {
          errors: [{ field: 'collectionId', message: 'The selected collection does not exist.' }],
        }
      }
    }

    // 6. Create Product with Images & Options in a Transaction
    await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          description,
          price,
          available,
          featured,
          categoryId,
          collectionId,
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
    return { error: 'An unexpected database error occurred while creating the product.' }
  }

  // 8. Redirect to product management list
  redirect('/admin/products')
}

/**
 * Server action to update an existing product.
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

  // 2. Parse Raw Form Data
  const rawData = extractProductFormData(formData)
  const parsed = parseProductInput(rawData)

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const {
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
  } = parsed.data

  try {
    // 3. Confirm Product Exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    })

    if (!existing) {
      return { error: 'Product not found.' }
    }

    // 4. Verify Slug Uniqueness (excluding current product)
    if (slug !== existing.slug) {
      const slugConflict = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: productId },
        },
        select: { id: true },
      })

      if (slugConflict) {
        return {
          errors: [{ field: 'slug', message: `A product with slug "${slug}" already exists.` }],
        }
      }
    }

    // 5. Verify Category Reference (if provided)
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      })
      if (!categoryExists) {
        return {
          errors: [{ field: 'categoryId', message: 'The selected category does not exist.' }],
        }
      }
    }

    // 6. Verify Collection Reference (if provided)
    if (collectionId) {
      const collectionExists = await prisma.collection.findUnique({
        where: { id: collectionId },
        select: { id: true },
      })
      if (!collectionExists) {
        return {
          errors: [{ field: 'collectionId', message: 'The selected collection does not exist.' }],
        }
      }
    }

    // 7. Update in Transaction: update fields, replace images and options
    await prisma.$transaction(async (tx) => {
      // Delete existing relations
      await tx.productImage.deleteMany({ where: { productId } })
      await tx.productOption.deleteMany({ where: { productId } })

      // Update product and re-create images and options
      await tx.product.update({
        where: { id: productId },
        data: {
          name,
          slug,
          description,
          price,
          available,
          featured,
          categoryId,
          collectionId,
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

    // 8. Revalidate Cache
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
    return { error: 'An unexpected database error occurred while updating the product.' }
  }

  // 9. Redirect to product management list
  redirect('/admin/products')
}

/**
 * Server action to delete a product from PostgreSQL.
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
    // 2. Confirm Existence
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, name: true },
    })

    if (!product) {
      return { success: false, error: 'Product not found or already deleted.' }
    }

    // 3. Delete Product (ProductImage and ProductOption cascade automatically)
    await prisma.product.delete({
      where: { id: productId },
    })

    // 4. Revalidate Affected Routes
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
function extractProductFormData(formData: FormData): Record<string, unknown> {
  const name = formData.get('name')
  const slug = formData.get('slug')
  const description = formData.get('description')
  const price = formData.get('price')
  const available = formData.get('available')
  const featured = formData.get('featured')
  const categoryId = formData.get('categoryId')
  const collectionId = formData.get('collectionId')

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
  const primaryImageUrl = formData.get('imageUrl')
  const primaryImageAlt = formData.get('imageAlt')
  if (images.length === 0 && typeof primaryImageUrl === 'string' && primaryImageUrl.trim()) {
    images.push({
      url: primaryImageUrl.trim(),
      alt: typeof primaryImageAlt === 'string' ? primaryImageAlt.trim() : '',
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
    images,
    options,
  }
}
