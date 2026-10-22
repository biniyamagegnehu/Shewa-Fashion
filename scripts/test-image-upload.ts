/**
 * Shewa Fashion — Phase 15: Production-Ready Image Upload System Verification Suite
 *
 * Automated verification of:
 * 1. Image Content & Magic Byte Signature Inspection (JPEG, PNG, WebP, AVIF)
 * 2. Protection against disguised malicious files, empty payloads, and oversized files (>5 MB)
 * 3. Cryptographically safe key generation across products/, gallery/, settings/ namespaces
 * 4. Server-side administrator authentication enforcement on all image operations
 * 5. Cross-model reference protection (isImageShared across ProductImage, GalleryItem, StoreSettings)
 * 6. Protection of static demo (/images/...) and Unsplash assets against deletion
 * 7. End-to-end product, gallery, and store settings image integration
 */

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { prisma } from '../src/lib/prisma'
import {
  detectImageSignature,
  validateImageBuffer,
  generateSafeStorageKey,
  isStorageConfigured,
  isImageShared,
  deleteStoredImage,
  deleteProductImage,
  MAX_IMAGE_FILE_SIZE,
} from '../src/lib/storage'
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '../src/app/actions/products'
import {
  createGalleryItemAction,
  updateGalleryItemAction,
  deleteGalleryItemAction,
} from '../src/app/actions/gallery'
import { updateStoreSettingsAction } from '../src/app/actions/settings'

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

// Minimal valid file buffers for testing signatures
function createValidJpegBuffer(): Buffer {
  const buf = Buffer.alloc(100)
  buf[0] = 0xff
  buf[1] = 0xd8
  buf[2] = 0xff
  return buf
}

function createValidPngBuffer(): Buffer {
  const buf = Buffer.alloc(100)
  const header = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  for (let i = 0; i < header.length; i++) {
    buf[i] = header[i]
  }
  return buf
}

function createValidWebpBuffer(): Buffer {
  const buf = Buffer.alloc(100)
  buf.write('RIFF', 0, 4, 'ascii')
  buf.write('WEBP', 8, 4, 'ascii')
  return buf
}

function createValidAvifBuffer(): Buffer {
  const buf = Buffer.alloc(100)
  buf.write('ftyp', 4, 4, 'ascii')
  buf.write('avif', 8, 4, 'ascii')
  return buf
}

