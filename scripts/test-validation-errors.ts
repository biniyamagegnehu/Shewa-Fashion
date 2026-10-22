/**
 * Shewa Fashion — Phase 16 Validation & Error Handling Test Suite
 *
 * Covers:
 *  1. Category input validation (name length constraints, description length, empty payloads)
 *  2. Collection input validation (name constraints, description length)
 *  3. Gallery input validation (URL safety, scheme check, title boundaries, alt fallback)
 *  4. Store settings validation (logo URL safety, store name bounds, contact sanitisation)
 *  5. Centralized Prisma error handler (P2002 unique, P2025 not found, P2003 FK, P1001/P1002 connection, timeouts)
 */

import { Prisma } from '@prisma/client'
import {
  parseCategoryInput,
  parseCollectionInput,
  parseGalleryItemInput,
  parseStoreSettingsInput,
  isValidImageUrl,
} from '../src/lib/validation'
import { handlePrismaError, isPrismaError } from '../src/lib/errors'

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
  console.log('  Shewa Fashion — Phase 16 Validation & Error Handling Suite')
  console.log('══════════════════════════════════════════════════════════\n')

  // ──────────────────────────────────────────────────────────
  // 1. Category Input Validation
  // ──────────────────────────────────────────────────────────
  console.log('── Section 1: Category Input Validation ──')

  {
    const res = parseCategoryInput({ name: 'Traditional Habesha Kemis', description: 'Handcrafted dresses' })
    assert(res.ok === true, 'Valid category input succeeds')
    if (res.ok) {
      assert(res.data.name === 'Traditional Habesha Kemis', 'Name is preserved')
      assert(res.data.description === 'Handcrafted dresses', 'Description is preserved')
    }
  }

  {
    const res = parseCategoryInput({ name: '   ', description: null })
    assert(res.ok === false, 'Blank category name fails')
    if (!res.ok) {
      assert(res.errors.some((e) => e.field === 'name'), 'Error references name field')
    }
  }

  {
    const res = parseCategoryInput({ name: 'A' })
    assert(res.ok === false, '1-character category name fails')
    if (!res.ok) {
      assert(res.errors[0]?.message.includes('at least 2 characters'), 'Proper minimum length message')
    }
  }

  {
    const res = parseCategoryInput({ name: 'X'.repeat(81) })
    assert(res.ok === false, '81-character category name fails')
    if (!res.ok) {
      assert(res.errors[0]?.message.includes('cannot exceed 80 characters'), 'Proper maximum length message')
    }
  }

  {
    const res = parseCategoryInput({ name: 'Shawls', description: 'D'.repeat(501) })
    assert(res.ok === false, 'Category description exceeding 500 characters fails')
    if (!res.ok) {
      assert(res.errors.some((e) => e.field === 'description'), 'Error references description field')
    }
  }

  {
    const res = parseCategoryInput(null)
    assert(res.ok === false, 'Null payload fails cleanly')
  }

  // ──────────────────────────────────────────────────────────
  // 2. Collection Input Validation
  // ──────────────────────────────────────────────────────────
  console.log('\n── Section 2: Collection Input Validation ──')

  {
    const res = parseCollectionInput({ name: 'Meskel Festive 2026', description: 'Curated holiday attire' })
    assert(res.ok === true, 'Valid collection input succeeds')
    if (res.ok) {
      assert(res.data.name === 'Meskel Festive 2026', 'Collection name preserved')
    }
  }

  {
    const res = parseCollectionInput({ name: '   ' })
    assert(res.ok === false, 'Empty collection name fails')
    if (!res.ok) {
      assert(res.errors.some((e) => e.field === 'name'), 'Collection error references name field')
    }
  }

  {
    const res = parseCollectionInput({ name: 'Winter Collection', description: '   ' })
    assert(res.ok === true, 'Whitespace description normalises to null')
    if (res.ok) {
      assert(res.data.description === null, 'Description is null when whitespace only')
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. Gallery Input & Image URL Validation
  // ──────────────────────────────────────────────────────────
  console.log('\n── Section 3: Gallery Input & Image URL Validation ──')

  {
    assert(isValidImageUrl('https://example.com/photo.jpg') === true, 'HTTPS image URL is valid')
    assert(isValidImageUrl('http://example.com/photo.jpg') === true, 'HTTP image URL is valid')
    assert(isValidImageUrl('javascript:alert(1)') === false, 'javascript: URL rejected')
    assert(isValidImageUrl('data:image/png;base64,AAAA') === false, 'data: URL rejected')
    assert(isValidImageUrl('') === false, 'Empty image URL rejected')
    assert(isValidImageUrl('   ') === false, 'Whitespace image URL rejected')
  }

  {
    const res = parseGalleryItemInput({
      title: 'Silk Netela Crafting',
      imageUrl: 'javascript:alert(document.cookie)',
    })
    assert(res.ok === false, 'Malicious javascript: imageUrl in gallery is rejected')
    if (!res.ok) {
      assert(res.errors.some((e) => e.field === 'imageUrl'), 'Error is pinned to imageUrl field')
    }
  }

  {
    const res = parseGalleryItemInput({
      title: 'Pure Cotton Weaving',
      imageUrl: 'https://images.unsplash.com/photo-test.jpg',
    })
    assert(res.ok === true, 'Valid HTTPS imageUrl in gallery is accepted')
    if (res.ok) {
      assert(res.data.alt === 'Pure Cotton Weaving', 'Alt defaults to title when empty')
      assert(res.data.isPublished === true, 'isPublished defaults to true')
    }
  }

  // ──────────────────────────────────────────────────────────
  // 4. Store Settings Input Validation
  // ──────────────────────────────────────────────────────────
  console.log('\n── Section 4: Store Settings Input Validation ──')

  {
    const res = parseStoreSettingsInput({
      storeName: 'Shewa Fashion',
      logoUrl: 'javascript:alert(1)',
    })
    assert(res.ok === false, 'Malicious logo URL rejected')
    if (!res.ok) {
      assert(res.errors.some((e) => e.field === 'logoUrl'), 'Error pinned to logoUrl')
    }
  }

  {
    const res = parseStoreSettingsInput({
      storeName: 'S', // too short (< 2)
    })
    assert(res.ok === false, 'Single-character store name rejected')
  }

  {
    const res = parseStoreSettingsInput({
      storeName: 'Shewa Fashion',
      email: 'contact@shewafashion.com',
      phone: '+251 91 123 4567',
      whatsapp: '+251 91 123 4567',
      instagram: '@shewafashion',
      facebook: 'shewafashion',
      logoUrl: 'https://cdn.shewafashion.com/logo.png',
    })
    assert(res.ok === true, 'Complete valid store settings payload succeeds')
    if (res.ok) {
      assert(res.data.storeName === 'Shewa Fashion', 'Store name preserved')
      assert(res.data.email === 'contact@shewafashion.com', 'Email preserved')
    }
  }

  // ──────────────────────────────────────────────────────────
  // 5. Prisma Error Handling & Code Mapping
  // ──────────────────────────────────────────────────────────
  console.log('\n── Section 5: Prisma Error Handling & Code Mapping ──')

  {
    const p2002 = new Prisma.PrismaClientKnownRequestError('Unique constraint violation', {
      code: 'P2002',
      clientVersion: '6.19.3',
      meta: { target: ['slug'] },
    })

    assert(isPrismaError(p2002) === true, 'isPrismaError identifies KnownRequestError')
    const res = handlePrismaError(p2002)
    assert(res.statusCode === 409, 'P2002 maps to HTTP 409 Conflict')
    assert(res.field === 'slug', 'P2002 identifies target field as slug')
    assert(res.message.includes('already exists'), 'P2002 gives helpful duplicate message')
  }

  {
    const p2025 = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '6.19.3',
    })

    const res = handlePrismaError(p2025)
    assert(res.statusCode === 404, 'P2025 maps to HTTP 404 Not Found')
    assert(res.message.includes('not found'), 'P2025 message is clear')
  }

  {
    const p2003 = new Prisma.PrismaClientKnownRequestError('Foreign key failed', {
      code: 'P2003',
      clientVersion: '6.19.3',
    })

    const res = handlePrismaError(p2003)
    assert(res.statusCode === 409, 'P2003 maps to HTTP 409')
    assert(res.message.includes('related records depend on it'), 'P2003 message mentions dependencies')
  }

  {
    const p1001 = new Prisma.PrismaClientKnownRequestError('Connection failed', {
      code: 'P1001',
      clientVersion: '6.19.3',
    })

    const res = handlePrismaError(p1001)
    assert(res.statusCode === 503, 'P1001 maps to HTTP 503 Service Unavailable')
    assert(res.message.includes('Unable to reach the database'), 'P1001 message mentions reachability')
  }

  {
    const p1008 = new Prisma.PrismaClientKnownRequestError('Timeout', {
      code: 'P1008',
      clientVersion: '6.19.3',
    })

    const res = handlePrismaError(p1008)
    assert(res.statusCode === 504, 'P1008 maps to HTTP 504 Gateway Timeout')
  }

  {
    const genericErr = new Error('Some random unexpected error')
    assert(isPrismaError(genericErr) === false, 'Generic Error is not a Prisma Error')
    const res = handlePrismaError(genericErr, 'Custom fallback message.')
    assert(res.statusCode === 500, 'Generic error returns HTTP 500')
    assert(res.message === 'Custom fallback message.', 'Uses custom fallback message')
  }

  // ──────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════')
  console.log(`  Tests Complete: ${passed} passed, ${failed} failed`)
  console.log('══════════════════════════════════════════════════════════\n')

  if (failed > 0) {
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('Test suite runner crashed:', err)
  process.exit(1)
})
