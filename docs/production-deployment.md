# Shewa Fashion — Production Deployment Guide & Checklist

This document provides comprehensive operational guidelines, architectural requirements, and an actionable checklist for deploying **Shewa Fashion** to production.

---

## 1. Architecture & Hosting Requirements

Shewa Fashion is built with **Next.js 16 (Turbopack)**, **React 19**, **Prisma ORM 6**, and **PostgreSQL**.

### Candidate Hosting Providers
- **Application Frontend & Edge/Server Functions**:
  - **Vercel** (Recommended: native Next.js 16 support, Partial Prerendering, Edge proxying)
  - **AWS Amplify / Node.js Container** (Docker / Render / Railway)
- **Database**:
  - **Neon / Supabase / AWS RDS / Prisma Accelerate**: Managed PostgreSQL 15+ with connection pooling (PgBouncer).
- **Object Storage**:
  - **Cloudflare R2** (Recommended: zero egress bandwidth fees, fast S3 compatibility)
  - **AWS S3 + CloudFront**
  - **Vercel Blob**
  - **Cloudinary**

---

## 2. Production Environment Variables Reference

Configure these in your production host's dashboard (e.g. Vercel Project Settings > Environment Variables). **Never commit real secrets to Git.**

| Variable Name | Required | Server / Client | Description / Format |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | Server | PostgreSQL pooled connection string (`postgresql://USER:PASSWORD@HOST:PORT/DB?pgbouncer=true`) |
| `DIRECT_URL` | *Conditional* | Server | Direct non-pooled connection URL (required for Prisma migrations when using PgBouncer) |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Client & Server | Public canonical base URL (e.g., `https://shewafashion.com`) |
| `NODE_ENV` | **Yes** | Client & Server | Set to `production` (enables HSTS, secure cookies) |
| **Storage: Option A (Cloudflare R2 / AWS S3)** | | | |
| `STORAGE_BUCKET` | *Optional* | Server | Name of your storage bucket (e.g. `shewa-fashion-assets`) |
| `STORAGE_REGION` | *Optional* | Server | `auto` for Cloudflare R2, or AWS region (`us-east-1`) |
| `STORAGE_ACCESS_KEY_ID` | *Optional* | Server | S3 / R2 Access Key ID |
| `STORAGE_SECRET_ACCESS_KEY` | *Optional* | Server | S3 / R2 Secret Access Key |
| `STORAGE_ENDPOINT` | *Optional* | Server | Custom endpoint (`https://<account-id>.r2.cloudflarestorage.com`) |
| `STORAGE_PUBLIC_URL` | *Optional* | Server | Public asset delivery CDN domain (`https://cdn.shewafashion.com`) |
| **Storage: Option B (Vercel Blob)** | | | |
| `BLOB_READ_WRITE_TOKEN` | *Optional* | Server | Vercel Blob read/write token |
| **Storage: Option C (Cloudinary)** | | | |
| `CLOUDINARY_CLOUD_NAME` | *Optional* | Server | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | *Optional* | Server | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | *Optional* | Server | Cloudinary API Secret |
| **Operational (Provisioning only)** | | | |
| `ADMIN_NAME` | *Setup only* | Server | Initial admin display name |
| `ADMIN_EMAIL` | *Setup only* | Server | Initial admin login email |
| `ADMIN_PASSWORD` | *Setup only* | Server | Initial admin login password (min. 8 characters) |

---

## 3. Build & Deployment Commands

In your CI/CD pipeline or deployment platform:

### Install Command
```bash
npm ci
```

### Database Migration Command (Run in CI/CD before build or during release step)
```bash
npm run db:deploy
# Equivalent to: npx prisma migrate deploy
```
> [!IMPORTANT]
> **Never run `prisma migrate dev` in production.** `migrate dev` is an interactive command that detects schema drift and can reset database tables. Use `npm run db:deploy` which applies existing, committed migrations safely without prompting.

### Build Command
```bash
npm run db:generate && npm run build
```

### Start Command (Standalone / Container runtime)
```bash
npm run start
```

---

## 4. Pre-Deployment Database Checklist

1. **Verify Existing Migrations**:
   Ensure `prisma/migrations` contains all necessary migration files. Check with:
   ```bash
   npx prisma migrate status
   ```
2. **Connection Pooling vs. Direct URL**:
   If using serverless PostgreSQL (e.g. Neon, Supabase, PgBouncer):
   - Set `DATABASE_URL` to the transaction-pooled URL (port 6543 / pooler).
   - If using `DIRECT_URL`, verify your database credentials support direct sessions for DDL schema migrations.
