# Shewa Fashion — Authentication Architecture

> **Status:** Design documentation for Phase 10.  
> Authentication is **not yet fully implemented** in the sense described below.
> The current codebase contains a working JWT-based session implementation
> (see [`src/lib/session.ts`](../src/lib/session.ts) and [`src/lib/auth.ts`](../src/lib/auth.ts)).
> This document records the agreed design, explains the chosen trade-offs, and
> records what must be revisited or extended during Phase 10.

---

## 1. Chosen Authentication Strategy

Shewa Fashion uses **cookie-based server sessions**.

The browser receives a random session identifier through a server-set cookie.
The server is responsible for creating, validating, rotating, and expiring sessions.

### Why not JWT access + refresh tokens?

JWT-based access/refresh token schemes are designed for **distributed clients**
(e.g. mobile apps, cross-origin SPAs, third-party API consumers).

Shewa Fashion's only planned client is the **same-origin Next.js website**.
For this topology, cookie-based sessions are simpler, more auditable, and reduce
the attack surface:

- No token storage in `localStorage` (vulnerable to XSS exfiltration).
- No client-side token validation (can be bypassed).
- Immediate revocation: invalidating a session server-side takes effect on the
  next request — no waiting for an access token to expire.
- Fewer moving parts = fewer opportunities for implementation errors.

---

## 2. Current Implementation

### Session token mechanism

`src/lib/session.ts` currently implements sessions as **HS256-signed JWTs**
stored in an `HttpOnly` cookie. The JWT payload contains `userId` and `role`,
signed with `SESSION_SECRET`.

`src/lib/auth.ts` provides:
- `verifyAdminSession()` — reads the cookie, verifies the JWT, then queries
  the database to confirm the user exists and holds the `ADMIN` role.
- `requireAdminSession()` — calls `verifyAdminSession()` and redirects to
  `/admin/login` if the result is `null`.

`src/proxy.ts` provides an optimistic route-level guard that inspects the
JWT before rendering, redirecting unauthenticated visitors early.

### Important limitation of the current approach

The current implementation stores session data **inside the JWT** rather than
in the database. This means:

- **Sessions cannot be individually revoked** before the JWT's `exp` claim
  expires. If an admin account is compromised or a password is changed,
  existing tokens remain valid until expiry.
- An 8-hour `maxAge` limits the blast radius, but this is not true server-side
  session invalidation.

Phase 10 must decide whether to keep JWT-in-cookie sessions or migrate to
opaque token + database-backed sessions as described below.

---

## 3. Planned Phase 10 Session Lifecycle

The following describes the **target** design for Phase 10. Implement it after
reviewing the actual schema, verifying Prisma compatibility, and running
migrations.

### Login flow

1. The admin submits credentials over HTTPS.
2. The server validates input (email format, presence of password) using
   `src/lib/validation.ts`.
3. The server queries `users` by email, compares the submitted password
   against `passwordHash` using `bcryptjs.compare()`.
4. If credentials are invalid (any combination of wrong email, wrong
   password, non-ADMIN role), the server returns a generic failure message
   to prevent user enumeration. A constant-time dummy hash comparison is
   performed when the email is not found to prevent timing-based enumeration.
5. On success:
   a. Generate a **cryptographically secure random session token**
      using `crypto.randomBytes(32)` (or `crypto.getRandomValues()`).
   b. Store a **hash of the token** (e.g. SHA-256) plus session metadata in
      a `sessions` table in PostgreSQL. Never store the raw token in the DB.
   c. Set the **raw token** in an `HttpOnly` cookie. Never return it in the
      JSON body.
6. Return a redirect or success response. The admin is now authenticated.

### Authenticated request flow

1. The browser sends the session cookie automatically on same-origin requests.
2. The server reads the cookie value (raw token).
3. The server computes the token hash and queries the `sessions` table.
4. The server verifies:
   - The session record exists.
   - The session has not expired (both idle timeout and absolute lifetime).
   - The associated `userId` exists in `users` with `role = ADMIN`.
5. If all checks pass, the request proceeds. If any check fails, the server
   deletes the cookie and redirects to `/admin/login`.
6. On activity, update `lastAccessedAt` to extend the idle timeout window.

### Logout flow

1. The server deletes the session record from the database.
2. The server clears the session cookie (`maxAge: 0`, `expires: epoch`).
3. The admin is redirected to `/admin/login`.

### Password change / security events

- On password change, all existing sessions for that user must be revoked
  (DELETE all session records for `userId`).
- On account deactivation or role change, revoke all sessions immediately.

---

## 4. Cookie Policy

### Intended production settings

| Attribute | Value | Rationale |
|---|---|---|
| `HttpOnly` | `true` | Prevents JavaScript access; immune to XSS token theft |
| `Secure` | `true` (production) | Transmit only over HTTPS |
| `SameSite` | `Lax` | Balanced CSRF protection; allows top-level navigations |
| `Path` | `/admin` | Cookie is not sent on public storefront requests |
| `Domain` | *(omitted)* | Use host-only binding; avoid cross-subdomain leakage |
| `MaxAge` | Session lifetime | Cookie expires with session |

### `__Host-` prefix consideration

The `__Host-` cookie prefix enforces that a cookie:
- Is set with `Secure`.
- Has `Path=/`.
- Has no `Domain` attribute.

If the cookie `Path` is changed to `/` (rather than `/admin`), the
`__Host-` prefix should be adopted. Currently `Path=/admin` is used to
restrict the cookie to admin routes, which is incompatible with `__Host-`
(which requires `Path=/`). Review this trade-off in Phase 10.

### Cookie protections are not sufficient alone

- **CSRF:** `SameSite=Lax` reduces most CSRF risk but is not a complete
  defence. For state-changing admin endpoints, add an explicit CSRF token or
  use the `SameSite=Strict` setting.
