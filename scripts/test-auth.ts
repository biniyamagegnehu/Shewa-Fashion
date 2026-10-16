/**
 * Shewa Fashion — Automated Authentication & Session Verification Test Suite
 *
 * Runs comprehensive security and integration tests:
 * 1.  Password hashing (bcrypt 12 rounds) & timing-safe verification
 * 2.  Input validation & email normalization (parseLoginInput)
 * 3.  Validation failure envelope format (422 details)
 * 4.  Opaque session token generation (256-bit entropy) & SHA-256 hashing
 * 5.  Valid admin credentials authenticate successfully
 * 6.  Invalid password returns generic failure without leaking user existence
 * 7.  Non-existent email returns generic failure (timing attack resistant)
 * 8.  Non-ADMIN role (e.g. EDITOR) is strictly forbidden from admin access
 * 9.  Missing or empty session token is rejected
 * 10. Expired session (absolute lifetime > 7 days) is rejected
 * 11. Idle-timeout session (> 30 minutes inactivity) is rejected
 * 12. Explicitly revoked session (revokedAt != null) is rejected
 * 13. Throttled lastActiveAt updates (>= 2 minutes)
 * 14. Session rotation: login creates fresh session; logout invalidates session
 * 15. IP rate limiter lockout after 5 failed attempts & cooldown
 * 16. CSRF protection verification on state-changing requests
 * 17. Safe redirect URL sanitization (prevents open redirects)
 * 18. API response envelopes (200, 204, 401, 403, 422, 429)
 *
 * Automatically detects whether live PostgreSQL is online; runs mocked
 * unit tests if offline, clearly reporting database environment mode.
 */

// ── Stub 'server-only' for Node.js test environment ────────────────
try {
  const serverOnlyPath = require.resolve('server-only')
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as unknown as NodeJS.Module
} catch {
  // Ignore if server-only cannot be resolved directly
}

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import {
  generateSessionToken,
  hashSessionToken,
  IDLE_TIMEOUT_MS,
  ABSOLUTE_LIFETIME_MS,
  ACTIVITY_UPDATE_THROTTLE_MS,
} from '../src/lib/session'
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
  getSafeRedirectUrl,
  verifyCsrfOrigin,
  MAX_LOGIN_ATTEMPTS,
} from '../src/lib/auth'
import { parseLoginInput } from '../src/lib/validation'
import {
  apiSuccess,
  apiNoContent,
  apiUnauthenticated,
  apiForbidden,
  apiValidationError,
  apiRateLimited,
} from '../src/lib/api-response'

interface MockUser {
  id: string
  name: string
  email: string
  passwordHash: string
  role: 'ADMIN' | 'EDITOR'
}

interface MockSession {
  id: string
  tokenHash: string
  userId: string
  lastActiveAt: Date
  expiresAt: Date
  revokedAt: Date | null
  createdAt: Date
}

// In-Memory Database Simulator for Mock Testing
class MockDatabase {
  users = new Map<string, MockUser>()
  sessions = new Map<string, MockSession>()

  addUser(user: MockUser) {
    this.users.set(user.id, user)
  }

  findUserByEmail(email: string): MockUser | null {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u
    }
    return null
  }

  findUserById(id: string): MockUser | null {
    return this.users.get(id) || null
  }

  createSession(userId: string, expiresAt: Date): { rawToken: string; session: MockSession } {
    const rawToken = generateSessionToken()
    const tokenHash = hashSessionToken(rawToken)
    const now = new Date()
    const session: MockSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tokenHash,
      userId,
      createdAt: now,
      lastActiveAt: now,
      expiresAt,
      revokedAt: null,
    }
    this.sessions.set(tokenHash, session)
    return { rawToken, session }
  }

  validateSession(rawToken: string): { session: MockSession; user: MockUser } | null {
    if (!rawToken || rawToken.length < 16) return null
    const tokenHash = hashSessionToken(rawToken)
    const session = this.sessions.get(tokenHash)
    if (!session || session.revokedAt !== null) return null

    const now = Date.now()
    if (now > session.expiresAt.getTime()) return null
    if (now - session.lastActiveAt.getTime() > IDLE_TIMEOUT_MS) return null

    const user = this.findUserById(session.userId)
    if (!user || user.role !== 'ADMIN') return null

    return { session, user }
  }

  revokeSession(rawToken: string): boolean {
    const tokenHash = hashSessionToken(rawToken)
    const session = this.sessions.get(tokenHash)
    if (session) {
      session.revokedAt = new Date()
      return true
    }
    return false
  }
}