3. **Automated Database Backups**:
   - Ensure automated daily backups and Point-In-Time-Recovery (PITR) are enabled on your database provider.
   - Take a manual snapshot before executing major schema migrations.
4. **Provision Initial Administrator**:
   Once the database is migrated, provision the primary administrator account using the secure operational CLI:
   ```bash
   ADMIN_NAME="Administrator" ADMIN_EMAIL="admin@shewafashion.com" ADMIN_PASSWORD="<STRONG_PASSWORD>" npm run create-admin
   ```
   Do not commit this password to any repository file.

---

## 5. Image Storage Configuration

Shewa Fashion streams and validates all uploaded media entirely in-memory using magic-byte file signature detection (JPEG, PNG, WebP, AVIF). No local temporary server disk is utilized.

### Cloudflare R2 Setup (Recommended)
1. In the Cloudflare Dashboard, navigate to **R2 Storage** > **Create bucket** (e.g. `shewa-fashion-assets`).
2. Generate an **R2 API Token** with `Object Read & Write` permissions.
3. Under Bucket Settings, enable a **Custom Domain** (e.g. `cdn.shewafashion.com`) or enable the R2 Dev subdomain.
4. Supply:
   - `STORAGE_BUCKET="shewa-fashion-assets"`
   - `STORAGE_REGION="auto"`
   - `STORAGE_ACCESS_KEY_ID="<TOKEN_ACCESS_KEY_ID>"`
   - `STORAGE_SECRET_ACCESS_KEY="<TOKEN_SECRET_KEY>"`
   - `STORAGE_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"`
   - `STORAGE_PUBLIC_URL="https://cdn.shewafashion.com"`

---

## 6. Security & Header Verification

The application enforces multiple defense-in-depth security layers configured in `next.config.ts`, `src/proxy.ts`, `src/lib/session.ts`, and `src/lib/auth.ts`:

- **Content-Security-Policy (CSP)**: Restricts scripts, fonts, frames, and images to allowlisted domains.
- **Strict-Transport-Security (HSTS)**: `max-age=31536000; includeSubDomains` applied automatically in production (`NODE_ENV === 'production'`).
- **Session Tokens**: 32 bytes (256 bits) of entropy stored solely as SHA-256 hashes in PostgreSQL; cookies set with `HttpOnly`, `SameSite: Lax`, and `Secure` in production.
- **CSRF Origin Verification**: Automatically validates matching `Origin`/`Referer` headers on state-changing POST/PUT/DELETE requests.
- **Rate Limiting**: In-memory rate limiting throttles repeated authentication and password modification attempts per IP.

---

## 7. Preview Deployment Testing Strategy

When configuring staging/preview deployments (e.g., Vercel Preview Deployments):
1. **Isolated Preview Database**: Do not connect pull request preview deployments to the production PostgreSQL instance. Use a branching database (such as Neon database branches or Supabase preview branches).
2. **Isolated Storage**: Use a staging bucket or isolated folder namespace to prevent preview tests from polluting production media.
3. **Feature Flagging**: Public routes (`/shop`, `/categories`, `/gallery`) will display seeded or staging catalog items without affecting production store analytics.

---

## 8. Post-Deployment Verification & Smoke Tests

After deploying to production, execute this verification run:

- [ ] **Public Site Availability**: Check `https://<domain>/`, `/shop`, `/categories`, `/collections`, and `/about`.
- [ ] **SSL & Headers**: Verify with `curl -I https://<domain>` that `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and `Content-Security-Policy` are returned.
- [ ] **Admin Authentication**: Navigate to `/admin/login`, log in with the provisioned administrator credentials, and ensure redirection to `/admin`.
- [ ] **Protected Routes**: Verify unauthenticated requests to `/admin/products` automatically redirect to `/admin/login`.
- [ ] **Product Image Upload**: Upload a test product with images, confirm successful upload to object storage, and confirm image display on both admin table and `/shop/[slug]`.
- [ ] **Settings Singleton**: Verify `/admin/settings` displays and updates store information without errors.
- [ ] **Sitemap & Robots**: Verify `https://<domain>/sitemap.xml` and `https://<domain>/robots.txt` resolve with HTTP 200 and correct canonical URLs.

---

## 9. Rollback Plan

If a deployment encounters critical issues:
1. **Application Rollback**:
   - In Vercel or your hosting dashboard, instantly promote the previous successful deployment.
2. **Database Rollback**:
   - Because Prisma migrations are forward-additive, previous deployments remain compatible unless breaking column drops occurred.
   - If a migration must be reverted, restore from the pre-deployment database snapshot or deploy a compensating migration.
