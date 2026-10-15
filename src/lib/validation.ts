/**
 * Shewa Fashion — Server-Side Validation Conventions
 *
 * Lightweight validation utilities for Route Handlers and Server Actions.
 *
 * This project does not install Zod as a direct dependency because:
 *   - No client-bundle validation is needed (all validation is server-side).
 *   - The only current use-case is a small set of input shapes.
 *   - The `effect` peer brings Zod v3/v4 transitively; we DO NOT rely on
 *     that transitive copy — peer dependencies are not stable public API.
 *
 * If input validation complexity grows in future phases, add Zod explicitly
 * as a direct dependency and replace these helpers with Zod schemas.
 *
 * ────────────────────────────────────────────────────────────
 * Usage pattern (Route Handler):
 *
 *   const parsed = parseLoginInput(await request.json().catch(() => null))
 *   if (!parsed.ok) return apiValidationError(parsed.errors)
 *   const { email, password } = parsed.data
 *
 * Usage pattern (Server Action):
 *   const parsed = parseLoginInput({ email: formData.get('email'), password: ... })
 *   if (!parsed.ok) return { errors: parsed.errors }
 * ────────────────────────────────────────────────────────────
 */

import type { ValidationDetail } from '@/lib/api-response'

// ============================================================
// Core result types
// ============================================================

export interface ParseOk<T> {
  ok: true
  data: T
}

export interface ParseFail {
  ok: false
  errors: ValidationDetail[]
}

export type ParseResult<T> = ParseOk<T> | ParseFail

// ============================================================
// Internal field validators
// ============================================================

/** Validate that a raw value is a non-empty string after trimming. */
function requireString(raw: unknown, field: string, label: string): string | ValidationDetail {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { field, message: `${label} is required.` }
  }
  return raw.trim()
}

/** Validate an email address format and length. */
function requireEmail(raw: unknown, field = 'email'): string | ValidationDetail {
  const str = requireString(raw, field, 'Email address')
  if (typeof str !== 'string') return str // already an error

  const normalised = str.toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalised) || normalised.length > 254) {
    return { field, message: 'Enter a valid email address.' }
  }
  return normalised
}

// ============================================================
// Parsed input shapes
// ============================================================

export interface LoginInput {
  email: string
  password: string
}

/**
 * Validate and normalise raw login input from a form or JSON body.
 *
 * Trims whitespace, lowercases the email, and returns field-level
 * error details using the standard ValidationDetail shape.
 *
 * @example — Route Handler
 *   const body = await request.json().catch(() => null)
 *   const parsed = parseLoginInput(body)
 *   if (!parsed.ok) return apiValidationError(parsed.errors)
 *
 * @example — Server Action (FormData)
 *   const parsed = parseLoginInput({
 *     email: formData.get('email'),
 *     password: formData.get('password'),
 *   })
 *   if (!parsed.ok) return { errors: parsed.errors }
 */
export function parseLoginInput(raw: unknown): ParseResult<LoginInput> {
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, errors: [{ field: '_form', message: 'Invalid request body.' }] }
  }

  const body = raw as Record<string, unknown>
  const errors: ValidationDetail[] = []

  const emailResult = requireEmail(body.email, 'email')
  if (typeof emailResult !== 'string') errors.push(emailResult)

  const passwordResult = requireString(body.password, 'password', 'Password')
  if (typeof passwordResult !== 'string') errors.push(passwordResult)

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      email: emailResult as string,
      password: passwordResult as string,
    },
  }
}

// ============================================================
// Generic safe JSON body parser
// ============================================================

/**
 * Parse a JSON request body safely.
 * Returns null if the body is missing or not valid JSON,
 * allowing the caller to return a 400 Bad Request response.
 *
 * @example
 *   const body = await parseJsonBody(request)
 *   if (!body) return apiBadRequest('Request body must be valid JSON.')
 */
export async function parseJsonBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json()
  } catch {
    return null
  }
}
