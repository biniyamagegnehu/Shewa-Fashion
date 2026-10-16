# Shewa Fashion — Secure Administrator Authentication

## 1. Architecture Overview

Shewa Fashion employs a secure, multi-layered, server-side session authentication system built with Next.js 16.4 App Router, TypeScript, PostgreSQL, and Prisma ORM.

Public storefront routes and administrator portals are strictly isolated. In compliance with architectural requirements, authentication uses **opaque, database-backed server sessions stored in PostgreSQL**, avoiding client-side JWT access/refresh token vulnerabilities.

---

## 2. Server-Side Session Architecture

### Session Policy
* **Opaque Tokens**: Cryptographically secure, unpredictable 256-bit random tokens (`crypto.randomBytes(32).toString('base64url')`).
* **Cryptographic Storage**: Only a **SHA-256 hash** of the raw token (`tokenHash`) is persisted in PostgreSQL. The raw token exists solely in the client's `HttpOnly` cookie.
* **Idle Timeout**: **30 minutes**. If `Date.now() - session.lastActiveAt > 30 minutes`, the session is rejected.
* **Absolute Lifetime**: **7 days** (`expiresAt`). Once exceeded, the session cannot be extended or re-used.
* **Database Write Throttling**: To prevent excessive database writes on concurrent or frequent requests, `lastActiveAt` is updated in PostgreSQL at most once every **2 minutes**.
* **Session Rotation**: When a user logs in, any prior session cookie is invalidated and a fresh session token is minted, eliminating session fixation vulnerabilities.
* **Explicit Revocation**: During logout, the session's `revokedAt` timestamp is set in PostgreSQL, and the cookie is deleted.

### Cookie Configuration
| Attribute | Setting | Description |
| :--- | :--- | :--- |
| **Name** | `shewa_admin_session` | Isolated administration cookie name. |
| **HttpOnly** | `true` | Prevents access from client-side JavaScript (mitigating XSS theft). |
| **SameSite** | `Lax` | Provides defense against Cross-Site Request Forgery (CSRF). |
| **Secure** | `true` in production | Transmitted exclusively over encrypted HTTPS connections. |
| **Path** | `/` | Valid across application routing boundaries. |
| **MaxAge** | `604800` (7 days) | Synchronized with the session's absolute lifetime. |

---

## 3. Database Schema & Migration

### Prisma Model (`prisma/schema.prisma`)
```prisma
model Session {
  id           String    @id @default(cuid())
  tokenHash    String    @unique
  userId       String
  lastActiveAt DateTime  @default(now())
  expiresAt    DateTime
  revokedAt    DateTime?
  createdAt    DateTime  @default(now())

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@index([expiresAt])
  @@map("sessions")
}
```

### Migration History
* `20261009124055_init`: Initial schema including `users`, `categories`, `collections`, `products`, `gallery_items`, and `store_settings`.
* `20261016153000_add_session_model`: Creates `sessions` table, unique index on `tokenHash`, indexes on `userId` and `expiresAt`, and foreign key constraint cascade to `users(id)`.

To apply pending migrations in production:
```bash
npm run prisma -- migrate deploy
```

---

## 4. Credential Verification & Password Hashing

### Password Hashing Choice: Bcrypt (12 Rounds)
* Passwords are never stored in plaintext.
* Hashing utilizes `bcryptjs` with 12 salt rounds (computationally resistant to brute-force attacks).
* **Rationale vs. Argon2id**: While Argon2id provides state-of-the-art memory hardness, compiled native C++ bindings frequently encounter platform-specific toolchain incompatibilities (such as missing MSVC C++ build tools on Windows or native compilation failures in minimal Docker/serverless environments). The installed and verified `bcryptjs` implementation offers pure JavaScript runtime portability, constant-time comparisons, and battle-tested security.
* **Timing-Attack Mitigation**: When an unrecognized email address is submitted, verification evaluates against a fixed dummy bcrypt hash to ensure constant response latency, preventing email enumeration.
* **Generic Failure Messaging**: Both non-existent accounts and incorrect passwords return identical generic error messages: `"Invalid email or password."`

---

## 5. Authorization & Route Protection

### Defense-in-Depth Layers
1. **Next.js Proxy (`src/proxy.ts`)**:
   Optimistically inspects incoming requests to `/admin/*`. If no `shewa_admin_session` cookie is present, redirects immediately to `/admin/login`.
2. **Server Components & Server Actions (`src/lib/auth.ts`)**:
   `requireAdminSession()` and `verifyAdminSession()` query PostgreSQL directly:
   * Hashes incoming cookie token using SHA-256.
   * Confirms session existence, validity, non-revoked status, and lifetime boundaries.
   * Confirms associated `User` exists and possesses `role === 'ADMIN'`.
   * Never trusts client headers or unverified tokens.
3. **API Route Handlers (`src/lib/auth.ts`)**:
   `requireAdminApi()` enforces the same PostgreSQL checks and returns standard JSON error envelopes (`UNAUTHENTICATED` or `FORBIDDEN`).
4. **Safe Redirect Sanitization**:
   `getSafeRedirectUrl()` validates destination URLs: must start with `/admin`, cannot start with `//` or `/\\`, and cannot contain external hostnames or backslashes, strictly preventing open redirect attacks.

---

## 6. Security Controls

### Brute-Force Rate Limiting
* Monitored per client IP address.
* Maximum **5 failed attempts within 15 minutes**.
* Exceeding threshold triggers a **15-minute lockout** returning HTTP 429 (`RATE_LIMITED`).
* Successful authentication resets failed attempt counters.
* *Architecture note*: The in-memory limiter protects single-instance and node runtimes without external dependencies. For distributed multi-region serverless deployments, an external centralized Redis store (e.g. Upstash) may be connected.

### CSRF Protection
* Server Actions utilize Next.js built-in Origin and Host header verification.
* API Route Handlers verify `Origin` and `Host` headers on state-changing methods (`POST`, `PUT`, `DELETE`).
* `SameSite=Lax` cookie configuration prevents cross-site request embedding.

---

## 7. Administrator Provisioning

Administrator accounts cannot be registered via public forms.

### Interactive Provisioning (Local Development)
```bash
npm run create-admin
```
Prompts for Admin Name, Email, and Password (minimum 8 characters).

### Non-Interactive Provisioning (CI / Cloud Deployment)
```powershell
$env:ADMIN_NAME="Administrator"
$env:ADMIN_EMAIL="admin@shewafashion.com"
$env:ADMIN_PASSWORD="StrongSecurePassword123!"
npm run create-admin
```

Safety:
* Idempotent: If an account with the specified email already exists, no data is overwritten.
* Passwords and raw hashes are never printed in logs or terminal output.

---

## 8. Verification & Test Commands

Run the comprehensive automated test suite (37 tests):
```bash
npm run test:auth
```

Run existing regression suites:
```bash
npm run test:api-response
npm run test:catalog
npm run db:verify
```

Verify TypeScript types and production build:
```bash
npx tsc --noEmit
npm run build
```
