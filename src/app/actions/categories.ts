'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'
import { slugify } from '@/lib/validation'
import type { ValidationDetail } from '@/lib/api-response'

export interface CategoryActionState {
  error?: string
  errors?: ValidationDetail[]
  success?: boolean
}

// ============================================================
// Validation helpers
// ============================================================

function validateCategoryName(raw: unknown): string | ValidationDetail {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { field: 'name', message: 'Category name is required.' }
  }
  const name = raw.trim()
  if (name.length < 2) {
    return { field: 'name', message: 'Category name must be at least 2 characters.' }
  }
  if (name.length > 80) {
    return { field: 'name', message: 'Category name cannot exceed 80 characters.' }
  }
  return name
}

function validateCategoryDescription(raw: unknown): string | null | ValidationDetail {
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
// Create Category Server Action
// ============================================================

export async function createCategoryAction(
  _prevState: CategoryActionState | undefined,
  formData: FormData
): Promise<CategoryActionState> {
  // 1. Enforce server-side administrator authentication
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  // 2. Validate Name
  const nameResult = validateCategoryName(formData.get('name'))
  if (typeof nameResult !== 'string') {
    return { errors: [nameResult] }
  }
  const name = nameResult

  // 3. Validate Description (optional)
  const descResult = validateCategoryDescription(formData.get('description'))
  if (descResult !== null && typeof descResult !== 'string') {
    return { errors: [descResult] }
  }
  const description = descResult

  // 4. Generate unique slug from name
  const baseSlug = slugify(name) || 'category'
  let slug = baseSlug
  let counter = 1
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) break
    counter++
    slug = `${baseSlug}-${counter}`
  }

  // 5. Persist
  try {
    await prisma.category.create({
      data: { name, slug, description },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/categories')
    revalidatePath('/admin')
    revalidatePath('/shop')
  } catch (error) {
    console.error('Failed to create category:', error)
    const msg = String(error)
    if (msg.includes('Unique constraint') || msg.includes('unique constraint')) {
      return { errors: [{ field: 'name', message: 'A category with a similar name already exists. Please use a different name.' }] }
    }
    return { error: 'An unexpected error occurred while creating the category.' }
  }

  redirect('/admin/categories')
}

// ============================================================
// Update Category Server Action
// ============================================================

export async function updateCategoryAction(
  categoryId: string,
  _prevState: CategoryActionState | undefined,
  formData: FormData
): Promise<CategoryActionState> {
  // 1. Enforce admin auth
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  if (!categoryId || typeof categoryId !== 'string') {
    return { error: 'Invalid category ID.' }
  }

  // 2. Verify category exists
  const existing = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, slug: true } })
  if (!existing) {
    return { error: 'Category not found.' }
  }

  // 3. Validate Name
  const nameResult = validateCategoryName(formData.get('name'))
  if (typeof nameResult !== 'string') {
    return { errors: [nameResult] }
  }
  const name = nameResult

  // 4. Validate Description
  const descResult = validateCategoryDescription(formData.get('description'))
  if (descResult !== null && typeof descResult !== 'string') {
    return { errors: [descResult] }
  }
  const description = descResult

  // 5. Handle isActive toggle
  const isActive = formData.get('isActive') !== 'false'

  // 6. Regenerate slug from new name, keeping existing slug if name is unchanged or conflict-safe
  const newBaseSlug = slugify(name) || 'category'
  let newSlug = newBaseSlug
  let counter = 1
  while (true) {
    const conflict = await prisma.category.findUnique({
      where: { slug: newSlug },
      select: { id: true },
    })
    // No conflict, or the conflict is the current record (keeping same slug)
    if (!conflict || conflict.id === categoryId) break
    counter++
    newSlug = `${newBaseSlug}-${counter}`
  }

  // 7. Persist update
  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: { name, slug: newSlug, description, isActive },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/categories')
    revalidatePath(`/categories/${existing.slug}`)
    revalidatePath(`/categories/${newSlug}`)
    revalidatePath('/admin')
    revalidatePath('/shop')
  } catch (error) {
    console.error('Failed to update category:', error)
    const msg = String(error)
    if (msg.includes('Unique constraint') || msg.includes('unique constraint')) {
      return { errors: [{ field: 'name', message: 'A category with a similar name already exists.' }] }
    }
    return { error: 'An unexpected error occurred while updating the category.' }
  }

  redirect('/admin/categories')
}

// ============================================================
// Delete Category Server Action
// ============================================================

export async function deleteCategoryAction(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Enforce admin auth
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Administrator access required.' }
  }

  if (!categoryId || typeof categoryId !== 'string') {
    return { success: false, error: 'Invalid category ID.' }
  }

  try {
    // 2. Fetch category with product count
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: true } },
      },
    })

    if (!category) {
      return { success: false, error: 'Category not found or already deleted.' }
    }

    // 3. Safety check — the schema uses onDelete: SetNull so deletion won't orphan products,
    //    but we warn the user explicitly in the UI. The action proceeds as per schema design.
    // Products will have their categoryId set to null automatically by PostgreSQL.

    await prisma.category.delete({ where: { id: categoryId } })

    revalidatePath('/admin/categories')
    revalidatePath('/categories')
    revalidatePath(`/categories/${category.slug}`)
    revalidatePath('/admin')
    revalidatePath('/shop')

    return { success: true }
  } catch (error) {
    console.error('Failed to delete category:', error)
    return { success: false, error: 'Failed to delete category. Please try again.' }
  }
}
