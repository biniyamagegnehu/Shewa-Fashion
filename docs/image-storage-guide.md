# Shewa Fashion — Production Image Storage & Upload Architecture

This guide describes the unified, production-ready image storage architecture for Shewa Fashion (Phase 15).

---

## 1. Architecture Overview

Shewa Fashion uses a single, shared storage service located at `src/lib/storage.ts`. All image upload operations across the platform—**Product images**, **Lookbook Gallery photography**, and **Store Logos**—leverage this service.

```
                           Admin User Form (Next.js App Router)
                       [Product / Gallery / Store Settings Forms]
                                         │
                                         ▼ (Server Action with Session Check)
                       ┌─────────────────────────────────────────┐
                       │       verifyAdminSession() (Auth)       │
                       └─────────────────────────────────────────┘
                                         │
                                         ▼
                       ┌─────────────────────────────────────────┐
                       │    validateImageBuffer() (Magic Bytes)   │
                       │    - JPEG, PNG, WebP, AVIF allowlist    │
                       │    - 5 MB maximum size limit            │
                       │    - Rejects HTML/script disguised files│
                       └─────────────────────────────────────────┘
                                         │
                                         ▼
                       ┌─────────────────────────────────────────┐
                       │   generateSafeStorageKey(ext, folder)   │
                       │   - products/ | gallery/ | settings/    │
                       │   - timestamp + 16-hex random crypto    │
                       │   - Prevents path traversal             │
                       └─────────────────────────────────────────┘
                                         │
                        ┌────────────────┴────────────────┐
                        ▼                                 ▼
             S3-Compatible Object Store             Vercel Blob Storage
            (Cloudflare R2, AWS S3, MinIO)       (BLOB_READ_WRITE_TOKEN)
             - SigV4 authenticated REST API        - REST API upload
             - Zero external SDK bloat             - Direct edge delivery
                        │                                 │
                        └────────────────┬────────────────┘
                                         ▼
                              Stable Public Asset URL
                                         │
                                         ▼
                       ┌─────────────────────────────────────────┐
                       │       Prisma PostgreSQL Mutation        │
                       │       (Compensates on failure)          │
                       └─────────────────────────────────────────┘
```

---

## 2. Supported Storage Providers

### Provider A: Cloudflare R2 (Recommended for Production)
- **Advantages:** Zero egress fees, high performance, global CDN integration, and full S3 API compatibility.
- **Account Setup:**
  1. Sign in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
  2. In the left navigation, select **R2 Storage** and click **Create bucket**.
  3. Name the bucket (e.g. `shewa-fashion-assets`).
  4. Under bucket **Settings**, configure **Public Access** (either enable R2.dev subdomain or connect a custom domain like `images.shewafashion.com`).
  5. Under **R2 > Manage R2 API Tokens**, click **Create API token**.
     - Permissions: **Object Read & Write**.
     - Copy the **Access Key ID**, **Secret Access Key**, and **Jurisdiction-specific endpoint**.
  6. Add to `.env.local`:
     ```env
     STORAGE_BUCKET="shewa-fashion-assets"
     STORAGE_REGION="auto"
     STORAGE_ACCESS_KEY_ID="<your-cloudflare-r2-access-key-id>"
     STORAGE_SECRET_ACCESS_KEY="<your-cloudflare-r2-secret-access-key>"
     STORAGE_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
     STORAGE_PUBLIC_URL="https://images.shewafashion.com" # or https://pub-<hash>.r2.dev
     ```

### Provider B: AWS S3
- **Account Setup:**
  1. In the AWS Management Console, navigate to **S3** and click **Create bucket**.
  2. Uncheck "Block all public access" if serving directly, or configure a **CloudFront distribution** pointing to the bucket (best practice).
  3. In **IAM**, create an IAM user with `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` permissions for the bucket.
  4. Generate access keys and configure in `.env.local`:
     ```env
     STORAGE_BUCKET="shewa-fashion-assets"
     STORAGE_REGION="us-east-1" # or your chosen AWS region
     STORAGE_ACCESS_KEY_ID="AKIA..."
     STORAGE_SECRET_ACCESS_KEY="..."
     STORAGE_ENDPOINT="" # Leave empty for AWS S3
     STORAGE_PUBLIC_URL="https://<distribution-id>.cloudfront.net" # or leave blank
     ```

### Provider C: MinIO (Local Development / Self-Hosted)
- Start a local MinIO server:
  ```bash
  docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
  ```
- Configure in `.env.local`:
  ```env
  STORAGE_BUCKET="shewa-fashion"
  STORAGE_REGION="us-east-1"
  STORAGE_ACCESS_KEY_ID="minioadmin"
  STORAGE_SECRET_ACCESS_KEY="minioadmin"
  STORAGE_ENDPOINT="http://localhost:9000"
  STORAGE_PUBLIC_URL="http://localhost:9000/shewa-fashion"
  ```