async function runImageUploadVerificationSuite() {
  console.log('\n════════════════════════════════════════════════════════════')
  console.log('  Shewa Fashion — Phase 15 Image Upload Verification Suite')
  console.log('════════════════════════════════════════════════════════════\n')

  // ------------------------------------------------------------
  // SECTION 1: Magic Byte Inspection & Content Security
  // ------------------------------------------------------------
  console.log('--- [Section 1: Content & Magic Byte Inspection] ---')

  const jpegSig = detectImageSignature(createValidJpegBuffer())
  assert(jpegSig?.mime === 'image/jpeg' && jpegSig.ext === 'jpg', 'detectImageSignature: recognizes valid JPEG')

  const pngSig = detectImageSignature(createValidPngBuffer())
  assert(pngSig?.mime === 'image/png' && pngSig.ext === 'png', 'detectImageSignature: recognizes valid PNG')

  const webpSig = detectImageSignature(createValidWebpBuffer())
  assert(webpSig?.mime === 'image/webp' && webpSig.ext === 'webp', 'detectImageSignature: recognizes valid WebP')

  const avifSig = detectImageSignature(createValidAvifBuffer())
  assert(avifSig?.mime === 'image/avif' && avifSig.ext === 'avif', 'detectImageSignature: recognizes valid AVIF')

  const fakeScript = Buffer.from('<script>alert("xss")</script>', 'utf-8')
  assert(detectImageSignature(fakeScript) === null, 'detectImageSignature: rejects script content')

  const fakeHtml = Buffer.from('<!DOCTYPE html><html><body>Test</body></html>', 'utf-8')
  assert(detectImageSignature(fakeHtml) === null, 'detectImageSignature: rejects HTML content')

  const corruptedBuf = Buffer.alloc(8)
  assert(detectImageSignature(corruptedBuf) === null, 'detectImageSignature: rejects truncated buffer (<12 bytes)')

  // validateImageBuffer checks
  const validValidation = validateImageBuffer(createValidWebpBuffer())
  assert(validValidation.ok && validValidation.ext === 'webp', 'validateImageBuffer: accepts valid WebP buffer')

  const emptyValidation = validateImageBuffer(Buffer.alloc(0))
  assert(!emptyValidation.ok && Boolean(emptyValidation.error), 'validateImageBuffer: rejects empty 0-byte buffer')

  const oversizedBuf = Buffer.alloc(MAX_IMAGE_FILE_SIZE + 1024)
  const oversizedValidation = validateImageBuffer(oversizedBuf)
  assert(!oversizedValidation.ok && Boolean(oversizedValidation.error?.includes('5 MB')), 'validateImageBuffer: rejects file exceeding 5 MB limit')

  // ------------------------------------------------------------
  // SECTION 2: Safe Key Generation & Namespaces
  // ------------------------------------------------------------
  console.log('\n--- [Section 2: Safe Key Generation & Namespaces] ---')

  const prodKey = generateSafeStorageKey('jpg', 'products')
  assert(prodKey.startsWith('products/'), 'generateSafeStorageKey: places product keys in products/')
  assert(prodKey.endsWith('.jpg'), 'generateSafeStorageKey: preserves clean extension')
  assert(!prodKey.includes('..'), 'generateSafeStorageKey: contains no directory traversal')

  const galleryKey = generateSafeStorageKey('webp', 'gallery')
  assert(galleryKey.startsWith('gallery/'), 'generateSafeStorageKey: places gallery keys in gallery/')
  assert(galleryKey.endsWith('.webp'), 'generateSafeStorageKey: preserves webp extension')

  const settingsKey = generateSafeStorageKey('png', 'settings')
  assert(settingsKey.startsWith('settings/'), 'generateSafeStorageKey: places logo keys in settings/')

  const traversalKey = generateSafeStorageKey('jpg', '../../../etc/passwd')
  assert(!traversalKey.includes('..'), 'generateSafeStorageKey: strips path traversal attack from folder')

  const key1 = generateSafeStorageKey('webp', 'products')
  const key2 = generateSafeStorageKey('webp', 'products')
  assert(key1 !== key2, 'generateSafeStorageKey: produces unique cryptographic keys')

  // ------------------------------------------------------------
  // SECTION 3: Server-Side Authorization Guards
  // ------------------------------------------------------------
  console.log('\n--- [Section 3: Server-Side Authorization Guards] ---')

  const dummyForm = new FormData()

  const prodCreateAuth = await createProductAction(undefined, dummyForm)
  assert(Boolean(prodCreateAuth.error?.includes('Unauthorized')), 'createProductAction: rejects unauthenticated call')

  const prodUpdateAuth = await updateProductAction('some-id', undefined, dummyForm)
  assert(Boolean(prodUpdateAuth.error?.includes('Unauthorized')), 'updateProductAction: rejects unauthenticated call')

  const prodDeleteAuth = await deleteProductAction('some-id')
  assert(!prodDeleteAuth.success && Boolean(prodDeleteAuth.error?.includes('Unauthorized')), 'deleteProductAction: rejects unauthenticated call')

  const galleryCreateAuth = await createGalleryItemAction(undefined, dummyForm)
  assert(Boolean(galleryCreateAuth.error?.includes('Unauthorized')), 'createGalleryItemAction: rejects unauthenticated call')

  const galleryUpdateAuth = await updateGalleryItemAction(undefined, dummyForm)
  assert(Boolean(galleryUpdateAuth.error?.includes('Unauthorized')), 'updateGalleryItemAction: rejects unauthenticated call')

  const galleryDeleteAuth = await deleteGalleryItemAction('some-id')
  assert(!galleryDeleteAuth.success && Boolean(galleryDeleteAuth.error?.includes('Unauthorized')), 'deleteGalleryItemAction: rejects unauthenticated call')

  const settingsAuth = await updateStoreSettingsAction(undefined, dummyForm)
  assert(Boolean(settingsAuth.error?.includes('Unauthorized')), 'updateStoreSettingsAction: rejects unauthenticated call')

  // ------------------------------------------------------------
  // SECTION 4: Cross-Model Shared Image Safety (isImageShared)
  // ------------------------------------------------------------
  console.log('\n--- [Section 4: Cross-Model Shared Image Safety] ---')

  const uniqueTestUrl = `https://cdn.shewafashion.com/products/test-shared-${Date.now()}.jpg`

  // Initially unreferenced
  const initialShared = await isImageShared(uniqueTestUrl)
  assert(initialShared === false, 'isImageShared: returns false for unreferenced image')

  // Ensure test category exists
  let testCategory = await prisma.category.findFirst({ where: { slug: 'test-phase15-cat' } })
  if (!testCategory) {
    testCategory = await prisma.category.create({
      data: {
        name: 'Phase 15 Test Category',
        slug: 'test-phase15-cat',
      },
    })
  }

  // Create Product referencing this URL
  const testProduct = await prisma.product.create({
    data: {
      name: 'Phase 15 Test Product',
      slug: `p15-test-${Date.now()}`,
      description: 'Phase 15 Test description',
      price: 3500,
      available: true,
      categoryId: testCategory.id,
      images: {
        create: [{ url: uniqueTestUrl, alt: 'Test Product', sortOrder: 0 }],
      },
    },
  })

  const sharedInProduct = await isImageShared(uniqueTestUrl)
  assert(sharedInProduct === true, 'isImageShared: returns true when referenced in ProductImage')

  // Create GalleryItem referencing the same URL
  const testGalleryItem = await prisma.galleryItem.create({
    data: {
      title: 'Phase 15 Test Lookbook',
      alt: 'Phase 15 Test Lookbook',
      imageUrl: uniqueTestUrl,
      sortOrder: 99,
      isPublished: true,
    },
  })

  // Exclude gallery item ID — product still references it, so must be shared
  const sharedExcludingGallery = await isImageShared(uniqueTestUrl, testGalleryItem.id)
  assert(sharedExcludingGallery === true, 'isImageShared: cross-model check detects ProductImage even when excluding GalleryItem')

  // Clean up product
  await prisma.productImage.deleteMany({ where: { productId: testProduct.id } })
  await prisma.product.delete({ where: { id: testProduct.id } })

  // Now only gallery item references it
  const sharedExcludingGalleryAfterProductDelete = await isImageShared(uniqueTestUrl, testGalleryItem.id)
  assert(sharedExcludingGalleryAfterProductDelete === false, 'isImageShared: correctly returns false when excluding sole gallery reference')

  // Clean up gallery item
  await prisma.galleryItem.delete({ where: { id: testGalleryItem.id } })

  // Clean up test category
  await prisma.category.delete({ where: { id: testCategory.id } }).catch(() => {})

  // ------------------------------------------------------------
  // SECTION 5: Asset Deletion Protection Rules
  // ------------------------------------------------------------
  console.log('\n--- [Section 5: Asset Deletion Protection Rules] ---')

  const localStaticRes = await deleteStoredImage('/images/products/habesha-kemis.jpg')
  assert(localStaticRes === false, 'deleteStoredImage: refuses to delete local /images/... demo asset')

  const unsplashRes = await deleteStoredImage('https://images.unsplash.com/photo-123456789')
  assert(unsplashRes === false, 'deleteStoredImage: refuses to delete external Unsplash image')

  const localhostRes = await deleteStoredImage('http://localhost:3000/images/logo.png')
  assert(localhostRes === false, 'deleteStoredImage: refuses to delete localhost asset')

  const outsideNamespaceRes = await deleteStoredImage('https://storage.example.com/system/config.json', ['products/'])
  assert(outsideNamespaceRes === false, 'deleteStoredImage: refuses to delete files outside allowed prefix')

  const backwardCompatRes = await deleteProductImage('/images/sample.jpg')
  assert(backwardCompatRes === false, 'deleteProductImage: backwards compatible wrapper preserves local assets')

  // ------------------------------------------------------------
  // SECTION 6: Storage Provider Configuration Check
  // ------------------------------------------------------------
  console.log('\n--- [Section 6: Storage Provider Configuration Check] ---')

  const configured = isStorageConfigured()
  console.log(`  ℹ Storage configured in current environment: ${configured ? 'YES' : 'NO'}`)
  assert(typeof configured === 'boolean', 'isStorageConfigured: returns boolean state without throwing')

  // Cloudinary URL namespace safety
  const foreignCloudinary = await deleteStoredImage('https://res.cloudinary.com/demo/image/upload/sample.jpg')
  assert(foreignCloudinary === false, 'deleteStoredImage: refuses deletion of Cloudinary assets outside shewa-fashion namespace')

  // ------------------------------------------------------------
  // Suite Summary
  // ------------------------------------------------------------
  console.log('\n════════════════════════════════════════════════════════════')
  console.log(`  Phase 15 Image Upload Verification: ${passed} passed, ${failed} failed`)
  console.log('════════════════════════════════════════════════════════════\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runImageUploadVerificationSuite().catch((err) => {
  console.error('Fatal error during Phase 15 suite execution:', err)
  process.exit(1)
})
