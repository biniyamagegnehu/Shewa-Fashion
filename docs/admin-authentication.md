# Shewa Fashion — Secure Administrator Authentication

## Architecture Overview

Shewa Fashion uses a multi-layered, server-verified authentication system built with Next.js 16.4 App Router, TypeScript, PostgreSQL, and Prisma ORM.

Public storefront routes and administrator portals are strictly isolated. Authentication credentials and session secrets are never exposed to client-side bundles or browser storage.

---

## Key Security Design Decisions

### 1. Database-Backed Role Verification
* Administrator status is verified against PostgreSQL (`User` model, `role: ADMIN`) on the server at every data access and page rendering boundary.
* Client-supplied roles, IDs, or tokens are never trusted.
* Accounts with non-admin roles (e.g. `EDITOR`) are rejected from administrative endpoints.

### 2. Password Hashing (Bcrypt Cost 12)
* Passwords are never stored in plaintext.
* Hashing utilizes `bcryptjs` with 12 salt rounds (computationally resistant to brute-force attacks).
* Generic error messages are returned for authentication failures ("Invalid email or password").
* Timing attack mitigation: when an email does not exist in the database, a constant-time comparison against a pre-computed dummy hash is performed to ensure consistent response latency.

### 3. Server-Managed Session Tokens
* Strategy: Cryptographically signed JWT using `jose` with HS256 and a 256-bit secret (`SESSION_SECRET`).
* Cookie configuration:
  * **Name**: `shewa_admin_session`
  * **Path**: `/admin` (prevents cookie transmission on public `/shop`, `/categories`, etc.)
  * **HttpOnly**: `true` (inaccessible to JavaScript, immune to XSS token theft)
  * **SameSite**: `lax` (CSRF defense)
  * **Secure**: `true` in production environments
  * **MaxAge**: 8 hours (28,800 seconds)
* Token invalidation: logging out clears the cookie (`maxAge: 0`, `expires: epoch`) and terminates the session immediately.

### 4. Defense-in-Depth Protection Boundaries
1. **Next.js 16.4 Proxy (`src/proxy.ts`)**:
   Runs optimistically before route rendering on `/admin/*`. Inspects the session cookie and redirects unauthenticated visitors to `/admin/login`. Redirects authenticated admins visiting `/admin/login` directly to `/admin`.
2. **Server Component & Action Guards (`src/lib/auth.ts`)**:
   `requireAdminSession()` and `verifyAdminSession()` query the database directly to confirm the user exists and holds the `ADMIN` role. This guarantees that even if a cookie is crafted or an account's role is revoked, unauthorized access is blocked.

### 5. In-Memory Login Rate Limiting
* Brute-force protection limits failed login attempts to **5 attempts per 15 minutes** per client IP address.
* After 5 failed attempts, the IP is locked out with a remaining cooldown timer.
* Successful login resets the counter for that IP.
* *Limitation*: In-memory rate limiting is process-bound. In multi-region serverless deployments, rate limiting state is local to each runtime instance. For distributed production architectures, a centralized Redis store (Upstash/Redis) can be integrated.

---

## Administrator Provisioning

Administrator accounts are never registered through public web forms. Provisioning is performed through a restricted server-side script.

### 1. Interactive Provisioning (Recommended for Local Dev)

Run the script interactively from the terminal:

```bash
npm run create-admin
```

The script will prompt for:
* **Admin Name** (e.g., `Biniyam`)
* **Admin Email** (e.g., `admin@shewafashion.com`)
* **Admin Password** (minimum 12 characters)

### 2. Non-Interactive Provisioning (CI / Cloud Deployment)

Set environment variables before invoking:

```powershell
$env:ADMIN_NAME="Biniyam"
$env:ADMIN_EMAIL="admin@shewafashion.com"
$env:ADMIN_PASSWORD="StrongSecurePassword123!"
npm run create-admin
```

Or on Linux / macOS:

```bash
ADMIN_NAME="Biniyam" ADMIN_EMAIL="admin@shewafashion.com" ADMIN_PASSWORD="StrongSecurePassword123!" npm run create-admin
```

### Safety & Idempotency
* If an account with the provided email already exists, the script reports that the user is present and exits cleanly **without modifying** the existing record.
* Passwords and hashes are never displayed in output logs.

---

## Environment Variables

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/shewa_fashion` |
| `SESSION_SECRET` | Yes | Base64 or 32+ char secret for JWT signing | `openssl rand -base64 32` |

---

## Route Overview

| Path | Access | Behavior |
| :--- | :--- | :--- |
| `/admin/login` | Public (Unauthenticated) | Brand-aligned login card. Redirects to `/admin` if already signed in. |
| `/admin` | Protected (ADMIN role only) | Management portal placeholder. Redirects to `/admin/login` if unauthenticated or non-admin. |
| `/admin/*` | Protected (ADMIN role only) | All future admin sub-routes. |
