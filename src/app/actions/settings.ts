'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import {
  verifyAdminSession,
  getClientIp,
  checkPasswordChangeRateLimit,
  recordFailedPasswordChangeAttempt,
  resetPasswordChangeRateLimit,
} from '@/lib/auth'
import {
  getAdminSession,
  createAdminSession,
  hashSessionToken,
} from '@/lib/session'
import {
  parseStoreSettingsInput,
  parseStoreInfoInput,
  parseContactInfoInput,
  parseSocialLinksInput,
  parseChangePasswordInput,
} from '@/lib/validation'
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

export interface PasswordActionState {
  error?: string
  errors?: ValidationDetail[]
  success?: boolean
}

const PUBLIC_SETTINGS_PATHS = [
  '/admin/settings',
  '/',
  '/about',
  '/contact',
  '/gallery',
  '/shop',
]

function revalidateSettingsPaths() {
  for (const p of PUBLIC_SETTINGS_PATHS) {
    revalidatePath(p)
  }
}

// ============================================================
// Section A: Update Store Information Action
// ============================================================

export async function updateStoreInfoAction(
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

  // 3. Validate Section A inputs
  const parsed = parseStoreInfoInput({
    storeName: formData.get('storeName'),
    description: formData.get('description'),
    logoUrl: formData.get('logoUrl'),
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const { storeName, description } = parsed.data

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
    finalLogoUrl = parsed.data.logoUrl
  }

  // 5. Update only Section A fields, preserving all other settings
  try {
    await prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      update: {
        storeName,
        description,
        logoUrl: finalLogoUrl,
      },
      create: {
        id: 'singleton',
        storeName,
        description,
        logoUrl: finalLogoUrl,
      },
    })

    // Clean up replaced or removed logo if not shared
    if (existing?.logoUrl && existing.logoUrl !== finalLogoUrl) {
      const shared = await isImageShared(existing.logoUrl)
      if (!shared) {
        await deleteStoredImage(existing.logoUrl).catch((warnErr) => {
          console.warn('Could not clean up obsolete store logo from storage:', warnErr)
        })
      }
    }

    revalidateSettingsPaths()
    return { success: true }
  } catch (err) {
    console.error('Failed to update store info:', err)
    if (finalLogoUrl && finalLogoUrl !== existing?.logoUrl && finalLogoUrl !== parsed.data.logoUrl) {
      await deleteStoredImage(finalLogoUrl).catch(() => {})
    }
    const errRes = handlePrismaError(err, 'Failed to save store information. Please try again.')
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
  }
}

// ============================================================
// Section B: Update Contact Information Action
// ============================================================

export async function updateContactInfoAction(
  _prevState: SettingsActionState | undefined,
  formData: FormData
): Promise<SettingsActionState> {
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  const parsed = parseContactInfoInput({
    phone: formData.get('phone'),
    email: formData.get('email'),
    whatsapp: formData.get('whatsapp'),
    address: formData.get('address'),
    openingHours: formData.get('openingHours'),
    googleMapsUrl: formData.get('googleMapsUrl'),
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const { phone, email, whatsapp, address, openingHours, googleMapsUrl } = parsed.data

  try {
    await prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      update: {
        phone,
        email,
        whatsapp,
        address,
        openingHours,
        googleMapsUrl,
      },
      create: {
        id: 'singleton',
        storeName: 'Shewa Fashion',
        phone,
        email,
        whatsapp,
        address,
        openingHours,
        googleMapsUrl,
      },
    })

    revalidateSettingsPaths()
    return { success: true }
  } catch (err) {
    console.error('Failed to update contact info:', err)
    const errRes = handlePrismaError(err, 'Failed to save contact information. Please try again.')
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
  }
}

// ============================================================
// Section C: Update Social Links Action
// ============================================================

