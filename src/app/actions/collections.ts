'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'
import { slugify } from '@/lib/validation'
import type { ValidationDetail } from '@/lib/api-response'

export interface CollectionActionState {
  error?: string
  errors?: ValidationDetail[]
  success?: boolean
}

// ============================================================
// Validation helpers
// ============================================================

function validateCollectionName(raw: unknown): string | ValidationDetail {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { field: 'name', message: 'Collection name is required.' }
  }
  const name = raw.trim()
  if (name.length < 2) {
    return { field: 'name', message: 'Collection name must be at least 2 characters.' }
  }
  if (name.length > 80) {
    return { field: 'name', message: 'Collection name cannot exceed 80 characters.' }
  }
  return name
}

function validateCollectionDescription(raw: unknown): string | null | ValidationDetail {
  if (raw === null || raw === undefined || (typeof raw === 'string' && raw.trim().length === 0)) {
    return null
  }
  if (typeof raw !== 'string') return null
  const desc = raw.trim()
  if (desc.length > 500) {
    return { field: 'description', message: 'Description cannot exceed 500 characters.' }
  }
  return desc || null
}

// ============================================================
// Create Collection Server Action
// ============================================================

export async function createCollectionAction(
  _prevState: CollectionActionState | undefined,
  formData: FormData
): Promise<CollectionActionState> {
  // 1. Enforce admin auth
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  // 2. Validate Name
  const nameResult = validateCollectionName(formData.get('name'))
  if (typeof nameResult !== 'string') {
    return { errors: [nameResult] }
  }
  const name = nameResult

  // 3. Validate Description (optional)
  const descResult = validateCollectionDescription(formData.get('description'))
  if (descResult !== null && typeof descResult !== 'string') {
    return { errors: [descResult] }
  }
  const description = descResult

  // 4. Generate unique slug from name
  const baseSlug = slugify(name) || 'collection'
  let slug = baseSlug
  let counter = 1
  while (true) {
    const existing = await prisma.collection.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) break
    counter++
    slug = `${baseSlug}-${counter}`
  }

  // 5. Persist
  try {
    await prisma.collection.create({
      data: { name, slug, description },
    })

    revalidatePath('/admin/collections')
    revalidatePath('/collections')
    revalidatePath('/admin')
    revalidatePath('/shop')
  } catch (error) {
    console.error('Failed to create collection:', error)
    const msg = String(error)
    if (msg.includes('Unique constraint') || msg.includes('unique constraint')) {
      return { errors: [{ field: 'name', message: 'A collection with a similar name already exists.' }] }
    }
    return { error: 'An unexpected error occurred while creating the collection.' }
  }

  redirect('/admin/collections')
}

// ============================================================
// Update Collection Server Action
// ============================================================

export async function updateCollectionAction(
  collectionId: string,
  _prevState: CollectionActionState | undefined,
  formData: FormData
): Promise<CollectionActionState> {
  // 1. Enforce admin auth
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  if (!collectionId || typeof collectionId !== 'string') {
    return { error: 'Invalid collection ID.' }
  }

  // 2. Verify collection exists
  const existing = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { id: true, slug: true },
  })
  if (!existing) {
    return { error: 'Collection not found.' }
  }

  // 3. Validate Name
  const nameResult = validateCollectionName(formData.get('name'))
  if (typeof nameResult !== 'string') {
    return { errors: [nameResult] }
  }
  const name = nameResult

  // 4. Validate Description
  const descResult = validateCollectionDescription(formData.get('description'))
  if (descResult !== null && typeof descResult !== 'string') {
    return { errors: [descResult] }
  }
  const description = descResult

  // 5. Handle isActive toggle
  const isActive = formData.get('isActive') !== 'false'

  // 6. Regenerate slug from new name, keeping safe uniqueness
  const newBaseSlug = slugify(name) || 'collection'
  let newSlug = newBaseSlug
  let counter = 1
  while (true) {
    const conflict = await prisma.collection.findUnique({
      where: { slug: newSlug },
      select: { id: true },
    })
    if (!conflict || conflict.id === collectionId) break
    counter++
    newSlug = `${newBaseSlug}-${counter}`
  }

  // 7. Persist update
  try {
    await prisma.collection.update({
      where: { id: collectionId },
      data: { name, slug: newSlug, description, isActive },
    })

    revalidatePath('/admin/collections')
    revalidatePath('/collections')
    revalidatePath(`/collections/${existing.slug}`)
    revalidatePath(`/collections/${newSlug}`)
    revalidatePath('/admin')
    revalidatePath('/shop')
  } catch (error) {
    console.error('Failed to update collection:', error)
    const msg = String(error)
    if (msg.includes('Unique constraint') || msg.includes('unique constraint')) {
      return { errors: [{ field: 'name', message: 'A collection with a similar name already exists.' }] }
    }
    return { error: 'An unexpected error occurred while updating the collection.' }
  }

  redirect('/admin/collections')
}

// ============================================================
// Delete Collection Server Action
// ============================================================

export async function deleteCollectionAction(
  collectionId: string
): Promise<{ success: boolean; error?: string; productCount?: number }> {
  // 1. Enforce admin auth
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Administrator access required.' }
  }

  if (!collectionId || typeof collectionId !== 'string') {
    return { success: false, error: 'Invalid collection ID.' }
  }

  try {
    // 2. Fetch collection with product count
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: true } },
      },
    })

    if (!collection) {
      return { success: false, error: 'Collection not found or already deleted.' }
    }

    // 3. Delete — products get collectionId set to null (onDelete: SetNull)
    await prisma.collection.delete({ where: { id: collectionId } })

    revalidatePath('/admin/collections')
    revalidatePath('/collections')
    revalidatePath(`/collections/${collection.slug}`)
    revalidatePath('/admin')
    revalidatePath('/shop')

    return { success: true, productCount: collection._count.products }
  } catch (error) {
    console.error('Failed to delete collection:', error)
    return { success: false, error: 'Failed to delete collection. Please try again.' }
  }
}
