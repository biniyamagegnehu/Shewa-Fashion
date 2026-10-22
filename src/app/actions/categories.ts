'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'
import { slugify, parseCategoryInput } from '@/lib/validation'
import { handlePrismaError } from '@/lib/errors'
import type { ValidationDetail } from '@/lib/api-response'

export interface CategoryActionState {
  error?: string
  errors?: ValidationDetail[]
  success?: boolean
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

  // 2. Validate input using centralized validation
  const parsed = parseCategoryInput({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const { name, description } = parsed.data

  // 3. Generate unique slug from name
  const baseSlug = slugify(name) || 'category'
  let slug = baseSlug
  let counter = 1
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) break
    counter++
    slug = `${baseSlug}-${counter}`
  }

  // 4. Persist
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
    const errRes = handlePrismaError(error, 'An unexpected error occurred while creating the category.')
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
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

  // 3. Validate input
  const parsed = parseCategoryInput({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const { name, description } = parsed.data

  // 4. Handle isActive toggle
  const isActive = formData.get('isActive') !== 'false'

  // 5. Regenerate slug from new name, keeping existing slug if name is unchanged or conflict-safe
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

  // 6. Persist update
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
    const errRes = handlePrismaError(error, 'An unexpected error occurred while updating the category.')
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
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

    // 3. Safety check — schema uses onDelete: SetNull
    await prisma.category.delete({ where: { id: categoryId } })

    revalidatePath('/admin/categories')
    revalidatePath('/categories')
    revalidatePath(`/categories/${category.slug}`)
    revalidatePath('/admin')
    revalidatePath('/shop')

    return { success: true }
  } catch (error) {
    console.error('Failed to delete category:', error)
    const errRes = handlePrismaError(error, 'Failed to delete category. Please try again.')
    return { success: false, error: errRes.message }
  }
}
