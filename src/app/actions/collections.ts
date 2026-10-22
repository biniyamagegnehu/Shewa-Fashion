'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'
import { slugify, parseCollectionInput } from '@/lib/validation'
import { handlePrismaError } from '@/lib/errors'
import type { ValidationDetail } from '@/lib/api-response'

export interface CollectionActionState {
  error?: string
  errors?: ValidationDetail[]
  success?: boolean
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

  // 2. Validate input using centralized validation
  const parsed = parseCollectionInput({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const { name, description } = parsed.data

  // 3. Generate unique slug from name
  const baseSlug = slugify(name) || 'collection'
  let slug = baseSlug
  let counter = 1
  while (true) {
    const existing = await prisma.collection.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) break
    counter++
    slug = `${baseSlug}-${counter}`
  }

  // 4. Persist
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
    const errRes = handlePrismaError(error, 'An unexpected error occurred while creating the collection.')
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
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

  // 3. Validate input
  const parsed = parseCollectionInput({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const { name, description } = parsed.data

  // 4. Handle isActive toggle
  const isActive = formData.get('isActive') !== 'false'

  // 5. Regenerate slug from new name, keeping safe uniqueness
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

  // 6. Persist update
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
    const errRes = handlePrismaError(error, 'An unexpected error occurred while updating the collection.')
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
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
    const errRes = handlePrismaError(error, 'Failed to delete collection. Please try again.')
    return { success: false, error: errRes.message }
  }
}