export async function updateSocialLinksAction(
  _prevState: SettingsActionState | undefined,
  formData: FormData
): Promise<SettingsActionState> {
  const admin = await verifyAdminSession()
  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Unauthorized. Administrator access required.' }
  }

  const parsed = parseSocialLinksInput({
    instagram: formData.get('instagram'),
    facebook: formData.get('facebook'),
    tiktok: formData.get('tiktok'),
    telegram: formData.get('telegram'),
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const { instagram, facebook, tiktok, telegram } = parsed.data

  try {
    await prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      update: {
        instagram,
        facebook,
        tiktok,
        telegram,
      },
      create: {
        id: 'singleton',
        storeName: 'Shewa Fashion',
        instagram,
        facebook,
        tiktok,
        telegram,
      },
    })

    revalidateSettingsPaths()
    return { success: true }
  } catch (err) {
    console.error('Failed to update social links:', err)
    const errRes = handlePrismaError(err, 'Failed to save social links. Please try again.')
    if (errRes.field) {
      return { errors: [{ field: errRes.field, message: errRes.message }] }
    }
    return { error: errRes.message }
  }
}

// ============================================================
// Full Store Settings Action (Backward Compatible & Unified)
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

    revalidateSettingsPaths()
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

// ============================================================
// Section D: Secure Administrator Change Password Action
// ============================================================

export async function changeAdminPasswordAction(
  _prevState: PasswordActionState | undefined,
  formData: FormData
): Promise<PasswordActionState> {
  // 1. Enforce Server-Side Administrator Authentication
  const sessionResult = await getAdminSession()
  if (!sessionResult || !sessionResult.user || sessionResult.user.role !== 'ADMIN') {
    return { error: 'Your session has expired. Please log in again to change your password.' }
  }

  // 2. Enforce Rate Limiting per IP + Administrator ID
  const clientIp = await getClientIp()
  const rateLimitKey = `${clientIp}:${sessionResult.user.id}`
  const rateLimit = checkPasswordChangeRateLimit(rateLimitKey)
  if (!rateLimit.allowed) {
    return {
      error: `Too many password change attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
    }
  }

  // 3. Validate Submitted Fields
  const currentPasswordRaw = formData.get('currentPassword')
  const newPasswordRaw = formData.get('newPassword')
  const confirmPasswordRaw = formData.get('confirmPassword')

  const parsed = parseChangePasswordInput({
    currentPassword: currentPasswordRaw,
    newPassword: newPasswordRaw,
    confirmPassword: confirmPasswordRaw,
  })

  if (!parsed.ok) {
    return { errors: parsed.errors }
  }

  const { currentPassword, newPassword } = parsed.data

  try {
    // 4. Retrieve authenticated administrator account securely from PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: sessionResult.user.id },
      select: { id: true, email: true, passwordHash: true, role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return { error: 'Administrator account not found.' }
    }

    // 5. Verify current password against stored bcrypt hash
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isCurrentValid) {
      recordFailedPasswordChangeAttempt(rateLimitKey)
      return {
        errors: [{ field: 'currentPassword', message: 'Current password is incorrect.' }],
        error: 'Current password is incorrect. Please check your password and try again.',
      }
    }

    // 6. Verify new password is not identical to existing password hash
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash)
    if (isSamePassword) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'New password cannot be identical to your current password.',
          },
        ],
        error: 'New password cannot be identical to your current password.',
      }
    }

    // 7. Hash new password with bcrypt (12 rounds)
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    // 8. Update stored password hash in PostgreSQL
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    })

    // 9. Rotate current session token and invalidate all other sessions
    // createAdminSession revokes the current token and creates a new one in DB + sets cookie
    const newSession = await createAdminSession(user.id)
    const newSessionTokenHash = hashSessionToken(newSession.rawToken)

    // Invalidate any other active sessions belonging to this user
    await prisma.session.updateMany({
      where: {
        userId: user.id,
        tokenHash: { not: newSessionTokenHash },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    })

    // 10. Reset rate limit counter on success
    resetPasswordChangeRateLimit(rateLimitKey)

    revalidatePath('/admin')
    revalidatePath('/admin/settings')

    return { success: true }
  } catch (err) {
    console.error('Failed to change administrator password:', err)
    return {
      error: 'An unexpected database error occurred while updating your password. Please try again.',
    }
  }
}
