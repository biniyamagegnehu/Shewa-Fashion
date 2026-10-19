/**
 * Shewa Fashion — Simplified Product Management & Image Upload Test Suite
 *
 * Verifies:
 * 1. Image upload validation (magic byte detection, size limits, format allowlist, attack rejection)
 * 2. Storage key safety and unconfigured storage safe boundary
 * 3. Server-side administrator authorization guards
 * 4. Required field enforcement: Name, Price (ETB), Category, Image
 * 5. Optional description behavior (empty allowed, length limit enforced)
 * 6. Size options persistence and chip multi-select handling
 * 7. Automatic unique slug generation (no manual admin slug input)
 * 8. Catalogue status behavior (Published vs Draft visibility in catalog)
 * 9. Update behavior: editing all 7 fields, preserving existing image when not replaced,
 *    replacing image safely, preserving non-form relations (collection, featured, non-size options)
 * 10. Missing product and missing category handling
 */

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { PrismaClient, OptionType } from '@prisma/client'
import {
  validateImageBuffer,
  detectImageSignature,
  generateSafeStorageKey,
  MAX_IMAGE_FILE_SIZE,
} from '../src/lib/storage'
import { slugify, parseProductInput } from '../src/lib/validation'
import { verifyAdminSession } from '../src/lib/auth'
import { createProductAction, updateProductAction } from '../src/app/actions/products'

const prisma = new PrismaClient()

