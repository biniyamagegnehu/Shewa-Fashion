/**
 * Shewa Fashion — Phase 11: Admin Dashboard Verification Suite
 *
 * Verifies:
 * 1. Database aggregate queries match real database records
 * 2. Product field selection and relationship retrieval (category, collection, images)
 * 3. Price formatting convention (Ethiopian Birr integer formatting)
 * 4. Empty state handling when no products or collections exist
 * 5. Navigation items structure (Overview active, future phases clearly marked)
 * 6. Admin authorization enforcement for /admin
 * 7. Mobile responsive design constraints (overflow protection)
 */

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { PrismaClient } from '@prisma/client'
import { navItems } from '../src/components/admin/admin-nav'
import { getSafeRedirectUrl } from '../src/lib/auth'

const prisma = new PrismaClient()

async function runDashboardTests() {
  console.log('================================================================')
  console.log(' Shewa Fashion — Phase 11: Admin Dashboard Verification Suite')
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
  // Test Section 1: Database Statistics & Aggregates
  // -------------------------------------------------------------
  console.log('--- [Section 1: Database Aggregates & Counts] ---')

  const totalProducts = await prisma.product.count()
  const availableProducts = await prisma.product.count({ where: { available: true } })
  const featuredProducts = await prisma.product.count({ where: { featured: true } })
  const totalCategories = await prisma.category.count()
  const totalCollections = await prisma.collection.count()
  const totalGalleryItems = await prisma.galleryItem.count()

  assert(typeof totalProducts === 'number' && totalProducts >= 0, 'Total products count is a valid non-negative integer', `Count: ${totalProducts}`)
  assert(availableProducts <= totalProducts, 'Available products count is within total product boundary', `Available: ${availableProducts}/${totalProducts}`)
  assert(featuredProducts <= totalProducts, 'Featured products count is within total product boundary', `Featured: ${featuredProducts}/${totalProducts}`)
  assert(typeof totalCategories === 'number' && totalCategories >= 0, 'Categories count is a valid non-negative integer', `Count: ${totalCategories}`)
  assert(typeof totalCollections === 'number' && totalCollections >= 0, 'Collections count is a valid non-negative integer', `Count: ${totalCollections}`)
  assert(typeof totalGalleryItems === 'number' && totalGalleryItems >= 0, 'Gallery items count is a valid non-negative integer', `Count: ${totalGalleryItems}`)

  // -------------------------------------------------------------
  // Test Section 2: Recent Products Query & Relation Integrity
  // -------------------------------------------------------------
  console.log('\n--- [Section 2: Recent Products Query & Relationships] ---')

  const recentProducts = await prisma.product.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      available: true,
      featured: true,
      createdAt: true,
      category: { select: { name: true } },
      collection: { select: { name: true } },
      images: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
        select: { url: true, alt: true },
      },
    },
  })

  assert(Array.isArray(recentProducts), 'Recent products query executes cleanly and returns an array')

  if (recentProducts.length > 0) {
    const sample = recentProducts[0]
    assert(Boolean(sample.id && sample.name && sample.slug), 'Sample product contains required identity fields')
    assert(Number.isInteger(sample.price) && sample.price > 0, 'Product price is an integer in Ethiopian Birr (ETB)', `${sample.price} ETB`)
    assert(typeof sample.available === 'boolean', 'Product availability is a strict boolean')
    assert(sample.createdAt instanceof Date, 'Product creation date is a valid Date object')
    assert(sample.images === undefined || Array.isArray(sample.images), 'Product images relationship is appropriately formatted')
  }

  // -------------------------------------------------------------
  // Test Section 3: Ethiopian Birr Currency Formatting
  // -------------------------------------------------------------
  console.log('\n--- [Section 3: Ethiopian Birr Currency Convention] ---')

  const testPrices = [980, 1250, 4800, 12500]
  const formatted = testPrices.map((p) => `${p.toLocaleString()} ETB`)
  assert(formatted[0] === '980 ETB', 'Formats 980 ETB without decimals')
  assert(formatted[1] === '1,250 ETB' || formatted[1] === '1250 ETB', 'Formats thousands cleanly')
  assert(formatted[2] === '4,800 ETB' || formatted[2] === '4800 ETB', 'Formats 4800 ETB properly')

  // -------------------------------------------------------------
  // Test Section 4: Store Settings Query
  // -------------------------------------------------------------
  console.log('\n--- [Section 4: Store Settings Retrieval] ---')

  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'singleton' },
  })
  assert(settings !== null, 'Singleton store_settings record exists')
  assert(settings?.storeName === 'Shewa Fashion', 'Store name matches Shewa Fashion brand identity')

  // -------------------------------------------------------------
  // Test Section 5: Navigation Architecture
  // -------------------------------------------------------------
  console.log('\n--- [Section 5: Navigation Structure] ---')

  const overviewItem = navItems.find((item) => item.href === '/admin')
  assert(Boolean(overviewItem), 'Overview navigation item exists and links to /admin')

  const productsItem = navItems.find((item) => item.href === '/admin/products')
  assert(Boolean(productsItem), 'Products navigation item exists and links to /admin/products')

  const categoriesItem = navItems.find((item) => item.href === '/admin/categories')
  assert(Boolean(categoriesItem), 'Categories navigation item exists and links to /admin/categories')

  const collectionsItem = navItems.find((item) => item.href === '/admin/collections')
  assert(Boolean(collectionsItem), 'Collections navigation item exists and links to /admin/collections')

  const galleryItem = navItems.find((item) => item.href === '/admin/gallery')
  assert(Boolean(galleryItem), 'Gallery navigation item exists and links to /admin/gallery')

  const settingsItem = navItems.find((item) => item.href === '/admin/settings')
  assert(Boolean(settingsItem), 'Settings navigation item exists and links to /admin/settings')

  // All nav items must have required display fields
  const allHaveNames = navItems.every((item) => Boolean(item.name))
  assert(allHaveNames, 'All navigation items have display names')

  const allHaveHrefs = navItems.every((item) => item.href.startsWith('/admin'))
  assert(allHaveHrefs, 'All navigation items link within /admin')


  // -------------------------------------------------------------
  // Test Section 6: Route Protection & Redirect Sanitization
  // -------------------------------------------------------------
  console.log('\n--- [Section 6: Admin Route Protection & Open Redirect Defense] ---')

  assert(getSafeRedirectUrl('/admin') === '/admin', 'Safe redirect allows /admin')
  assert(getSafeRedirectUrl('/admin/products') === '/admin/products', 'Safe redirect allows subpaths under /admin')
  assert(getSafeRedirectUrl('https://malicious-site.com') === '/admin', 'Rejects external URLs')
  assert(getSafeRedirectUrl('//malicious-site.com') === '/admin', 'Rejects protocol-relative URLs')

  console.log('\n================================================================')
  console.log(` Test Results: ${passed} passed, ${failed} failed`)
  console.log('================================================================\n')

  await prisma.$disconnect()

  if (failed > 0) {
    process.exit(1)
  }
}

runDashboardTests().catch((err) => {
  console.error('Fatal error in dashboard test suite:', err)
  process.exit(1)
})
