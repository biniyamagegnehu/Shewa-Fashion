/**
 * Shewa Fashion — API Response Helpers Test Suite
 *
 * Tests Parts 1–3 of the API foundation:
 *   1. Success helpers return correct JSON structure and HTTP status.
 *   2. Error helpers return correct JSON structure and HTTP status.
 *   3. Validation errors include field-level details.
 *   4. 204 No Content does not include a JSON body.
 *   5. Internal error details are not exposed in public responses.
 *   6. Validation parsing handles malformed input correctly.
 *
 * Run with:
 *   npx tsx scripts/test-api-response.ts
 */

// ── Polyfill NextResponse for the Node.js test environment ────────────────
// next/server requires the web Fetch API (Request, Response, Headers) which
// is available in Node 18+. Ensure we're running in a compatible version.

import { NextResponse } from 'next/server'

import {
  apiSuccess,
  apiCreated,
  apiNoContent,
  apiPaginated,
  apiError,
  apiBadRequest,
  apiValidationError,
  apiUnauthenticated,
  apiForbidden,
  apiNotFound,
  apiConflict,
  apiRateLimited,
  apiInternalError,
  type SuccessResponse,
  type PaginatedResponse,
  type ErrorResponse,
} from '../src/lib/api-response'

import {
  parseLoginInput,
  parseJsonBody,
} from '../src/lib/validation'

// ── Minimal test harness ──────────────────────────────────────────────────

let passed = 0
let failed = 0

