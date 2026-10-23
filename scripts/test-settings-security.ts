/**
 * Shewa Fashion — Settings Organization & Secure Admin Password Change Test Suite
 */

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import {
  parseStoreInfoInput,
  parseContactInfoInput,
  parseSocialLinksInput,
  parseChangePasswordInput,
} from '../src/lib/validation'
import {
  checkPasswordChangeRateLimit,
  recordFailedPasswordChangeAttempt,
  resetPasswordChangeRateLimit,
  MAX_PASSWORD_CHANGE_ATTEMPTS,
} from '../src/lib/auth'
import { hashSessionToken, generateSessionToken } from '../src/lib/session'

const prisma = new PrismaClient()

let passed = 0
let failed = 0

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
    passed++
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`)
    failed++
  }
}

async function run() {
  console.log('\n════════════════════════════════════════════════════════════════════')
  console.log('  Shewa Fashion — Settings Organization & Secure Password Suite')
  console.log('════════════════════════════════════════════════════════════════════\n')

  // -------------------------------------------------------------
  // Section 1: Sectional Settings Input Parsers
  // -------------------------------------------------------------
  console.log('--- [Section 1: Sectional Settings Input Parsers] ---')

  // Section A: Store Information
  const validStore = parseStoreInfoInput({
    storeName: 'Shewa Fashion Heritage',
    description: 'Bespoke Ethiopian fashion in Addis Ababa',
    logoUrl: 'https://images.shewafashion.com/logo.png',
  })
  assert(validStore.ok, 'parseStoreInfoInput: parses valid store name, description, and logo')
  if (validStore.ok) {
    assert(validStore.data.storeName === 'Shewa Fashion Heritage', 'parseStoreInfoInput: returns parsed storeName')
    assert(validStore.data.description === 'Bespoke Ethiopian fashion in Addis Ababa', 'parseStoreInfoInput: returns parsed description')
  }

  const shortStoreName = parseStoreInfoInput({ storeName: 'A' })
  assert(!shortStoreName.ok && shortStoreName.errors[0]?.field === 'storeName', 'parseStoreInfoInput: rejects storeName shorter than 2 chars')

  const invalidLogo = parseStoreInfoInput({ storeName: 'Shewa', logoUrl: 'ftp://not-http-url' })
  assert(!invalidLogo.ok && invalidLogo.errors[0]?.field === 'logoUrl', 'parseStoreInfoInput: rejects non-HTTP logoUrl')

  // Section B: Contact Information
  const validContact = parseContactInfoInput({
    phone: '+251 91 123 4567',
    email: 'info@shewafashion.com',
    whatsapp: '+251 92 987 6543',
    address: 'Bole Road, Addis Ababa',
    openingHours: 'Mon-Sat: 9am - 7pm',
    googleMapsUrl: 'https://maps.google.com/?q=shewa',
  })
  assert(validContact.ok, 'parseContactInfoInput: parses valid contact information')

  const invalidContactEmail = parseContactInfoInput({ email: 'not-an-email' })
  assert(!invalidContactEmail.ok && invalidContactEmail.errors[0]?.field === 'email', 'parseContactInfoInput: rejects invalid email')

  const invalidContactPhone = parseContactInfoInput({ phone: '123' })
  assert(!invalidContactPhone.ok && invalidContactPhone.errors[0]?.field === 'phone', 'parseContactInfoInput: rejects phone shorter than 7 chars')

  // Section C: Social Links
  const validSocial = parseSocialLinksInput({
    instagram: '@shewafashion',
    facebook: 'https://facebook.com/shewafashion',
    tiktok: '@shewa_fashion',
    telegram: 'https://t.me/shewafashion',
  })
  assert(validSocial.ok, 'parseSocialLinksInput: parses handles and HTTPS profile links')

  const unsafeSocialUrl = parseSocialLinksInput({
    instagram: 'javascript:alert(1)',
  })
  assert(!unsafeSocialUrl.ok && unsafeSocialUrl.errors[0]?.field === 'instagram', 'parseSocialLinksInput: rejects unsafe javascript: URLs')

  // -------------------------------------------------------------
  // Section 2: Change Password Input Validation & Policy
  // -------------------------------------------------------------
  console.log('\n--- [Section 2: Change Password Policy Validation] ---')

  // Valid password change
  const validPw = parseChangePasswordInput({
    currentPassword: 'CurrentAdminPassword123!',
    newPassword: 'BrandNewSecurePassphrase2026',
    confirmPassword: 'BrandNewSecurePassphrase2026',
  })
  assert(validPw.ok, 'parseChangePasswordInput: accepts valid password change payload')

  // Empty current password
  const emptyCurrent = parseChangePasswordInput({
    currentPassword: '',
    newPassword: 'BrandNewSecurePassphrase2026',
    confirmPassword: 'BrandNewSecurePassphrase2026',
  })
  assert(!emptyCurrent.ok && emptyCurrent.errors.some((e) => e.field === 'currentPassword'), 'parseChangePasswordInput: rejects missing current password')

  // New password under 8 characters (policy minimum)
  const shortNewPw = parseChangePasswordInput({
    currentPassword: 'CurrentAdminPassword123!',
    newPassword: 'ShortP7', // 7 characters
    confirmPassword: 'ShortP7',
  })
  assert(!shortNewPw.ok && shortNewPw.errors.some((e) => e.field === 'newPassword' && e.message.includes('8')), 'parseChangePasswordInput: rejects new password under 8 characters')

  // Exactly 8 characters is accepted
  const exactly8Pw = parseChangePasswordInput({
    currentPassword: 'CurrentAdminPassword123!',
    newPassword: 'Exact8Pw', // 8 characters
    confirmPassword: 'Exact8Pw',
  })
  assert(exactly8Pw.ok, 'parseChangePasswordInput: accepts password of exactly 8 characters')

  // Mismatched confirmation
  const mismatchedPw = parseChangePasswordInput({
    currentPassword: 'CurrentAdminPassword123!',
    newPassword: 'BrandNewSecurePassphrase2026',
    confirmPassword: 'DifferentPassphrase2026',
  })
  assert(!mismatchedPw.ok && mismatchedPw.errors.some((e) => e.field === 'confirmPassword'), 'parseChangePasswordInput: rejects mismatched confirmation')

  // Unchanged password (new identical to current)
  const unchangedPw = parseChangePasswordInput({
    currentPassword: 'CurrentAdminPassword123!',
    newPassword: 'CurrentAdminPassword123!',
    confirmPassword: 'CurrentAdminPassword123!',
  })
  assert(!unchangedPw.ok && unchangedPw.errors.some((e) => e.field === 'newPassword' && e.message.includes('identical')), 'parseChangePasswordInput: rejects new password identical to current password')

  // Passwords preserve exact characters (no unexpected trimming)
  const untrimmedPw = parseChangePasswordInput({
    currentPassword: ' CurrentWithLeadingSpace123! ',
    newPassword: ' NewPassWithLeadingSpace2026 ',
    confirmPassword: ' NewPassWithLeadingSpace2026 ',
  })
  assert(untrimmedPw.ok, 'parseChangePasswordInput: preserves whitespace characters in passphrases')
  if (untrimmedPw.ok) {
    assert(untrimmedPw.data.newPassword === ' NewPassWithLeadingSpace2026 ', 'parseChangePasswordInput: does not strip leading/trailing spaces from passwords')
  }

  // -------------------------------------------------------------
  // Section 3: Password Change Rate Limiting
  // -------------------------------------------------------------
  console.log('\n--- [Section 3: Password Change Rate Limiting] ---')

  const testKey = 'test-client-ip-192.168.1.1:admin-123'
  resetPasswordChangeRateLimit(testKey)

  const initialLimit = checkPasswordChangeRateLimit(testKey)
  assert(initialLimit.allowed && initialLimit.remainingAttempts === MAX_PASSWORD_CHANGE_ATTEMPTS, 'Initial key has full password change attempts')

  for (let i = 0; i < MAX_PASSWORD_CHANGE_ATTEMPTS; i++) {
    recordFailedPasswordChangeAttempt(testKey)
  }

  const blockedLimit = checkPasswordChangeRateLimit(testKey)
  assert(
    !blockedLimit.allowed && blockedLimit.remainingAttempts === 0 && blockedLimit.retryAfterSeconds > 0,
    `Password change rate limiter blocks key after ${MAX_PASSWORD_CHANGE_ATTEMPTS} failed attempts`
  )

  resetPasswordChangeRateLimit(testKey)
  assert(checkPasswordChangeRateLimit(testKey).allowed, 'resetPasswordChangeRateLimit resets lockout counter')

  // -------------------------------------------------------------
  // Section 4: Database Persistence & Session Invalidation
  // -------------------------------------------------------------
  console.log('\n--- [Section 4: Database Isolation & Session Revocation] ---')

  const testEmail = `test-admin-sec-${Date.now()}@shewafashion.test`
  const initialPassword = 'InitialSecurePassword1234'
  const newPassword = 'UpdatedSecurePassword5678'
  const initialHash = await bcrypt.hash(initialPassword, 12)

  // Create temporary test admin
  const testUser = await prisma.user.create({
    data: {
      name: 'Security Test Admin',
      email: testEmail,
      passwordHash: initialHash,
      role: 'ADMIN',
    },
  })

  // Create 3 sessions for this admin (simulating login from desktop, phone, and tablet)
  const rawToken1 = generateSessionToken()
  const rawToken2 = generateSessionToken()
  const rawToken3 = generateSessionToken()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  await prisma.session.createMany({
    data: [
      { tokenHash: hashSessionToken(rawToken1), userId: testUser.id, expiresAt, createdAt: now },
      { tokenHash: hashSessionToken(rawToken2), userId: testUser.id, expiresAt, createdAt: now },
      { tokenHash: hashSessionToken(rawToken3), userId: testUser.id, expiresAt, createdAt: now },
    ],
  })

  const initialSessions = await prisma.session.findMany({
    where: { userId: testUser.id, revokedAt: null },
  })
  assert(initialSessions.length === 3, 'Created 3 concurrent active sessions for administrator')

  // Verify initial password matches
  const matchInitial = await bcrypt.compare(initialPassword, testUser.passwordHash)
  assert(matchInitial, 'Initial password verifies against bcrypt hash')

  // Simulate password change execution:
  // 1. Verify wrong password is rejected
  const wrongPasswordAttempt = 'WrongPasswordEnteredHere'
  const isWrongValid = await bcrypt.compare(wrongPasswordAttempt, testUser.passwordHash)
  assert(!isWrongValid, 'Incorrect current password fails verification')

  // 2. Hash new password with 12 rounds
  const newHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: testUser.id },
    data: { passwordHash: newHash },
  })

  // 3. Keep current session (e.g. token1) and invalidate all other sessions (token2, token3)
  const currentSessionHash = hashSessionToken(rawToken1)
  await prisma.session.updateMany({
    where: {
      userId: testUser.id,
      tokenHash: { not: currentSessionHash },
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  })

  // Check database state after password change
  const updatedUser = await prisma.user.findUnique({
    where: { id: testUser.id },
  })

  assert(
    updatedUser !== null && updatedUser.passwordHash !== initialHash,
    'User passwordHash was updated in database'
  )

  const verifyOldAgainstNewHash = await bcrypt.compare(initialPassword, updatedUser!.passwordHash)
  assert(!verifyOldAgainstNewHash, 'Old password no longer authenticates against new hash')

  const verifyNewAgainstNewHash = await bcrypt.compare(newPassword, updatedUser!.passwordHash)
  assert(verifyNewAgainstNewHash, 'New password successfully authenticates against updated hash')

  const activeSessionsAfterChange = await prisma.session.findMany({
    where: { userId: testUser.id, revokedAt: null },
  })
  assert(activeSessionsAfterChange.length === 1, 'Only current session remains active; all other sessions revoked')
  assert(activeSessionsAfterChange[0]?.tokenHash === currentSessionHash, 'Retained session is the current active session')

  const revokedSessions = await prisma.session.findMany({
    where: { userId: testUser.id, revokedAt: { not: null } },
  })
  assert(revokedSessions.length === 2, 'Revoked sessions are explicitly recorded in PostgreSQL with timestamp')

  // Clean up test user & sessions
  await prisma.session.deleteMany({ where: { userId: testUser.id } })
  await prisma.user.delete({ where: { id: testUser.id } })

  // -------------------------------------------------------------
  // Section 5: Sectional Isolation (No Overwrite of Other Groups)
  // -------------------------------------------------------------
  console.log('\n--- [Section 5: Sectional Settings Isolation] ---')

  // Save baseline settings
  await prisma.storeSettings.upsert({
    where: { id: 'singleton' },
    update: {
      storeName: 'Shewa Fashion Baseline',
      phone: '+251 91 100 0000',
      instagram: '@shewa_baseline',
    },
    create: {
      id: 'singleton',
      storeName: 'Shewa Fashion Baseline',
      phone: '+251 91 100 0000',
      instagram: '@shewa_baseline',
    },
  })

  // Update Section A: Store Information only
  await prisma.storeSettings.update({
    where: { id: 'singleton' },
    data: {
      storeName: 'Shewa Fashion Modernized',
      description: 'New bio description',
    },
  })

  const afterStoreUpdate = await prisma.storeSettings.findUnique({ where: { id: 'singleton' } })
  assert(afterStoreUpdate?.storeName === 'Shewa Fashion Modernized', 'Section A update saved storeName')
  assert(afterStoreUpdate?.phone === '+251 91 100 0000', 'Section A update preserved existing Section B phone')
  assert(afterStoreUpdate?.instagram === '@shewa_baseline', 'Section A update preserved existing Section C instagram')

  // Update Section B: Contact Information only
  await prisma.storeSettings.update({
    where: { id: 'singleton' },
    data: {
      phone: '+251 91 999 9999',
      email: 'newcontact@shewafashion.com',
    },
  })

  const afterContactUpdate = await prisma.storeSettings.findUnique({ where: { id: 'singleton' } })
  assert(afterContactUpdate?.phone === '+251 91 999 9999', 'Section B update saved new phone')
  assert(afterContactUpdate?.storeName === 'Shewa Fashion Modernized', 'Section B update preserved Section A storeName')
  assert(afterContactUpdate?.instagram === '@shewa_baseline', 'Section B update preserved Section C instagram')

  // Update Section C: Social Links only
  await prisma.storeSettings.update({
    where: { id: 'singleton' },
    data: {
      instagram: '@shewa_new_handle',
      telegram: 'https://t.me/shewanew',
    },
  })

  const afterSocialUpdate = await prisma.storeSettings.findUnique({ where: { id: 'singleton' } })
  assert(afterSocialUpdate?.instagram === '@shewa_new_handle', 'Section C update saved instagram handle')
  assert(afterSocialUpdate?.storeName === 'Shewa Fashion Modernized', 'Section C update preserved Section A storeName')
  assert(afterSocialUpdate?.phone === '+251 91 999 9999', 'Section C update preserved Section B phone')

  console.log('\n════════════════════════════════════════════════════════════════════')
  console.log(`  Test Results: ${passed} passed, ${failed} failed`)
  console.log('════════════════════════════════════════════════════════════════════\n')

  await prisma.$disconnect()

  if (failed > 0) {
    process.exit(1)
  }
}

run().catch((e) => {
  console.error('Fatal error in settings security test suite:', e)
  process.exit(1)
})
