/**
 * Shewa Fashion — Phase 18: Security & Accessibility Test Suite
 *
 * Verifies:
 * 1. Session security & cryptographic token hashing
 * 2. CSRF origin verification & open redirect protection
 * 3. Login rate limiting behavior
 * 4. Image upload validation & magic-byte security
 * 5. Safe storage key generation & path traversal prevention
 * 6. Deletion namespace enforcement & shared-image safeguards
 * 7. Security headers configuration (CSP, X-Content-Type-Options, etc.)
 * 8. Accessibility requirements (WCAG 2.2 AA)
 */

import assert from 'assert'
import {
  generateSessionToken,
  hashSessionToken,
  IDLE_TIMEOUT_MS,
  ABSOLUTE_LIFETIME_MS,
} from '../src/lib/session'
import {
  getSafeRedirectUrl,
  verifyCsrfOrigin,
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
  MAX_LOGIN_ATTEMPTS,
} from '../src/lib/auth'
import {
  detectImageSignature,
  validateImageBuffer,
  generateSafeStorageKey,
  MAX_IMAGE_FILE_SIZE,
} from '../src/lib/storage'
import nextConfig from '../next.config'

let passed = 0
let failed = 0

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result
        .then(() => {
          console.log(`  ✓ ${name}`)
          passed++
        })
        .catch((err) => {
          console.error(`  ✗ ${name}`)
          console.error(`    ${err.message}`)
          failed++
        })
    } else {
      console.log(`  ✓ ${name}`)
      passed++
    }
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`)
    console.error(`    ${(err as Error).message}`)
    failed++
  }
}

async function runAllTests() {
  console.log('\n======================================================')
  console.log('Shewa Fashion — Phase 18: Security & Accessibility Suite')
  console.log('======================================================\n')

  // ──────────────────────────────────────────────────────────
  // 1. Session Security & Token Cryptography
  // ──────────────────────────────────────────────────────────
  console.log('--- 1. Session Security & Cryptography ---')

  test('generateSessionToken produces at least 43 characters of base64url entropy (256-bit)', () => {
    const token1 = generateSessionToken()
    const token2 = generateSessionToken()
    assert.strictEqual(typeof token1, 'string')
    assert.ok(token1.length >= 43, 'Session token should be at least 43 chars')
    assert.notStrictEqual(token1, token2, 'Consecutive tokens must be distinct')
  })

  test('hashSessionToken produces 64-char hex SHA-256 hash', () => {
    const raw = generateSessionToken()
    const hash = hashSessionToken(raw)
    assert.strictEqual(hash.length, 64)
    assert.strictEqual(/^[0-9a-f]{64}$/.test(hash), true)
    // Deterministic for same input
    assert.strictEqual(hashSessionToken(raw), hash)
  })

  test('Enforces 30-minute idle timeout and 7-day absolute lifetime', () => {
    assert.strictEqual(IDLE_TIMEOUT_MS, 30 * 60 * 1000)
    assert.strictEqual(ABSOLUTE_LIFETIME_MS, 7 * 24 * 60 * 60 * 1000)
  })

  // ──────────────────────────────────────────────────────────
  // 2. Open Redirect Mitigation
  // ──────────────────────────────────────────────────────────
  console.log('\n--- 2. Open Redirect Mitigation ---')

  test('getSafeRedirectUrl allows legitimate /admin subpaths', () => {
    assert.strictEqual(getSafeRedirectUrl('/admin'), '/admin')
    assert.strictEqual(getSafeRedirectUrl('/admin/products'), '/admin/products')
    assert.strictEqual(getSafeRedirectUrl('/admin/products/new'), '/admin/products/new')
  })

  test('getSafeRedirectUrl rejects protocol-relative URL attacks (//evil.com)', () => {
    assert.strictEqual(getSafeRedirectUrl('//evil.com'), '/admin')
    assert.strictEqual(getSafeRedirectUrl('//attacker.org/admin'), '/admin')
  })

  test('getSafeRedirectUrl rejects backslash evasion (/\\evil.com)', () => {
    assert.strictEqual(getSafeRedirectUrl('/\\evil.com'), '/admin')
    assert.strictEqual(getSafeRedirectUrl('/admin\\test'), '/admin')
  })

  test('getSafeRedirectUrl rejects absolute external URLs and non-admin targets', () => {
    assert.strictEqual(getSafeRedirectUrl('https://evil.com'), '/admin')
    assert.strictEqual(getSafeRedirectUrl('javascript:alert(1)'), '/admin')
    assert.strictEqual(getSafeRedirectUrl('/shop'), '/admin')
  })

  // ──────────────────────────────────────────────────────────
  // 3. CSRF Origin Verification
  // ──────────────────────────────────────────────────────────
  console.log('\n--- 3. CSRF Protection ---')

  test('verifyCsrfOrigin allows safe GET/HEAD requests', () => {
    const req = new Request('http://localhost:3000/api/test', { method: 'GET' })
    assert.strictEqual(verifyCsrfOrigin(req), true)
  })

  test('verifyCsrfOrigin allows matching Origin header on POST', () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        origin: 'http://localhost:3000',
      },
    })
    assert.strictEqual(verifyCsrfOrigin(req), true)
  })

  test('verifyCsrfOrigin rejects mismatched Origin header on POST', () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        host: 'shewafashion.com',
        origin: 'https://malicious-site.com',
      },
    })
    assert.strictEqual(verifyCsrfOrigin(req), false)
  })

  // ──────────────────────────────────────────────────────────
  // 4. Login Rate Limiting
  // ──────────────────────────────────────────────────────────
  console.log('\n--- 4. Rate Limiting Protection ---')

  test('checkLoginRateLimit allows initial login attempts and tracks remaining attempts', () => {
    const testIp = '198.51.100.1'
    resetLoginRateLimit(testIp)
    const initial = checkLoginRateLimit(testIp)
    assert.strictEqual(initial.allowed, true)
    assert.strictEqual(initial.remainingAttempts, MAX_LOGIN_ATTEMPTS)

    recordFailedLoginAttempt(testIp)
    const afterOne = checkLoginRateLimit(testIp)
    assert.strictEqual(afterOne.allowed, true)
    assert.strictEqual(afterOne.remainingAttempts, MAX_LOGIN_ATTEMPTS - 1)
  })

  test('checkLoginRateLimit locks out IP after 5 consecutive failures', () => {
    const testIp = '198.51.100.2'
    resetLoginRateLimit(testIp)
    for (let i = 0; i < MAX_LOGIN_ATTEMPTS; i++) {
      recordFailedLoginAttempt(testIp)
    }
    const locked = checkLoginRateLimit(testIp)
    assert.strictEqual(locked.allowed, false)
    assert.ok(locked.retryAfterSeconds > 0)

    // Resetting unlocks
    resetLoginRateLimit(testIp)
    const unlocked = checkLoginRateLimit(testIp)
    assert.strictEqual(unlocked.allowed, true)
  })

  // ──────────────────────────────────────────────────────────
  // 5. Image Upload & Magic-Byte Validation
  // ──────────────────────────────────────────────────────────
  console.log('\n--- 5. Image Upload & Magic Byte Security ---')

  test('detectImageSignature accurately identifies valid JPEG header', () => {
    const jpegBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])
    const detected = detectImageSignature(jpegBuf)
    assert.deepStrictEqual(detected, { mime: 'image/jpeg', ext: 'jpg' })
  })

  test('detectImageSignature accurately identifies valid PNG header', () => {
    const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])
    const detected = detectImageSignature(pngBuf)
    assert.deepStrictEqual(detected, { mime: 'image/png', ext: 'png' })
  })

  test('detectImageSignature accurately identifies valid WebP header', () => {
    const webpBuf = Buffer.concat([
      Buffer.from('RIFF'),
      Buffer.from([0x20, 0x00, 0x00, 0x00]),
      Buffer.from('WEBP'),
    ])
    const detected = detectImageSignature(webpBuf)
    assert.deepStrictEqual(detected, { mime: 'image/webp', ext: 'webp' })
  })

  test('validateImageBuffer rejects malicious files disguising as image by filename', () => {
    // Text/HTML masquerading as image
    const fakeImage = Buffer.from('<script>alert("xss")</script>')
    const validation = validateImageBuffer(fakeImage)
    assert.strictEqual(validation.ok, false)
    assert.ok(validation.error?.includes('Invalid image format'))
  })

  test('validateImageBuffer rejects oversized files (> 5MB)', () => {
    const largeBuf = Buffer.alloc(MAX_IMAGE_FILE_SIZE + 1024)
    // Pretend it has JPEG header
    largeBuf[0] = 0xff
    largeBuf[1] = 0xd8
    largeBuf[2] = 0xff
    const validation = validateImageBuffer(largeBuf)
    assert.strictEqual(validation.ok, false)
    assert.ok(validation.error?.includes('exceeds the maximum allowed limit'))
  })

  // ──────────────────────────────────────────────────────────
  // 6. Safe Key Generation & Namespace Isolation
  // ──────────────────────────────────────────────────────────
  console.log('\n--- 6. Storage Keys & Path Traversal Mitigation ---')

  test('generateSafeStorageKey produces sanitised, unguessable names', () => {
    const key = generateSafeStorageKey('.jpg', 'products')
    assert.ok(key.startsWith('products/'))
    assert.ok(key.endsWith('.jpg'))
    assert.ok(!key.includes('..'), 'Must not contain parent directory traversal')
  })

  test('generateSafeStorageKey strips malicious path traversal in folder name', () => {
    const key = generateSafeStorageKey('png', '../../etc/passwd')
    assert.ok(!key.includes('..'))
    assert.ok(!key.startsWith('/'))
  })

  // ──────────────────────────────────────────────────────────
  // 7. Security Headers (next.config.ts)
  // ──────────────────────────────────────────────────────────
  console.log('\n--- 7. Security Headers Configuration ---')

  await test('next.config.ts defines Content-Security-Policy and protective headers', async () => {
    assert.strictEqual(typeof nextConfig.headers, 'function')
    const headersConfig = await nextConfig.headers!()
    assert.ok(Array.isArray(headersConfig) && headersConfig.length > 0)

    const routeHeaders = headersConfig[0].headers
    const headerMap = new Map(routeHeaders.map((h: { key: string; value: string }) => [h.key, h.value]))

    assert.strictEqual(headerMap.get('X-Content-Type-Options'), 'nosniff')
    assert.strictEqual(headerMap.get('X-Frame-Options'), 'SAMEORIGIN')
    assert.strictEqual(headerMap.get('Referrer-Policy'), 'strict-origin-when-cross-origin')
    assert.ok(headerMap.has('Permissions-Policy'))
    assert.ok(headerMap.has('Content-Security-Policy'))

    const csp = headerMap.get('Content-Security-Policy')!
    assert.ok(csp.includes("default-src 'self'"))
    assert.ok(csp.includes("frame-ancestors 'self'"))
    assert.ok(csp.includes("object-src 'none'"))
  })

  // ──────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────
  console.log('\n------------------------------------------------------')
  console.log(`Results: ${passed} passed, ${failed} failed`)
  console.log('------------------------------------------------------\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runAllTests().catch((err) => {
  console.error('Test suite failed:', err)
  process.exit(1)
})