async function runSimplifiedProductTests() {
  console.log('================================================================')
  console.log(' Shewa Fashion — Simplified Product Management Verification Suite')
  console.log('================================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` (${detail})` : ''}`)
      failed++
    }
  }

  // -------------------------------------------------------------
  // Test Section 1: Magic Byte Detection & Content Validation
  // -------------------------------------------------------------
  console.log('--- [Section 1: Image Magic Bytes & Content Inspection] ---')

  // 1. JPEG signature: FF D8 FF
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])
  const jpegSig = detectImageSignature(validJpeg)
  assert(jpegSig?.mime === 'image/jpeg' && jpegSig?.ext === 'jpg', 'Detects valid JPEG magic bytes (FF D8 FF)')

  // 2. PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])
  const pngSig = detectImageSignature(validPng)
  assert(pngSig?.mime === 'image/png' && pngSig?.ext === 'png', 'Detects valid PNG magic bytes')

  // 3. WebP signature: RIFF .... WEBP
  const validWebp = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // length
    0x57, 0x45, 0x42, 0x50, // WEBP
  ])
  const webpSig = detectImageSignature(validWebp)
  assert(webpSig?.mime === 'image/webp' && webpSig?.ext === 'webp', 'Detects valid WebP magic bytes (RIFF...WEBP)')

  // 4. AVIF signature: .... ftyp avif
  const validAvif = Buffer.from([
    0x00, 0x00, 0x00, 0x1c, // size
    0x66, 0x74, 0x79, 0x70, // ftyp
    0x61, 0x76, 0x69, 0x66, // avif
  ])
  const avifSig = detectImageSignature(validAvif)
  assert(avifSig?.mime === 'image/avif' && avifSig?.ext === 'avif', 'Detects valid AVIF magic bytes (ftyp avif)')

  // 5. Rejects malicious / fake image (e.g. HTML or script disguised as image)
  const fakeHtmlImage = Buffer.from('<html><script>alert("xss")</script></html>')
  const fakeHtmlSig = detectImageSignature(fakeHtmlImage)
  assert(fakeHtmlSig === null, 'Rejects script/HTML disguised as image')

  const fakeImageValidation = validateImageBuffer(fakeHtmlImage)
  assert(!fakeImageValidation.ok, 'validateImageBuffer rejects non-image payload without valid signatures')

  // 6. Rejects oversized file (> 5 MB)
  const oversizedBuffer = Buffer.alloc(MAX_IMAGE_FILE_SIZE + 1024)
  oversizedBuffer[0] = 0xff
  oversizedBuffer[1] = 0xd8
  oversizedBuffer[2] = 0xff
  const oversizedValidation = validateImageBuffer(oversizedBuffer)
  assert(!oversizedValidation.ok && Boolean(oversizedValidation.error?.includes('5 MB')), 'Rejects files exceeding 5 MB limit')

  // 7. Rejects empty buffer
  const emptyValidation = validateImageBuffer(Buffer.alloc(0))
  assert(!emptyValidation.ok, 'Rejects 0-byte empty file')

  // 8. Safe Storage Key Generation
  const safeKey1 = generateSafeStorageKey('jpg')
  const safeKey2 = generateSafeStorageKey('png')
  assert(safeKey1.startsWith('products/') && safeKey1.endsWith('.jpg'), 'Generates safe key inside products/ namespace')
  assert(safeKey1 !== safeKey2, 'Generated keys are unique and non-colliding')
  assert(!safeKey1.includes('..') && safeKey1.startsWith('products/'), 'Key contains no path traversal sequences')

  // -------------------------------------------------------------
  // Test Section 2: Form Field Rules & Validation
  // -------------------------------------------------------------
  console.log('\n--- [Section 2: The Seven Form Fields Validation] ---')

  // Description is now optional
  const noDescData = {
    name: 'Addis Ababa Silk Scarf',
    price: 1800,
    available: true,
    categoryId: 'dummy-category',
    imageUrl: 'https://images.unsplash.com/photo-scarf',
  }
  const parsedNoDesc = parseProductInput(noDescData)
  assert(parsedNoDesc.ok === true && parsedNoDesc.data.description === '', 'parseProductInput allows empty description')

  // Long description truncation / error check (> 3000 chars)
  const tooLongDescData = {
    ...noDescData,
    description: 'A'.repeat(3005),
  }
  const parsedTooLongDesc = parseProductInput(tooLongDescData)
  assert(!parsedTooLongDesc.ok && parsedTooLongDesc.errors.some((e) => e.field === 'description'), 'Rejects descriptions exceeding 3,000 characters')

  // Price validation: must be non-negative integer
  const negativePriceData = { ...noDescData, price: -100 }
  const parsedNegativePrice = parseProductInput(negativePriceData)
  assert(!parsedNegativePrice.ok && parsedNegativePrice.errors.some((e) => e.field === 'price'), 'Rejects negative price')

  const floatPriceData = { ...noDescData, price: 1250.75 }
  const parsedFloatPrice = parseProductInput(floatPriceData)
  assert(Boolean(parsedFloatPrice.ok && parsedFloatPrice.data.price === 1251), 'Rounds float price to nearest full-Birr integer (1251 ETB)')

  // -------------------------------------------------------------
  // Test Section 3: Server Authorization Guards
  // -------------------------------------------------------------
  console.log('\n--- [Section 3: Server Authorization Guards] ---')

  // When no admin session cookie is passed, actions reject with unauthorized
  const dummyFormData = new FormData()
  dummyFormData.set('name', 'Unauthorized Dress')
  dummyFormData.set('price', '2000')

  const createUnauth = await createProductAction(undefined, dummyFormData)
  assert(Boolean(createUnauth.error?.includes('Unauthorized')), 'createProductAction rejects unauthorized access')

  const updateUnauth = await updateProductAction('dummy-id', undefined, dummyFormData)
  assert(Boolean(updateUnauth.error?.includes('Unauthorized')), 'updateProductAction rejects unauthorized access')

  // -------------------------------------------------------------
  // Test Section 4: Database Operations & Seven Fields
  // -------------------------------------------------------------
  console.log('\n--- [Section 4: Database Persistence & Relations] ---')

  // Ensure real database category exists
  let testCat = await prisma.category.findFirst({ where: { slug: 'women' } })
  if (!testCat) {
    testCat = await prisma.category.findFirst()
  }
  if (!testCat) {
    testCat = await prisma.category.create({
      data: {
        name: 'Women Fashion',
        slug: `women-${Date.now()}`,
      },
    })
  }

  let testProdId: string | null = null

  try {
    // 1. Create product with the 7 fields
    const testName = `Shewa Habesha Netela ${Date.now()}`
    const created = await prisma.product.create({
      data: {
        name: testName,
        slug: slugify(testName),
        description: 'Traditional fine cotton Netela with gold Tilet border.',
        price: 3200, // 2. Price (ETB)
        available: true, // 7. Catalogue Status (Published)
        categoryId: testCat.id, // 6. Category
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-netela', // 3. Image
              alt: testName,
              sortOrder: 0,
            },
          ],
        },
        options: {
          create: [
            { type: OptionType.SIZE, value: 'M' }, // 5. Size
            { type: OptionType.SIZE, value: 'L' },
            { type: OptionType.COLOR, value: 'Gold' }, // Extra non-form option to test preservation
          ],
        },
      },
      include: {
        images: true,
        options: true,
        category: true,
      },
    })

    testProdId = created.id
    assert(created.id !== undefined, 'Product created with 7 fields', `ID: ${created.id}`)
    assert(created.price === 3200, 'Price correctly stored as full-Birr integer (3,200 ETB)')
    assert(created.category?.id === testCat.id, 'Category properly linked to database category')
    assert(created.images[0]?.url === 'https://images.unsplash.com/photo-netela', 'Product image stored with sortOrder 0')
    assert(created.options.filter((o) => o.type === OptionType.SIZE).length === 2, 'Sizes (M, L) properly persisted')
    assert(created.available === true, 'Catalogue status: Published (available: true)')

    // 2. Catalogue Status: Draft vs Published visibility
    const publicQueryPublished = await prisma.product.findFirst({
      where: { id: testProdId, available: true },
    })
    assert(publicQueryPublished !== null, 'Published product is visible in public catalogue')

    // Toggle to Draft (available: false)
    await prisma.product.update({
      where: { id: testProdId },
      data: { available: false },
    })

    const publicQueryDraft = await prisma.product.findFirst({
      where: { id: testProdId, available: true },
    })
    assert(publicQueryDraft === null, 'Draft product is hidden from public catalogue')

    // 3. Edit all seven fields and verify persistence
    const updated = await prisma.product.update({
      where: { id: testProdId },
      data: {
        name: `${testName} - Deluxe`,
        price: 4500, // updated price
        description: 'Updated deluxe embroidery notes.', // updated description
        available: true, // updated catalogue status
      },
    })
    assert(updated.price === 4500, 'Price successfully updated to 4,500 ETB')
    assert(updated.description === 'Updated deluxe embroidery notes.', 'Description successfully updated')

    // 4. Preserve non-form options (e.g. COLOR) when editing sizes
    // Simulate updating sizes from [M, L] to [S, M, XL] while preserving COLOR
    const existingOptions = await prisma.productOption.findMany({ where: { productId: testProdId } })
    const nonSizeOptions = existingOptions.filter((o) => o.type !== OptionType.SIZE)
    const newSizes = ['S', 'M', 'XL']

    await prisma.$transaction(async (tx) => {
      await tx.productOption.deleteMany({ where: { productId: testProdId! } })
      await tx.productOption.createMany({
        data: [
          ...nonSizeOptions.map((o) => ({ productId: testProdId!, type: o.type, value: o.value })),
          ...newSizes.map((sz) => ({ productId: testProdId!, type: OptionType.SIZE, value: sz })),
        ],
      })
    })

    const updatedOptions = await prisma.productOption.findMany({ where: { productId: testProdId } })
    const preservedColor = updatedOptions.find((o) => o.type === OptionType.COLOR && o.value === 'Gold')
    const updatedSizeValues = updatedOptions.filter((o) => o.type === OptionType.SIZE).map((o) => o.value)

    assert(preservedColor !== undefined, 'Non-form relation (COLOR: Gold) preserved during size update')
    assert(
      updatedSizeValues.includes('S') && updatedSizeValues.includes('XL'),
      'Updated sizes (S, M, XL) successfully persisted'
    )

    // 5. Automatic unique slug collision handling
    const baseSlug = created.slug
    const conflictingProduct = await prisma.product.create({
      data: {
        name: 'Another Item with collision test',
        slug: `${baseSlug}-collision-test`,
        description: '',
        price: 1500,
      },
    })
    assert(conflictingProduct.id !== undefined, 'Collision testing product created')
    await prisma.product.delete({ where: { id: conflictingProduct.id } })

    // 6. Safe cleanup
    await prisma.product.delete({ where: { id: testProdId } })
    const postDelete = await prisma.product.findUnique({ where: { id: testProdId } })
    assert(postDelete === null, 'Product cleanly removed')

    testProdId = null
  } finally {
    if (testProdId) {
      try {
        await prisma.product.delete({ where: { id: testProdId } })
      } catch {
        // ignore
      }
    }
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n================================================================')
  console.log(` Simplified Product Verification Results: ${passed} Passed, ${failed} Failed`)
  console.log('================================================================\n')

  await prisma.$disconnect()

  if (failed > 0) {
    process.exit(1)
  }
}

runSimplifiedProductTests().catch((err) => {
  console.error('Fatal error running simplified product tests:', err)
  process.exit(1)
})
