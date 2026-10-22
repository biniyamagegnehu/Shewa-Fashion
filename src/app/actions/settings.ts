'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth'
import { parseStoreSettingsInput } from '@/lib/validation'
import { handlePrismaError } from '@/lib/errors'
import {
  validateImageBuffer,
  isStorageConfigured,
  uploadSettingsImage,
  deleteStoredImage,
  isImageShared,
} from '@/lib/storage'
import type { ValidationDetail } from '@/lib/api-response'

export interface SettingsActionState {
  error?: string
  errors?: ValidationDetail[]
  success?: boolean
}

// ============================================================
// Update Store Settings Action (Singleton)
// ============================================================

export async function updateStoreSettingsAction(
  _prevState: SettingsActionState | undefined,
  formData: FormData
): Promise<SettingsActionState> {
  // 1. Enforce server-side administrator authorization
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  // 2. Fetch current singleton record if it exists
  const existing = await prisma.storeSettings.findUnique({
    where: { id: 'singleton' },
  })

  // 3. Validate form inputs
  const parsed = parseStoreSettingsInput({
    storeName: formData.get('storeName'),
    description: formData.get('description'),
    logoUrl: formData.get('logoUrl'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    whatsapp: formData.get('whatsapp'),
    address: formData.get('address'),
    openingHours: formData.get('openingHours'),
    instagram: formData.get('instagram'),
    facebook: formData.get('facebook'),
    tiktok: formData.get('tiktok'),
    telegram: formData.get('telegram'),
    googleMapsUrl: formData.get('googleMapsUrl'),
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const {
    storeName,
    description,
    phone,
    email,
    whatsapp,
    address,
    openingHours,
    instagram,
    facebook,
    tiktok,
    telegram,
    googleMapsUrl,
  } = parsed.data

  let finalLogoUrl = existing?.logoUrl ?? null
  const removeLogo = formData.get('removeLogo') === 'true'

  if (removeLogo) {
    finalLogoUrl = null
  }

  // 4. Handle logo image file upload if provided
  const logoFile = formData.get('logo')
  if (logoFile && typeof logoFile === 'object' && 'arrayBuffer' in logoFile) {
    const file = logoFile as File
    if (file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const imgValidation = validateImageBuffer(buffer)
      if (!imgValidation.ok) {
        return {
          errors: [{ field: 'logo', message: imgValidation.error || 'Invalid logo image file.' }],
        }
      }

      if (!isStorageConfigured()) {
        return {
          error:
            'Image storage is not configured. Please configure storage credentials in .env.local to upload a store logo.',
        }
      }

      const uploadRes = await uploadSettingsImage(buffer)
      if (!uploadRes.ok || !uploadRes.url) {
        return { error: uploadRes.error || 'Failed to upload brand logo.' }
      }
      finalLogoUrl = uploadRes.url
    }
  } else if (!removeLogo && parsed.data.logoUrl) {
    // If a direct URL was entered
    finalLogoUrl = parsed.data.logoUrl
  }

  // 5. Upsert singleton record
  try {
    await prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      update: {
        storeName,
        description,
        logoUrl: finalLogoUrl,
        phone,
        email,
        whatsapp,
        address,
        openingHours,
        instagram,
        facebook,
        tiktok,
        telegram,
        googleMapsUrl,
      },
      create: {
        id: 'singleton',
        storeName,
        description,
        logoUrl: finalLogoUrl,
        phone,
        email,
        whatsapp,
        address,
        openingHours,
        instagram,
        facebook,
        tiktok,
        telegram,
        googleMapsUrl,
      },
    })

    // If logo was replaced or removed, safely clean up old stored logo if not shared
    if (existing?.logoUrl && existing.logoUrl !== finalLogoUrl) {
      const shared = await isImageShared(existing.logoUrl)
      if (!shared) {
        await deleteStoredImage(existing.logoUrl).catch((warnErr) => {
          console.warn('Could not clean up obsolete store logo from storage:', warnErr)
        })
      }
    }

    // 6. Revalidate all public and admin pages that reflect store settings
    revalidatePath('/admin/settings')
    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/contact')
    revalidatePath('/gallery')
    revalidatePath('/shop')

    return { success: true }
  } catch (err) {
    console.error('Failed to update store settings:', err)
    if (finalLogoUrl && finalLogoUrl !== existing?.logoUrl && finalLogoUrl !== parsed.data.logoUrl) {
      await deleteStoredImage(finalLogoUrl).catch((cleanupErr) => {
        console.warn('Failed to clean up uploaded logo after DB failure:', cleanupErr)
      })
    }
    const errRes = handlePrismaError(err, 'Failed to save store settings. Please try again.')
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
  }
}
