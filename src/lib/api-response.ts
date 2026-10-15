/**
 * Shewa Fashion — Standardised API Response Helpers
 *
 * Provides typed envelope builders for all JSON API endpoints (Route Handlers).
 * Do NOT use these helpers inside Server Components or Server Actions — those
 * mechanisms use direct data access and typed action results respectively.
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │  Status Code Convention                                   │
 * │  200  OK — standard successful read / operation           │
 * │  201  Created — resource successfully created             │
 * │  204  No Content — success with no response body          │
 * │  400  Bad Request — malformed request syntax              │
 * │  401  Unauthenticated — missing or invalid credentials    │
 * │  403  Forbidden — authenticated but not authorised        │
 * │  404  Not Found — resource does not exist                 │
 * │  409  Conflict — resource state prevents the operation    │
 * │  422  Unprocessable Entity — valid syntax, invalid data   │
 * │  429  Too Many Requests — rate limit exceeded             │
 * │  500  Internal Server Error — unexpected server failure   │
 * │                                                           │
 * │  400 vs 422: Use 400 for structurally malformed requests  │
 * │  (bad JSON, missing required field types). Use 422 for    │
 * │  semantically invalid but well-formed requests (field     │
 * │  value fails business rules or format constraints).       │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextResponse } from 'next/server'

// ============================================================
// Success response types
// ============================================================

/** Pagination metadata returned with list endpoints. */
export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

/** Envelope for a single-item or arbitrary data success response. */
export interface SuccessResponse<T> {
  success: true
  data: T
}

/** Envelope for a paginated list success response. */
export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: PaginationMeta
}

// ============================================================
// Error response types
// ============================================================

/**
 * Documented set of machine-readable error codes.
 * Keep in sync with the API conventions documentation.
 */
export type ApiErrorCode =
  | 'BAD_REQUEST'       // 400 — malformed request
  | 'VALIDATION_ERROR'  // 422 — field-level validation failure
  | 'UNAUTHENTICATED'   // 401 — missing or invalid credentials
  | 'FORBIDDEN'         // 403 — authenticated but lacks permission
  | 'NOT_FOUND'         // 404 — resource not found
  | 'CONFLICT'          // 409 — resource state conflict
  | 'RATE_LIMITED'      // 429 — rate limit exceeded
  | 'INTERNAL_ERROR'    // 500 — unexpected server failure

/** Optional field-level validation detail. */
export interface ValidationDetail {
  field: string
  message: string
}

/** Error payload nested inside the error envelope. */
export interface ApiErrorPayload {
  code: ApiErrorCode
  message: string
  details?: ValidationDetail[]
}

/** Envelope for all API error responses. */
export interface ErrorResponse {
  success: false
  error: ApiErrorPayload
}

// ============================================================
// Success helpers
// ============================================================

/**
 * Return a 200 OK JSON response with a standard success envelope.
 *
 * @example
 * return apiSuccess({ id: product.id, name: product.name })
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<SuccessResponse<T>> {
  return NextResponse.json<SuccessResponse<T>>({ success: true, data }, { status })
}

/**
 * Return a 201 Created JSON response.
 *
 * @example
 * return apiCreated({ id: newProduct.id })
 */
export function apiCreated<T>(data: T): NextResponse<SuccessResponse<T>> {
  return apiSuccess(data, 201)
}

/**
 * Return a 204 No Content response.
 * Per HTTP semantics, 204 must not include a body.
 *
 * @example
 * return apiNoContent()
 */
export function apiNoContent(): NextResponse<never> {
  return new NextResponse(null, { status: 204 }) as NextResponse<never>
}

/**
 * Return a paginated 200 OK JSON response.
 *
 * @example
 * return apiPaginated(products, {
 *   page: 1,
 *   pageSize: 12,
 *   totalItems: 36,
 *   totalPages: 3,
 * })
 */
export function apiPaginated<T>(
  data: T[],
  meta: PaginationMeta,
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json<PaginatedResponse<T>>(
    { success: true, data, meta },
    { status: 200 },
  )
}

// ============================================================
// Error helpers
// ============================================================

/**
 * Return a standardised JSON error response.
 *
 * Never include stack traces, SQL, password hashes, session tokens,
 * or internal implementation details in `message` or `details`.
 *
 * @example
 * return apiError('NOT_FOUND', 404, 'Product not found.')
 */
export function apiError(
  code: ApiErrorCode,
  status: number,
  message: string,
  details?: ValidationDetail[],
): NextResponse<ErrorResponse> {
  const payload: ApiErrorPayload = { code, message }
  if (details && details.length > 0) {
    payload.details = details
  }
  return NextResponse.json<ErrorResponse>({ success: false, error: payload }, { status })
}

// ============================================================
// Shorthand error builders — preferred for common cases
// ============================================================

/** 400 Bad Request — structurally malformed request. */
export const apiBadRequest = (message = 'Bad request.', details?: ValidationDetail[]) =>
  apiError('BAD_REQUEST', 400, message, details)

/**
 * 422 Unprocessable Entity — valid syntax but invalid field values.
 * Include `details` to surface field-level errors to the frontend.
 */
export const apiValidationError = (
  details: ValidationDetail[],
  message = 'Please correct the highlighted fields.',
) => apiError('VALIDATION_ERROR', 422, message, details)

/** 401 Unauthenticated — missing or invalid credentials. */
export const apiUnauthenticated = (message = 'Authentication required.') =>
  apiError('UNAUTHENTICATED', 401, message)

/** 403 Forbidden — authenticated but lacks permission. */
export const apiForbidden = (message = 'You do not have permission to perform this action.') =>
  apiError('FORBIDDEN', 403, message)

/** 404 Not Found — resource does not exist. */
export const apiNotFound = (message = 'The requested resource was not found.') =>
  apiError('NOT_FOUND', 404, message)

/** 409 Conflict — resource state prevents the operation. */
export const apiConflict = (message = 'This resource already exists or is in a conflicting state.') =>
  apiError('CONFLICT', 409, message)

/** 429 Too Many Requests — rate limit exceeded. */
export const apiRateLimited = (message = 'Too many requests. Please try again later.') =>
  apiError('RATE_LIMITED', 429, message)

/**
 * 500 Internal Server Error — unexpected server failure.
 *
 * Always log the original error server-side before calling this.
 * Never pass internal error details as the public message.
 */
export const apiInternalError = (message = 'An unexpected error occurred. Please try again.') =>
  apiError('INTERNAL_ERROR', 500, message)