function assert(condition: boolean, name: string, detail?: string): void {
  if (condition) {
    console.log(`  ✅ PASS  ${name}`)
    passed++
  } else {
    console.error(`  ❌ FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
    failed++
  }
}

async function readJson<T>(res: NextResponse): Promise<T> {
  return res.json() as Promise<T>
}

// ── Helper to create a mock Request ──────────────────────────────────────

function mockRequest(body: unknown): Request {
  return new Request('https://example.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n══════════════════════════════════════════════════════')
  console.log('  Shewa Fashion — API Response Helpers Test Suite')
  console.log('══════════════════════════════════════════════════════\n')

  // ── Part 1: Success responses ─────────────────────────────────────────

  console.log('Part 1 — Success responses')

  // 1a. apiSuccess returns 200 with envelope
  {
    const res = apiSuccess({ id: 'abc', name: 'Test' })
    const body = await readJson<SuccessResponse<{ id: string; name: string }>>(res)
    assert(res.status === 200, 'apiSuccess: HTTP 200')
    assert(body.success === true, 'apiSuccess: success flag is true')
    assert(body.data.id === 'abc' && body.data.name === 'Test', 'apiSuccess: data is correct')
  }

  // 1b. apiCreated returns 201
  {
    const res = apiCreated({ id: 'new-123' })
    const body = await readJson<SuccessResponse<{ id: string }>>(res)
    assert(res.status === 201, 'apiCreated: HTTP 201')
    assert(body.success === true, 'apiCreated: success flag is true')
    assert(body.data.id === 'new-123', 'apiCreated: data is correct')
  }

  // 1c. apiNoContent returns 204 with no body
  {
    const res = apiNoContent()
    assert(res.status === 204, 'apiNoContent: HTTP 204')
    const text = await res.text()
    assert(
      text === '' || text === null || text === undefined,
      'apiNoContent: response body is empty',
      `body was: "${text}"`,
    )
  }

  // 1d. apiPaginated returns correct meta
  {
    const data = [{ id: '1' }, { id: '2' }]
    const meta = { page: 2, pageSize: 10, totalItems: 25, totalPages: 3 }
    const res = apiPaginated(data, meta)
    const body = await readJson<PaginatedResponse<{ id: string }>>(res)
    assert(res.status === 200, 'apiPaginated: HTTP 200')
    assert(body.success === true, 'apiPaginated: success flag is true')
    assert(body.data.length === 2, 'apiPaginated: data array has correct length')
    assert(body.meta.page === 2, 'apiPaginated: meta.page is correct')
    assert(body.meta.totalItems === 25, 'apiPaginated: meta.totalItems is correct')
    assert(body.meta.totalPages === 3, 'apiPaginated: meta.totalPages is correct')
  }

  console.log()

  // ── Part 2: Error responses ──────────────────────────────────────────

  console.log('Part 2 — Error responses')

  const errorCases: [string, () => NextResponse<ErrorResponse>, number, string][] = [
    ['apiBadRequest', () => apiBadRequest(), 400, 'BAD_REQUEST'],
    ['apiValidationError', () => apiValidationError([{ field: 'email', message: 'Required.' }]), 422, 'VALIDATION_ERROR'],
    ['apiUnauthenticated', () => apiUnauthenticated(), 401, 'UNAUTHENTICATED'],
    ['apiForbidden', () => apiForbidden(), 403, 'FORBIDDEN'],
    ['apiNotFound', () => apiNotFound(), 404, 'NOT_FOUND'],
    ['apiConflict', () => apiConflict(), 409, 'CONFLICT'],
    ['apiRateLimited', () => apiRateLimited(), 429, 'RATE_LIMITED'],
    ['apiInternalError', () => apiInternalError(), 500, 'INTERNAL_ERROR'],
  ]

  for (const [name, fn, expectedStatus, expectedCode] of errorCases) {
    const res = fn()
    const body = await readJson<ErrorResponse>(res)
    assert(res.status === expectedStatus, `${name}: HTTP ${expectedStatus}`)
    assert(body.success === false, `${name}: success flag is false`)
    assert(body.error.code === expectedCode, `${name}: error code is ${expectedCode}`)
    assert(typeof body.error.message === 'string' && body.error.message.length > 0, `${name}: has non-empty message`)
  }

  console.log()

  // ── Part 3: Validation errors include field-level details ─────────────

  console.log('Part 3 — Validation error field-level details')

  {
    const details = [
      { field: 'email', message: 'Enter a valid email address.' },
      { field: 'password', message: 'Password is required.' },
    ]
    const res = apiValidationError(details, 'Please correct the highlighted fields.')
    const body = await readJson<ErrorResponse>(res)
    assert(res.status === 422, 'apiValidationError: HTTP 422')
    assert(body.error.code === 'VALIDATION_ERROR', 'apiValidationError: code is VALIDATION_ERROR')
    assert(Array.isArray(body.error.details), 'apiValidationError: details is an array')
    assert(body.error.details?.length === 2, 'apiValidationError: two field details')
    assert(body.error.details?.[0].field === 'email', 'apiValidationError: first detail field is email')
    assert(body.error.details?.[1].field === 'password', 'apiValidationError: second detail field is password')
  }

  // Error without details — details key must be absent
  {
    const res = apiNotFound('Product not found.')
    const body = await readJson<ErrorResponse>(res)
    assert(body.error.details === undefined, 'apiNotFound: no details key when none provided')
  }

  console.log()

  // ── Part 4: 204 body is empty ─────────────────────────────────────────
  // Already tested above in 1c.

  // ── Part 5: Internal error does not expose implementation details ──────

  console.log('Part 5 — Internal error safety')

  {
    // Simulate what a route handler would do on an unexpected error
    const internalError = new Error('Prisma: select * from users failed: connection refused at 127.0.0.1:5432')
    // Safe: log internally, return generic public message
    console.error('  [server log — not exposed to browser]:', internalError.message)

    const res = apiInternalError()
    const body = await readJson<ErrorResponse>(res)
    const bodyText = JSON.stringify(body)

    assert(res.status === 500, 'apiInternalError: HTTP 500')
    assert(!bodyText.includes('Prisma'), 'apiInternalError: body does not expose Prisma details')
    assert(!bodyText.includes('connection refused'), 'apiInternalError: body does not expose connection details')
    assert(!bodyText.includes('127.0.0.1'), 'apiInternalError: body does not expose internal IP')
    assert(!bodyText.includes('5432'), 'apiInternalError: body does not expose port number')
  }

  console.log()

  // ── Part 6: Validation parsing ─────────────────────────────────────────

  console.log('Part 6 — Validation parsing (parseLoginInput)')

  {
    // Valid input
    const result = parseLoginInput({ email: '  Admin@Example.COM  ', password: 'Secret123!' })
    assert(result.ok === true, 'parseLoginInput: valid input returns ok')
    if (result.ok) {
      assert(result.data.email === 'admin@example.com', 'parseLoginInput: email is normalised (trimmed + lowercased)')
      assert(result.data.password === 'Secret123!', 'parseLoginInput: password is preserved as-is')
    }
  }

  {
    // Missing email
    const result = parseLoginInput({ email: '', password: 'Secret123!' })
    assert(result.ok === false, 'parseLoginInput: missing email returns error')
    if (!result.ok) {
      assert(result.errors.some((e) => e.field === 'email'), 'parseLoginInput: error field is email')
    }
  }

  {
    // Invalid email format
    const result = parseLoginInput({ email: 'not-an-email', password: 'Secret123!' })
    assert(result.ok === false, 'parseLoginInput: invalid email format returns error')
  }

  {
    // Missing password
    const result = parseLoginInput({ email: 'test@example.com', password: '   ' })
    assert(result.ok === false, 'parseLoginInput: whitespace-only password returns error')
    if (!result.ok) {
      assert(result.errors.some((e) => e.field === 'password'), 'parseLoginInput: error field is password')
    }
  }

  {
    // Both fields missing
    const result = parseLoginInput({ email: '', password: '' })
    assert(result.ok === false, 'parseLoginInput: both fields empty returns multiple errors')
    if (!result.ok) {
      assert(result.errors.length === 2, 'parseLoginInput: returns 2 field errors')
    }
  }

  {
    // Null body
    const result = parseLoginInput(null)
    assert(result.ok === false, 'parseLoginInput: null body returns error')
  }

  {
    // parseJsonBody — valid JSON
    const req = mockRequest({ email: 'a@b.com', password: 'pw' })
    const body = await parseJsonBody(req)
    assert(body !== null, 'parseJsonBody: valid JSON returns parsed object')
  }

  {
    // parseJsonBody — invalid JSON
    const req = new Request('https://example.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not { json }',
    })
    const body = await parseJsonBody(req)
    assert(body === null, 'parseJsonBody: invalid JSON returns null')
  }

  // ── Summary ──────────────────────────────────────────────────────────

  console.log('\n══════════════════════════════════════════════════════')
  console.log(`  Results: ${passed} passed, ${failed} failed`)
  console.log('══════════════════════════════════════════════════════\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err)
  process.exit(1)
})