- **XSS:** `HttpOnly` prevents token theft via XSS, but XSS can still
  perform authenticated actions on behalf of the user. Maintain a strict
  Content Security Policy and sanitise all rendered output.

---

## 5. Session Lifetime Policy

| Parameter | Initial Value | Notes |
|---|---|---|
| Idle timeout | 30 minutes | Server resets a `lastAccessedAt` timestamp on each valid request |
| Absolute lifetime | 7 days | Session expires regardless of activity after 7 days |
| Token rotation | On login; on password change | Issue a new token; revoke the old one |
| Logout invalidation | Immediate | Delete session record; clear cookie |
| Security events | Immediate revocation | Password change, role change, deactivation |

### Idle timeout requires server-side management

Setting a cookie `maxAge` of 7 days does **not** implement a 30-minute idle
timeout. The cookie will persist in the browser for 7 days regardless of
inactivity.

A genuine idle timeout requires:
1. Storing `lastAccessedAt` (or `expiresAt` calculated from last access) in
   the session record.
2. Updating it on each authenticated request.
3. Rejecting requests where `now > lastAccessedAt + idleDuration`.

The current JWT-in-cookie implementation has an 8-hour absolute expiry but no
idle timeout. Phase 10 must address this when migrating to opaque sessions.

---

## 6. Authorization Policy

Authentication establishes **who** is making a request.
Authorization determines **what** that identity is permitted to do.

### Principles

1. **Server-side enforcement is mandatory.** Admin role is verified by querying
   the `users` table on every protected route handler, Server Component, and
   Server Action. The cookie and any claims it carries are untrusted inputs.

2. **UI is not authorization.** Hiding a button, link, or page section from
   the browser is a UX decision, not a security control. An attacker can bypass
   any client-side check. Every protected data operation is protected on the
   server independently of the UI.

3. **Least privilege.** Future roles (e.g. `EDITOR`) must be restricted to the
   operations they are permitted to perform. A verified `ADMIN` role is required
   for all current admin routes. Do not elevate an `EDITOR` to admin operations
   without explicit schema and policy changes.

4. **Defence in depth.** Three independent layers enforce authorization:
   - `src/proxy.ts` — optimistic early redirect (stateless JWT check).
   - `requireAdminSession()` in Server Components — database role verification.
   - Individual Route Handlers and Server Actions — operation-level checks.

5. **No client role flags.** Do not read a `role` field from a request body,
   URL parameter, or `localStorage` to make authorization decisions.

---

## 7. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | ≥ 32-character secret for signing/HMAC |

Generate `SESSION_SECRET` with:
```bash
openssl rand -base64 32
```

Never commit real secrets to version control. Use `.env.local` locally and
the deployment platform's secret manager in production.

---

## 8. API and Next.js Architectural Conventions

### When to use each mechanism

| Mechanism | Purpose | Notes |
|---|---|---|
| **Route Handlers** (`route.ts`) | JSON endpoints for external callers or AJAX | Use `src/lib/api-response.ts` helpers |
| **Server Components** | Direct server-side data access; page rendering | Import `src/lib/products.ts` etc. directly; no HTTP round-trip |
| **Server Actions** | Form mutations with server validation | Use typed `ActionResult` objects; not HTTP JSON responses |
| **Shared server modules** | Reusable business logic, DB access, auth | `src/lib/` — import with `import 'server-only'` where appropriate |

### Do not make internal HTTP requests

Server Components and Server Actions should import shared server modules
directly. Making `fetch()` calls to the same Next.js application wastes a
network round-trip, bypasses type safety, and can cause circular dependency
issues in the build.

### Proposed future folder structure (do not create empty dirs)

```
src/
  lib/
    api-response.ts     ← Response envelope helpers (Route Handlers only)
    validation.ts       ← Server-side input validation utilities
    auth.ts             ← Session verification and admin guards
    session.ts          ← Cookie session lifecycle
    products.ts         ← Catalogue data access layer
    prisma.ts           ← Prisma client singleton
    utils.ts            ← Generic formatting utilities
  app/
    api/                ← Future Route Handlers (JSON endpoints)
    admin/              ← Protected admin pages and layouts
    actions/            ← Server Actions (mutations)
  components/
    admin/              ← Admin-specific UI components
    ui/                 ← Shared UI primitives
```

---

## 9. Administrator Provisioning

Admin accounts are never created through public registration forms.
Use the restricted server-side script:

```bash
npm run create-admin
```

Or non-interactively:

```powershell
$env:ADMIN_NAME="Biniyam"
$env:ADMIN_EMAIL="admin@shewafashion.com"
$env:ADMIN_PASSWORD="StrongSecurePassword123!"
npm run create-admin
```

The script prevents duplicate accounts and never logs passwords.

---

## 10. Related Files

| File | Purpose |
|---|---|
| [`src/lib/session.ts`](../src/lib/session.ts) | JWT session lifecycle (current implementation) |
| [`src/lib/auth.ts`](../src/lib/auth.ts) | Admin session verification; rate limiter |
| [`src/lib/api-response.ts`](../src/lib/api-response.ts) | JSON API response envelope |
| [`src/lib/validation.ts`](../src/lib/validation.ts) | Input validation utilities |
| [`src/proxy.ts`](../src/proxy.ts) | Middleware route guard |
| [`src/app/actions/auth.ts`](../src/app/actions/auth.ts) | Login / logout Server Actions |
| [`scripts/create-admin.ts`](../scripts/create-admin.ts) | Admin provisioning script |
| [`scripts/test-auth.ts`](../scripts/test-auth.ts) | Auth integration test suite |
| [`prisma/schema.prisma`](../prisma/schema.prisma) | Database schema |
