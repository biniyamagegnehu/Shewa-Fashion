'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'
import { parseGalleryItemInput } from '@/lib/validation'
import { handlePrismaError } from '@/lib/errors'
import {
  validateImageBuffer,
  isStorageConfigured,
  uploadGalleryImage,
  deleteStoredImage,
  isImageShared,
} from '@/lib/storage'
import type { ValidationDetail } from '@/lib/api-response'

export interface GalleryActionState {
  error?: string
  errors?: ValidationDetail[]
  success?: boolean
  itemId?: string
}

// ============================================================
// Create Gallery Item Action
// ============================================================

export async function createGalleryItemAction(
  _prevState: GalleryActionState | undefined,
  formData: FormData
): Promise<GalleryActionState> {
  // 1. Enforce server-side administrator authorization
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  // 2. Validate metadata fields
  const parsed = parseGalleryItemInput({
    title: formData.get('title'),
    alt: formData.get('alt'),
    description: formData.get('description'),
    sortOrder: formData.get('sortOrder'),
    isPublished: formData.get('isPublished'),
    imageUrl: formData.get('imageUrl'),
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const { title, alt, description, sortOrder, isPublished } = parsed.data
  let finalImageUrl = parsed.data.imageUrl

  // 3. Handle File Upload if provided
  const imageFile = formData.get('image')
  if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
    const file = imageFile as File
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
            'Image storage is not configured. Please configure storage credentials in .env.local to upload gallery images.',
        }
      }

      const uploadRes = await uploadGalleryImage(buffer)
      if (!uploadRes.ok || !uploadRes.url) {
        return { error: uploadRes.error || 'Failed to upload image file to storage.' }
      }
      finalImageUrl = uploadRes.url
    }
  }

  // 4. Ensure an image URL exists
  if (!finalImageUrl) {
    return {
      errors: [{ field: 'image', message: 'An image file or valid image URL is required.' }],
    }
  }

  // 5. Persist to PostgreSQL via Prisma
  try {
    const created = await prisma.galleryItem.create({
      data: {
        title,
        imageUrl: finalImageUrl,
        alt: alt || title,
        description,
        sortOrder,
        isPublished,
      },
      select: { id: true },
    })

    revalidatePath('/admin/gallery')
    revalidatePath('/gallery')
    revalidatePath('/')

    return { success: true, itemId: created.id }
  } catch (err) {
    console.error('Failed to create gallery item:', err)
    if (finalImageUrl && finalImageUrl !== parsed.data.imageUrl) {
      await deleteStoredImage(finalImageUrl).catch((cleanupErr) => {
        console.warn('Failed to clean up uploaded gallery image after DB failure:', cleanupErr)
      })
    }
    const errRes = handlePrismaError(err, 'Failed to create gallery item. Please try again.')
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
  }
}

// ============================================================
// Update Gallery Item Action
// ============================================================

export async function updateGalleryItemAction(
  _prevState: GalleryActionState | undefined,
  formData: FormData
): Promise<GalleryActionState> {
  // 1. Enforce server-side administrator authorization
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  // 2. Locate existing record
  const id = formData.get('id')
  if (typeof id !== 'string' || !id.trim()) {
    return { error: 'Gallery item ID is required.' }
  }

  const existing = await prisma.galleryItem.findUnique({
    where: { id: id.trim() },
    select: { id: true, imageUrl: true },
  })

  if (!existing) {
    return { error: 'Gallery item not found.' }
  }

  // 3. Validate metadata fields
  const parsed = parseGalleryItemInput({
    title: formData.get('title'),
    alt: formData.get('alt'),
    description: formData.get('description'),
    sortOrder: formData.get('sortOrder'),
    isPublished: formData.get('isPublished'),
    imageUrl: formData.get('imageUrl'),
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const { title, alt, description, sortOrder, isPublished } = parsed.data
  let finalImageUrl = existing.imageUrl // default: preserve existing image
  let newImageUploaded = false

  // 4. Check if new image file was uploaded
  const imageFile = formData.get('image')
  if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
    const file = imageFile as File
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
            'Image storage is not configured. Please configure storage credentials in .env.local to upload gallery images.',
        }
      }

      const uploadRes = await uploadGalleryImage(buffer)
      if (!uploadRes.ok || !uploadRes.url) {
        return { error: uploadRes.error || 'Failed to upload replacement image file.' }
      }
      finalImageUrl = uploadRes.url
      newImageUploaded = true
    }
  } else if (parsed.data.imageUrl && parsed.data.imageUrl !== existing.imageUrl) {
    // If explicit new imageUrl string provided in form
    finalImageUrl = parsed.data.imageUrl
    newImageUploaded = true
  }

  // 5. Update record in database
  try {
    await prisma.galleryItem.update({
      where: { id: existing.id },
      data: {
        title,
        imageUrl: finalImageUrl,
        alt: alt || title,
        description,
        sortOrder,
        isPublished,
      },
    })

    // 6. Clean up old image if replaced AND not shared
    if (newImageUploaded && existing.imageUrl && existing.imageUrl !== finalImageUrl) {
      const shared = await isImageShared(existing.imageUrl, existing.id)
      if (!shared) {
        await deleteStoredImage(existing.imageUrl).catch((warnErr) => {
          console.warn('Could not clean up obsolete gallery image from storage:', warnErr)
        })
      }
    }

    revalidatePath('/admin/gallery')
    revalidatePath(`/admin/gallery/${existing.id}/edit`)
    revalidatePath('/gallery')
    revalidatePath('/')

    return { success: true, itemId: existing.id }
  } catch (err) {
    console.error('Failed to update gallery item:', err)
    if (newImageUploaded && finalImageUrl && finalImageUrl !== existing.imageUrl && finalImageUrl !== parsed.data.imageUrl) {
      await deleteStoredImage(finalImageUrl).catch((cleanupErr) => {
        console.warn('Failed to clean up newly uploaded gallery image after DB failure:', cleanupErr)
      })
    }
    const errRes = handlePrismaError(err, 'Failed to update gallery item. Please try again.')
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
  }
}

// ============================================================
// Delete Gallery Item Action
// ============================================================

export async function deleteGalleryItemAction(
  idOrFormData: string | FormData
): Promise<{ success: boolean; error?: string }> {
  // 1. Enforce server-side administrator authorization
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Administrator access required.' }
  }

  const id = typeof idOrFormData === 'string' ? idOrFormData : idOrFormData.get('id')
  if (typeof id !== 'string' || !id.trim()) {
    return { success: false, error: 'Gallery item ID is required.' }
  }

  const existing = await prisma.galleryItem.findUnique({
    where: { id: id.trim() },
    select: { id: true, imageUrl: true },
  })

  if (!existing) {
    return { success: false, error: 'Gallery item not found.' }
  }

  // 2. Delete database record
  try {
    await prisma.galleryItem.delete({
      where: { id: existing.id },
    })

    // 3. Safe image deletion: check if shared before deleting underlying asset
    if (existing.imageUrl) {
      const shared = await isImageShared(existing.imageUrl, existing.id)
      if (!shared) {
        await deleteStoredImage(existing.imageUrl).catch((err) => {
          console.warn('Could not clean up gallery item storage file:', err)
        })
      }
    }

    revalidatePath('/admin/gallery')
    revalidatePath('/gallery')
    revalidatePath('/')

    return { success: true }
  } catch (err) {
    console.error('Failed to delete gallery item:', err)
    const errRes = handlePrismaError(err, 'Failed to delete gallery item. Please try again.')
    return { success: false, error: errRes.message }
  }
}