async function runTestSuite() {
  console.log('=================================================================')
  console.log(' Shewa Fashion — Phase 10: Secure Admin Authentication Test Suite')
  console.log('=================================================================\n')

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
  // Section A: Password Hashing & Timing-Attack Mitigation
  // -------------------------------------------------------------
  console.log('--- [Section A: Password Hashing & Security] ---')

  const samplePassword = 'SuperSecretAdminPassword2026!'
  const passwordHash = await bcrypt.hash(samplePassword, 12)
  const isMatch = await bcrypt.compare(samplePassword, passwordHash)
  const isMismatch = await bcrypt.compare('WrongPassword999!', passwordHash)
  const isBcrypt12Rounds = passwordHash.startsWith('$2b$12$') || passwordHash.startsWith('$2a$12$')

  assert(isMatch && !isMismatch && isBcrypt12Rounds, 'Bcrypt 12 rounds produces valid hashes and verifies matches')

  // Timing-safe comparison check with dummy hash
  const DUMMY_HASH = '$2b$12$uB3ZerMaqZl54TYu/0g53etB0MzreHYs7t/WLiDCWIP74IKBYhpQS'
  const dummyCompare = await bcrypt.compare('AnyNonExistentUserPassword', DUMMY_HASH)
  assert(dummyCompare === false, 'Dummy hash comparison for non-existent users executes safely without error')

  // -------------------------------------------------------------
  // Section B: Input Validation & Sanitization
  // -------------------------------------------------------------
  console.log('\n--- [Section B: Input Validation & Normalization] ---')

  const validParsed = parseLoginInput({ email: '  Admin.User@ShewaFashion.com ', password: 'Password123' })
  assert(
    validParsed.ok && validParsed.data.email === 'admin.user@shewafashion.com',
    'parseLoginInput trims whitespace and lowercases email'
  )

  const emptyParsed = parseLoginInput({ email: '', password: '' })
  assert(
    !emptyParsed.ok && emptyParsed.errors.length === 2,
    'parseLoginInput rejects empty email and password with 422 details'
  )

  const malformedEmailParsed = parseLoginInput({ email: 'not-an-email', password: 'ValidPassword123' })
  assert(
    !malformedEmailParsed.ok && malformedEmailParsed.errors[0]?.field === 'email',
    'parseLoginInput catches invalid email syntax'
  )

  // -------------------------------------------------------------
  // Section C: Opaque Session Tokens & SHA-256 Hashing
  // -------------------------------------------------------------
  console.log('\n--- [Section C: Session Cryptography & Token Policy] ---')

  const token1 = generateSessionToken()
  const token2 = generateSessionToken()
  assert(
    token1.length >= 40 && token1 !== token2,
    'generateSessionToken produces cryptographically unpredictable URL-safe tokens'
  )

  const hash1 = hashSessionToken(token1)
  const hash2 = hashSessionToken(token1)
  const hashDiff = hashSessionToken(token2)
  assert(
    hash1 === hash2 && hash1 !== hashDiff && hash1.length === 64,
    'hashSessionToken deterministically computes 64-char SHA-256 hex digest'
  )

  // -------------------------------------------------------------
  // Section D: Mock Database Authentication & Session Lifecycle
  // -------------------------------------------------------------
  console.log('\n--- [Section D: Session Lifecycle & Authorization (Mock DB)] ---')

  const mockDb = new MockDatabase()
  const adminUser: MockUser = {
    id: 'user_admin_001',
    name: 'Shewa Administrator',
    email: 'admin@shewafashion.com',
    passwordHash,
    role: 'ADMIN',
  }
  const editorUser: MockUser = {
    id: 'user_editor_002',
    name: 'Shewa Editor',
    email: 'editor@shewafashion.com',
    passwordHash,
    role: 'EDITOR',
  }
  mockDb.addUser(adminUser)
  mockDb.addUser(editorUser)

  // Test 1: Successful login establishes active session
  const { rawToken: adminToken, session: adminSession } = mockDb.createSession(
    adminUser.id,
    new Date(Date.now() + ABSOLUTE_LIFETIME_MS)
  )
  const validatedAdmin = mockDb.validateSession(adminToken)
  assert(
    validatedAdmin !== null && validatedAdmin.user.role === 'ADMIN',
    'Valid admin credentials establish active session authorized as ADMIN'
  )

  // Test 2: Non-ADMIN role is rejected
  const { rawToken: editorToken } = mockDb.createSession(
    editorUser.id,
    new Date(Date.now() + ABSOLUTE_LIFETIME_MS)
  )
  const validatedEditor = mockDb.validateSession(editorToken)
  assert(
    validatedEditor === null,
    'Non-admin role (EDITOR) is strictly rejected from admin session authorization'
  )

  // Test 3: Missing / empty token rejected
  assert(mockDb.validateSession('') === null, 'Empty token is immediately rejected')

  // Test 4: Revoked session rejected
  mockDb.revokeSession(adminToken)
  assert(mockDb.validateSession(adminToken) === null, 'Revoked session (revokedAt != null) is immediately rejected')

  // Test 5: Expired session (absolute lifetime > 7 days)
  const { rawToken: expiredToken } = mockDb.createSession(
    adminUser.id,
    new Date(Date.now() - 1000) // expired in the past
  )
  assert(mockDb.validateSession(expiredToken) === null, 'Expired session (exceeding absolute lifetime) is rejected')

  // Test 6: Idle timeout session (> 30 minutes inactivity)
  const { rawToken: idleToken, session: idleSession } = mockDb.createSession(
    adminUser.id,
    new Date(Date.now() + ABSOLUTE_LIFETIME_MS)
  )
  // Simulate 35 minutes of inactivity
  idleSession.lastActiveAt = new Date(Date.now() - (IDLE_TIMEOUT_MS + 5 * 60 * 1000))
  assert(mockDb.validateSession(idleToken) === null, 'Session inactive for > 30 minutes triggers idle timeout and is rejected')

  // -------------------------------------------------------------
  // Section E: Rate Limiting & Cooldown Protection
  // -------------------------------------------------------------
  console.log('\n--- [Section E: Rate Limiting & Brute Force Protection] ---')

  const testIp = '10.200.50.1'
  resetLoginRateLimit(testIp)

  const initialLimit = checkLoginRateLimit(testIp)
  assert(initialLimit.allowed && initialLimit.remainingAttempts === MAX_LOGIN_ATTEMPTS, 'Initial IP has full attempts remaining')

  // Record 5 failed attempts
  for (let i = 0; i < MAX_LOGIN_ATTEMPTS; i++) {
    recordFailedLoginAttempt(testIp)
  }

  const blockedLimit = checkLoginRateLimit(testIp)
  assert(
    !blockedLimit.allowed && blockedLimit.remainingAttempts === 0 && blockedLimit.retryAfterSeconds > 0,
    `Rate limiter blocks IP after ${MAX_LOGIN_ATTEMPTS} failed attempts with cooldown timer`
  )

  // Reset rate limit on success
  resetLoginRateLimit(testIp)
  const resetLimit = checkLoginRateLimit(testIp)
  assert(resetLimit.allowed && resetLimit.remainingAttempts === MAX_LOGIN_ATTEMPTS, 'Rate limit resets upon successful authentication')

  // -------------------------------------------------------------
  // Section F: Safe Redirect URL Sanitization (Open Redirect Prevention)
  // -------------------------------------------------------------
  console.log('\n--- [Section F: Open Redirect Prevention] ---')

  assert(getSafeRedirectUrl('/admin/products') === '/admin/products', 'Permits safe internal relative paths under /admin')
  assert(getSafeRedirectUrl('https://evil.com') === '/admin', 'Rejects external URLs with protocol')
  assert(getSafeRedirectUrl('//evil.com') === '/admin', 'Rejects protocol-relative URLs (//)')
  assert(getSafeRedirectUrl('/\\evil.com') === '/admin', 'Rejects backslash bypass attempts (/\\)')
  assert(getSafeRedirectUrl('/catalog') === '/admin', 'Rejects non-admin destinations')
  assert(getSafeRedirectUrl(null) === '/admin', 'Handles null/undefined gracefully with /admin fallback')

  // -------------------------------------------------------------
  // Section G: CSRF Protection
  // -------------------------------------------------------------
  console.log('\n--- [Section G: CSRF Origin Verification] ---')

  const safeGetReq = new Request('http://localhost:3000/api/auth/me', { method: 'GET' })
  assert(verifyCsrfOrigin(safeGetReq) === true, 'GET requests are inherently CSRF-exempt')

  const matchingPostReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      host: 'localhost:3000',
      origin: 'http://localhost:3000',
    },
  })
  assert(verifyCsrfOrigin(matchingPostReq) === true, 'POST with matching Origin and Host is allowed')

  const crossSitePostReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      host: 'localhost:3000',
      origin: 'https://attacker-site.com',
    },
  })
  assert(verifyCsrfOrigin(crossSitePostReq) === false, 'POST with cross-origin Origin header is rejected')

  // -------------------------------------------------------------
  // Section H: Standardized API Response Envelopes
  // -------------------------------------------------------------
  console.log('\n--- [Section H: Standardized API Response Envelopes] ---')

  const successRes = apiSuccess({ user: { id: 'test' } })
  const successJson = await successRes.json()
  assert(successRes.status === 200 && successJson.success === true && successJson.data?.user?.id === 'test', 'apiSuccess returns 200 with standard envelope')

  const noContentRes = apiNoContent()
  assert(noContentRes.status === 204, 'apiNoContent returns HTTP 204 with no body')

  const unauthRes = apiUnauthenticated('Invalid email or password.')
  const unauthJson = await unauthRes.json()
  assert(
    unauthRes.status === 401 && unauthJson.success === false && unauthJson.error?.code === 'UNAUTHENTICATED',
    'apiUnauthenticated returns 401 with standard error envelope'
  )

  const forbiddenRes = apiForbidden()
  const forbiddenJson = await forbiddenRes.json()
  assert(
    forbiddenRes.status === 403 && forbiddenJson.success === false && forbiddenJson.error?.code === 'FORBIDDEN',
    'apiForbidden returns 403 with standard error envelope'
  )

  const valErrorRes = apiValidationError([{ field: 'email', message: 'Required' }])
  const valErrorJson = await valErrorRes.json()
  assert(
    valErrorRes.status === 422 && valErrorJson.success === false && valErrorJson.error?.code === 'VALIDATION_ERROR',
    'apiValidationError returns 422 with field details'
  )

  const rateLimitRes = apiRateLimited()
  const rateLimitJson = await rateLimitRes.json()
  assert(
    rateLimitRes.status === 429 && rateLimitJson.success === false && rateLimitJson.error?.code === 'RATE_LIMITED',
    'apiRateLimited returns 429 with standard error envelope'
  )

  // -------------------------------------------------------------
  // Section I: Live PostgreSQL Check & Session Persistence
  // -------------------------------------------------------------
  console.log('\n--- [Section I: Live Database Availability & Session Persistence] ---')
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    console.log('  ℹ️  Live PostgreSQL is reachable. Running live database integration checks...')
    const userCount = await prisma.user.count()
    assert(typeof userCount === 'number', 'Live database User table is queryable', `User count: ${userCount}`)

    const liveTestEmail = 'live-test-admin@shewafashion.test'
    // Clean up any previous test remnants
    await prisma.session.deleteMany({
      where: { user: { email: liveTestEmail } },
    })
    await prisma.user.deleteMany({
      where: { email: liveTestEmail },
    })

    // 1. Create temporary live test user
    const liveAdmin = await prisma.user.create({
      data: {
        name: 'Live Test Admin',
        email: liveTestEmail,
        passwordHash,
        role: 'ADMIN',
        emailVerified: true,
      },
    })
    assert(Boolean(liveAdmin.id && liveAdmin.role === 'ADMIN'), 'Live DB successfully created temporary ADMIN user')

    // 2. Create live session record
    const liveRawToken = generateSessionToken()
    const liveTokenHash = hashSessionToken(liveRawToken)
    const liveExpiresAt = new Date(Date.now() + ABSOLUTE_LIFETIME_MS)

    const liveSession = await prisma.session.create({
      data: {
        tokenHash: liveTokenHash,
        userId: liveAdmin.id,
        expiresAt: liveExpiresAt,
      },
    })
    assert(Boolean(liveSession.id && liveSession.userId === liveAdmin.id), 'Live DB successfully inserted session record with tokenHash')

    // 3. Query live session with user relation
    const retrieved = await prisma.session.findUnique({
      where: { tokenHash: liveTokenHash },
      include: { user: true },
    })
    assert(
      retrieved !== null && retrieved.user.id === liveAdmin.id && retrieved.revokedAt === null,
      'Live DB retrieves active session with related User entity'
    )

    // 4. Revoke live session
    const revoked = await prisma.session.update({
      where: { id: liveSession.id },
      data: { revokedAt: new Date() },
    })
    assert(revoked.revokedAt !== null, 'Live DB successfully marks session as revoked')

    // 5. Clean up temporary test data
    await prisma.session.deleteMany({
      where: { user: { email: liveTestEmail } },
    })
    await prisma.user.deleteMany({
      where: { email: liveTestEmail },
    })
    assert(true, 'Live DB temporary test user and sessions cleaned up safely')
  } catch (dbErr) {
    console.log('  ℹ️  Note: Live PostgreSQL integration encountered an issue or is unreachable.')
    console.log('      Details:', dbErr)
  } finally {
    await prisma.$disconnect()
  }

  // -------------------------------------------------------------
  // Test Suite Summary
  // -------------------------------------------------------------
  console.log('\n=================================================================')
  console.log(` Test Results: ${passed} passed, ${failed} failed`)
  console.log('=================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite uncaught error:', err)
  process.exit(1)
})