### Provider D: Vercel Blob
- If deploying Shewa Fashion on Vercel:
  1. In the Vercel Dashboard, navigate to **Storage > Create Database > Blob**.
  2. Connect the store to your project.
  3. The `BLOB_READ_WRITE_TOKEN` environment variable will automatically be populated.
     ```env
     BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
     ```

### Provider E: Cloudinary (Fastest Setup & 25 GB Free Tier)
- **Advantages:** Developer-friendly, generous free tier (25 GB), automatic WebP/AVIF format optimization, and global CDN delivery without configuring AWS IAM or S3 buckets.
- **Account Setup:**
  1. Create a free account at [Cloudinary.com](https://cloudinary.com/).
  2. Open your [Cloudinary Dashboard](https://cloudinary.com/console).
  3. Under **Product Environment Credentials**, copy your:
     - **Cloud Name**
     - **API Key**
     - **API Secret**
  4. Add them to `.env.local`:
     ```env
     CLOUDINARY_CLOUD_NAME="your-cloud-name"
     CLOUDINARY_API_KEY="your-api-key"
     CLOUDINARY_API_SECRET="your-api-secret"
     ```
  5. That's it! When these 3 variables are present, Shewa Fashion routes image uploads and safe deletions through Cloudinary automatically. Next.js image optimization is pre-configured to accept `res.cloudinary.com`.

---

## 3. Security Safeguards

1. **Server-Side Authorization Required:**
   - Every upload is executed via Next.js Server Actions with server-side administrator authorization (`verifyAdminSession()`). Unauthenticated requests are rejected immediately.
2. **File Content & Magic Byte Inspection:**
   - Browsers and user clients can spoof MIME types and file extensions.
   - Shewa Fashion inspects the first 12+ bytes (magic numbers) of the actual file buffer:
     - `JPEG`: `FF D8 FF`
     - `PNG`: `89 50 4E 47 0D 0A 1A 0A`
     - `WebP`: `RIFF ... WEBP`
     - `AVIF`: `ftyp` box with `avif` or `avis` brand
   - Text files, HTML, PHP, shell scripts, and corrupted files disguised with an `.jpg` extension are rejected immediately.
3. **5 MB File Size Limit:**
   - Server enforces `MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024` (5 MB).
   - Next.js server actions are configured with `bodySizeLimit: '6mb'` in `next.config.ts`.
4. **Safe Cryptographic Storage Keys:**
   - Client filenames are never used.
   - Storage keys are generated using `randomBytes(8).toString('hex')` inside isolated folder namespaces (`products/`, `gallery/`, `settings/`).
   - Prevents path traversal (`../`) and file overwrite collision attacks.
5. **No Secrets Exposed to Client:**
   - All S3 credentials and tokens are kept in server environment variables.
   - Client bundles never receive AWS or Cloudflare credentials.

---

## 4. File Lifecycle & Cross-Model Sharing Protection

### Safe Replacement & Compensating Transactions
When an admin replaces an image or uploads a new product:
1. The new image is uploaded to cloud storage first.
2. The database transaction is executed.
3. If the database mutation fails or is aborted, the newly uploaded image is deleted automatically (compensating transaction) so orphaned files do not accumulate.
4. When a product or gallery item is updated with a replacement image, the previous image is deleted from storage **only if it is not referenced elsewhere**.

### Cross-Model Reference Safety (`isImageShared`)
Before deleting any asset from object storage:
- `isImageShared(imageUrl)` queries:
  1. `prisma.productImage.count({ where: { url: imageUrl } })`
  2. `prisma.galleryItem.count({ where: { imageUrl } })`
  3. `prisma.storeSettings.count({ where: { logoUrl: imageUrl } })`
- If the image is shared by another product, a lookbook item, or the store logo, it is preserved in storage.
- Local static assets (e.g. `/images/...`), Unsplash photography, and localhost URLs are never deleted.

---

## 5. Next.js Image Optimization

`next.config.ts` configures `images.remotePatterns` for:
- AWS S3 (`**.s3.amazonaws.com`, `**.s3.*.amazonaws.com`)
- Cloudflare R2 (`**.r2.cloudflarestorage.com`, `**.r2.dev`)
- Vercel Blob (`**.public.blob.vercel-storage.com`, `blob.vercel-storage.com`)
- Unsplash (`images.unsplash.com`)
- Any dynamic custom domain set in `STORAGE_PUBLIC_URL` or `STORAGE_ENDPOINT`.

Client-side image previews generated via `URL.createObjectURL(file)` utilize the `unoptimized` prop to prevent Next.js image optimizer errors on browser `blob:` schemes.
