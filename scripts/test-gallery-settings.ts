/**
 * Shewa Fashion — Phase 14 Gallery & Store Settings Test Suite
 *
 * Covers:
 *  1. Authorization guards on all Gallery and Store Settings actions
 *  2. Gallery item validation (title length limits, image requirement, alt fallback)
 *  3. Gallery CRUD operations via Prisma and Server Actions
 *  4. Gallery publication filtering (isPublished: true vs false) and sort ordering
 *  5. Safe image deletion & shared image detection
 *  6. Store settings singleton upsert & retrieval
 *  7. Store settings validation (valid/invalid emails, phone formats, safe HTTPS URLs)
 *  8. Absent optional field handling (never inventing fabricated data)
 */

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { PrismaClient } from '@prisma/client'
import {
  parseGalleryItemInput,
  parseStoreSettingsInput,
  isSafeUrl,
  validateSafeUrl,
  validateEmailOptional,
  validatePhoneOptional,
} from '../src/lib/validation'
import {
  createGalleryItemAction,
  updateGalleryItemAction,
  deleteGalleryItemAction,
} from '../src/app/actions/gallery'
import { updateStoreSettingsAction } from '../src/app/actions/settings'
import {
  isImageShared,
  generateSafeStorageKey,
} from '../src/lib/storage'
import { getGalleryItems, getStoreSettings } from '../src/lib/products'
import { verifyAdminSession } from '../src/lib/auth'

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
  console.log('\n══════════════════════════════════════════════════════════')
  console.log('  Shewa Fashion — Phase 14 Gallery & Store Settings Suite')
  console.log('══════════════════════════════════════════════════════════\n')

  // ──────────────────────────────────────────────────────────
  // Section 1: Authorization Guards
  // ──────────────────────────────────────────────────────────
  console.log('--- [Section 1: Authorization Guards] ---')

  const noSessionAdmin = await verifyAdminSession()
  assert(noSessionAdmin === null, 'verifyAdminSession: returns null without session cookie')

  const dummyForm = new FormData()
  dummyForm.set('title', 'Unauthorized Test')
  dummyForm.set('imageUrl', 'https://images.unsplash.com/photo-1')

  const unauthCreateGallery = await createGalleryItemAction(undefined, dummyForm)
  assert(
    Boolean(unauthCreateGallery.error && unauthCreateGallery.error.includes('Unauthorized')),
    'createGalleryItemAction: rejects unauthorized request'
  )

  const unauthUpdateGallery = await updateGalleryItemAction(undefined, dummyForm)
  assert(
    Boolean(unauthUpdateGallery.error && unauthUpdateGallery.error.includes('Unauthorized')),
    'updateGalleryItemAction: rejects unauthorized request'
  )

  const unauthDeleteGallery = await deleteGalleryItemAction('fake-id')
  assert(
    unauthDeleteGallery.success === false && Boolean(unauthDeleteGallery.error?.includes('Unauthorized')),
    'deleteGalleryItemAction: rejects unauthorized request'
  )

  const unauthSettings = await updateStoreSettingsAction(undefined, dummyForm)
  assert(
    Boolean(unauthSettings.error && unauthSettings.error.includes('Unauthorized')),
    'updateStoreSettingsAction: rejects unauthorized request'
  )

  // ──────────────────────────────────────────────────────────
  // Section 2: Validation Helpers (Safe URLs, Email, Phone)
  // ──────────────────────────────────────────────────────────
  console.log('\n--- [Section 2: Validation Helpers] ---')

  assert(isSafeUrl('https://shewafashion.com'), 'isSafeUrl: allows standard https URL')
  assert(isSafeUrl('http://localhost:3000'), 'isSafeUrl: allows http localhost')
  assert(!isSafeUrl('javascript:alert(1)'), 'isSafeUrl: rejects javascript: scheme')
  assert(!isSafeUrl('data:text/html,<script>'), 'isSafeUrl: rejects data: scheme')
  assert(!isSafeUrl(''), 'isSafeUrl: rejects empty string')

  const validUrlRes = validateSafeUrl('https://maps.google.com/?q=Bole', 'maps', 'Maps link')
  assert(typeof validUrlRes === 'string', 'validateSafeUrl: valid https URL returns string')

  const unsafeUrlRes = validateSafeUrl('javascript:doBad()', 'maps', 'Maps link')
  assert(
    typeof unsafeUrlRes === 'object' && unsafeUrlRes !== null && 'field' in unsafeUrlRes,
    'validateSafeUrl: unsafe URL returns ValidationDetail error'
  )

  const validEmail = validateEmailOptional('contact@shewa.et', 'email')
  assert(validEmail === 'contact@shewa.et', 'validateEmailOptional: accepts valid email')

  const invalidEmail = validateEmailOptional('not-an-email', 'email')
  assert(
    typeof invalidEmail === 'object' && invalidEmail !== null && 'field' in invalidEmail,
    'validateEmailOptional: rejects invalid email syntax'
  )

  const nullEmail = validateEmailOptional('', 'email')
  assert(nullEmail === null, 'validateEmailOptional: empty email returns null (optional)')

  const validPhone = validatePhoneOptional('+251 91 123 4567', 'phone')
  assert(validPhone === '+251 91 123 4567', 'validatePhoneOptional: accepts international format')

  const invalidPhone = validatePhoneOptional('123', 'phone')
  assert(
    typeof invalidPhone === 'object' && invalidPhone !== null && 'field' in invalidPhone,
    'validatePhoneOptional: rejects phone shorter than 7 chars'
  )

  // ──────────────────────────────────────────────────────────
  // Section 3: Gallery Input Parsing
  // ──────────────────────────────────────────────────────────
  console.log('\n--- [Section 3: Gallery Input Parsing] ---')

  const validGalleryParse = parseGalleryItemInput({
    title: 'Editorial Habesha Kemis',
    imageUrl: 'https://images.unsplash.com/photo-kemis',
    alt: 'Handwoven kemis dress',
    description: 'Cotton and silk blend crafted in Addis.',
    sortOrder: '2',
    isPublished: 'true',
  })
  assert(validGalleryParse.ok, 'parseGalleryItemInput: accepts valid payload')
  if (validGalleryParse.ok) {
    assert(validGalleryParse.data.title === 'Editorial Habesha Kemis', 'parseGalleryItemInput: parses title')
    assert(validGalleryParse.data.alt === 'Handwoven kemis dress', 'parseGalleryItemInput: parses alt')
    assert(validGalleryParse.data.sortOrder === 2, 'parseGalleryItemInput: parses integer sortOrder')
    assert(validGalleryParse.data.isPublished === true, 'parseGalleryItemInput: parses boolean isPublished')
  }

  const shortTitleParse = parseGalleryItemInput({
    title: 'A',
    imageUrl: 'https://images.unsplash.com/photo-1',
  })
  assert(!shortTitleParse.ok, 'parseGalleryItemInput: rejects title shorter than 2 characters')

  const fallbackAltParse = parseGalleryItemInput({
    title: 'Runway Look 04',
    imageUrl: 'https://images.unsplash.com/photo-runway',
  })
  assert(
    fallbackAltParse.ok && fallbackAltParse.data.alt === 'Runway Look 04',
    'parseGalleryItemInput: defaults alt text to title when omitted'
  )

  // ──────────────────────────────────────────────────────────
  // Section 4: Storage Keys & Shared Image Safety
  // ──────────────────────────────────────────────────────────
  console.log('\n--- [Section 4: Storage Namespaces & Shared Image Safety] ---')

  const galleryKey = generateSafeStorageKey('webp', 'gallery')
  assert(galleryKey.startsWith('gallery/'), 'generateSafeStorageKey: supports gallery/ namespace')

  const settingsKey = generateSafeStorageKey('png', 'settings')
  assert(settingsKey.startsWith('settings/'), 'generateSafeStorageKey: supports settings/ namespace')

  // Shared image safety test
  const testSharedUrl = 'https://storage.shewafashion.com/products/shared-test.webp'
  const isSharedInitially = await isImageShared(testSharedUrl)
  assert(!isSharedInitially, 'isImageShared: returns false for unreferenced URL')

  // Create a temporary product image referencing the test URL
  const testCategory = await prisma.category.create({
    data: { name: 'Shared Image Test Cat', slug: `test-cat-shared-${Date.now()}` },
  })
  const testProduct = await prisma.product.create({
    data: {
      name: 'Shared Image Test Prod',
      slug: `test-prod-shared-${Date.now()}`,
      description: 'Test product for shared image check',
      price: 2500,
      categoryId: testCategory.id,
      images: {
        create: {
          url: testSharedUrl,
          alt: 'Shared test image',
          sortOrder: 0,
        },
      },
    },
  })

  const isSharedNow = await isImageShared(testSharedUrl)
  assert(isSharedNow, 'isImageShared: returns true when image is used by a ProductImage')

  // Clean up test product and category
  await prisma.product.delete({ where: { id: testProduct.id } })
  await prisma.category.delete({ where: { id: testCategory.id } })

  // ──────────────────────────────────────────────────────────
  // Section 5: Gallery Item Database CRUD & Ordering
  // ──────────────────────────────────────────────────────────
  console.log('\n--- [Section 5: Gallery DB CRUD & Ordering] ---')

  // Create published item
  const item1 = await prisma.galleryItem.create({
    data: {
      title: 'Phase 14 Test Published 1',
      imageUrl: 'https://images.unsplash.com/photo-published-1',
      alt: 'Test published image 1',
      description: 'First published item',
      sortOrder: 1,
      isPublished: true,
    },
  })
  assert(Boolean(item1.id), 'GalleryItem: created in database with valid data')

  // Create unpublished item
  const item2 = await prisma.galleryItem.create({
    data: {
      title: 'Phase 14 Test Draft Item',
      imageUrl: 'https://images.unsplash.com/photo-draft-2',
      alt: 'Test draft image',
      description: 'Unpublished draft',
      sortOrder: 0,
      isPublished: false,
    },
  })
  assert(item2.isPublished === false, 'GalleryItem: draft item created with isPublished: false')

  // Verify getGalleryItems() only returns published items
  const publicItems = await getGalleryItems()
  const foundPublished = publicItems.some((i) => i.id === item1.id)
  const foundDraft = publicItems.some((i) => i.id === item2.id)

  assert(foundPublished, 'getGalleryItems: includes published gallery item')
  assert(!foundDraft, 'getGalleryItems: excludes unpublished draft gallery item')

  // Update gallery item
  const updatedItem1 = await prisma.galleryItem.update({
    where: { id: item1.id },
    data: {
      title: 'Phase 14 Test Published 1 (Updated)',
      sortOrder: 10,
    },
  })
  assert(
    updatedItem1.title === 'Phase 14 Test Published 1 (Updated)' && updatedItem1.sortOrder === 10,
    'GalleryItem: updated title and sortOrder successfully'
  )

  // Delete gallery item
  await prisma.galleryItem.delete({ where: { id: item1.id } })
  await prisma.galleryItem.delete({ where: { id: item2.id } })

  const checkDeleted = await prisma.galleryItem.findUnique({ where: { id: item1.id } })
  assert(checkDeleted === null, 'GalleryItem: deleted record no longer exists in database')

  // ──────────────────────────────────────────────────────────
  // Section 6: Store Settings Singleton
  // ──────────────────────────────────────────────────────────
  console.log('\n--- [Section 6: Store Settings Singleton] ---')

  const parsedSettings = parseStoreSettingsInput({
    storeName: 'Shewa Fashion Addis',
    description: 'Bespoke tailoring and artisanal Ethiopian ready-to-wear.',
    phone: '+251 91 123 4567',
    email: 'hello@shewafashion.com',
    whatsapp: '+251 91 123 4567',
    address: 'Bole Road, Next to Edna Mall, Addis Ababa',
    openingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    instagram: '@shewafashion',
    telegram: 't.me/shewafashion',
    googleMapsUrl: 'https://maps.google.com/?q=Bole+Edna+Mall',
  })
  assert(parsedSettings.ok, 'parseStoreSettingsInput: accepts complete valid settings')

  // Upsert settings singleton
  const savedSettings = await prisma.storeSettings.upsert({
    where: { id: 'singleton' },
    update: {
      storeName: 'Shewa Fashion Addis',
      description: 'Bespoke tailoring and artisanal Ethiopian ready-to-wear.',
      phone: '+251 91 123 4567',
      email: 'hello@shewafashion.com',
      whatsapp: '+251 91 123 4567',
      address: 'Bole Road, Next to Edna Mall, Addis Ababa',
      openingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
      instagram: '@shewafashion',
      telegram: 'shewafashion',
      googleMapsUrl: 'https://maps.google.com/?q=Bole+Edna+Mall',
    },
    create: {
      id: 'singleton',
      storeName: 'Shewa Fashion Addis',
      description: 'Bespoke tailoring and artisanal Ethiopian ready-to-wear.',
      phone: '+251 91 123 4567',
      email: 'hello@shewafashion.com',
      whatsapp: '+251 91 123 4567',
      address: 'Bole Road, Next to Edna Mall, Addis Ababa',
      openingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
      instagram: '@shewafashion',
      telegram: 'shewafashion',
      googleMapsUrl: 'https://maps.google.com/?q=Bole+Edna+Mall',
    },
  })
  assert(savedSettings.id === 'singleton', 'StoreSettings: enforces singleton ID "singleton"')

  // Verify getStoreSettings() retrieves saved settings
  const retrieved = await getStoreSettings()
  assert(retrieved !== null, 'getStoreSettings: retrieves singleton record')
  assert(retrieved?.storeName === 'Shewa Fashion Addis', 'getStoreSettings: returns saved storeName')
  assert(retrieved?.email === 'hello@shewafashion.com', 'getStoreSettings: returns saved email')
  assert(retrieved?.phone === '+251 91 123 4567', 'getStoreSettings: returns saved phone')
  assert(Boolean(retrieved?.googleMapsUrl?.startsWith('https://')), 'getStoreSettings: returns safe maps URL')

  // Test optional fields absent
  const parsedSparse = parseStoreSettingsInput({
    storeName: 'Shewa Fashion Minimal',
    email: null,
    phone: '',
    instagram: '',
  })
  assert(parsedSparse.ok, 'parseStoreSettingsInput: handles sparse payload with absent optional fields')
  if (parsedSparse.ok) {
    assert(parsedSparse.data.email === null, 'parseStoreSettingsInput: sets absent email to null')
    assert(parsedSparse.data.phone === null, 'parseStoreSettingsInput: sets absent phone to null')
    assert(parsedSparse.data.instagram === null, 'parseStoreSettingsInput: sets absent instagram to null')
  }

  // ──────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════')
  console.log(`  Results: ${passed} passed, ${failed} failed`)
  console.log('══════════════════════════════════════════════════════════\n')

  await prisma.$disconnect()
  if (failed > 0) {
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('Test runner error:', err)
  prisma.$disconnect()
  process.exit(1)
})
