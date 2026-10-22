/**
 * Shewa Fashion — Production Object Storage & Image Validation Module
 *
 * Implements:
 * 1. Server-side file validation (magic byte content inspection, size limits, format allowlist)
 * 2. S3-compatible object storage integration (AWS S3, Cloudflare R2, MinIO, etc.) using SigV4
 * 3. Support for Vercel Blob storage (BLOB_READ_WRITE_TOKEN)
 * 4. Safe key generation (never trust client paths)
 * 5. Safe file deletion and cleanup compensation
 */

import { createHash, createHmac, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export interface StorageConfig {
  bucket?: string
  region?: string
  accessKeyId?: string
  secretAccessKey?: string
  endpoint?: string
  publicUrl?: string
  blobToken?: string
  cloudinaryCloudName?: string
  cloudinaryApiKey?: string
  cloudinaryApiSecret?: string
}

export interface ImageValidationResult {
  ok: boolean
  mime?: string
  ext?: string
  error?: string
}

export interface UploadResult {
  ok: boolean
  url?: string
  key?: string
  error?: string
}

/**
 * Inspect file buffer signatures (magic bytes) to verify actual image content
 * rather than trusting user-provided MIME types or file extensions.
 */
export function detectImageSignature(buf: Buffer): { mime: string; ext: string } | null {
  if (!buf || buf.length < 12) {
    return null
  }

  // 1. JPEG / JPG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' }
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' }
  }

  // 3. WebP: RIFF ... WEBP (bytes 0-3 = "RIFF", bytes 8-11 = "WEBP")
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mime: 'image/webp', ext: 'webp' }
  }

  // 4. AVIF: bytes 4-8 = "ftyp" and bytes 8-12 start with "avif" or "avis"
  if (
    buf.subarray(4, 8).toString('ascii') === 'ftyp' &&
    (buf.subarray(8, 12).toString('ascii').startsWith('avif') ||
      buf.subarray(8, 12).toString('ascii').startsWith('avis'))
  ) {
    return { mime: 'image/avif', ext: 'avif' }
  }

  // 5. GIF: GIF87a or GIF89a (optional image format)
  if (buf.subarray(0, 3).toString('ascii') === 'GIF') {
    return { mime: 'image/gif', ext: 'gif' }
  }

  return null
}

/**
 * Validate image buffer size and verified MIME type against allowlist.
 */
export function validateImageBuffer(buffer: Buffer): ImageValidationResult {
  if (!buffer || buffer.length === 0) {
    return { ok: false, error: 'Product image file is required and cannot be empty.' }
  }

  if (buffer.length > MAX_IMAGE_FILE_SIZE) {
    const sizeInMb = (buffer.length / (1024 * 1024)).toFixed(1)
    return {
      ok: false,
      error: `Image file size (${sizeInMb} MB) exceeds the maximum allowed limit of 5 MB.`,
    }
  }

  const detected = detectImageSignature(buffer)
  if (!detected) {
    return {
      ok: false,
      error:
        'Invalid image format or corrupted file. Supported formats are JPEG, PNG, WebP, and AVIF.',
    }
  }

  return { ok: true, mime: detected.mime, ext: detected.ext }
}

/**
 * Check if a storage provider is properly configured via environment variables.
 */
export function getStorageConfig(): StorageConfig {
  return {
    bucket: process.env.STORAGE_BUCKET,
    region: process.env.STORAGE_REGION || 'auto',
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    endpoint: process.env.STORAGE_ENDPOINT,
    publicUrl: process.env.STORAGE_PUBLIC_URL,
    blobToken: process.env.BLOB_READ_WRITE_TOKEN,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  }
}

export function isStorageConfigured(): boolean {
  const cfg = getStorageConfig()
  const hasS3 = Boolean(cfg.bucket && cfg.accessKeyId && cfg.secretAccessKey)
  const hasBlob = Boolean(cfg.blobToken)
  const hasCloudinary = Boolean(
    cfg.cloudinaryCloudName && cfg.cloudinaryApiKey && cfg.cloudinaryApiSecret
  )
  return hasS3 || hasBlob || hasCloudinary
}

/**
 * Generate a safe, cryptographically unique storage key.
 * Never uses raw client filenames to prevent path traversal or collision attacks.
 */
export function generateSafeStorageKey(ext: string, folder: string = 'products'): string {
  const timestamp = Date.now()
  const random = randomBytes(8).toString('hex')
  const cleanExt = ext.replace(/^\./, '').toLowerCase()
  const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'products'
  return `${cleanFolder}/${timestamp}-${random}.${cleanExt}`
}

/**
 * AWS Signature Version 4 helper for S3-compatible REST API.
 */
function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex')
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest()
}

function getSigV4Key(secretKey: string, date: string, region: string, service: string): Buffer {
  const kDate = hmac('AWS4' + secretKey, date)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  return hmac(kService, 'aws4_request')
}

/**
 * Upload an image buffer to S3 / Cloudflare R2 using standard SigV4.
 */
async function uploadToS3(
  buffer: Buffer,
  key: string,
  mime: string,
  config: StorageConfig
): Promise<UploadResult> {
  const { bucket, region = 'auto', accessKeyId, secretAccessKey, endpoint, publicUrl } = config
  if (!bucket || !accessKeyId || !secretAccessKey) {
    return { ok: false, error: 'S3 storage credentials are not properly configured.' }
  }

  try {
    const rawHost = endpoint
      ? new URL(endpoint).host
      : `${bucket}.s3.${region === 'auto' ? 'us-east-1' : region}.amazonaws.com`
    const isCustomEndpoint = Boolean(endpoint)
    const host = isCustomEndpoint ? rawHost : `${bucket}.s3.${region === 'auto' ? 'us-east-1' : region}.amazonaws.com`

    // Determine path
    const requestPath = isCustomEndpoint ? `/${bucket}/${key}` : `/${key}`
    const fullUrl = isCustomEndpoint
      ? `${endpoint!.replace(/\/$/, '')}/${bucket}/${key}`
      : `https://${host}/${key}`

    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.substring(0, 8)
    const payloadHash = sha256(buffer)

    const canonicalHeaders = `host:${rawHost}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'

    const canonicalRequest = [
      'PUT',
      requestPath,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n')

    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      sha256(canonicalRequest),
    ].join('\n')

    const signingKey = getSigV4Key(secretAccessKey, dateStamp, region, 's3')
    const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')

    const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    const res = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        Host: rawHost,
        'Content-Type': mime,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        Authorization: authHeader,
      },
      body: new Uint8Array(buffer),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('Storage upload failed with status:', res.status, errText)
      return { ok: false, error: `Storage upload failed with HTTP status ${res.status}.` }
    }

    // Determine public URL for stored image
    let finalUrl = fullUrl
    if (publicUrl) {
      finalUrl = `${publicUrl.replace(/\/$/, '')}/${key}`
    }

    return { ok: true, url: finalUrl, key }
  } catch (err) {
    console.error('Unexpected error during S3 upload:', err)
    return { ok: false, error: 'Failed to connect to image storage provider.' }
  }
}

/**
 * Upload an image buffer to Vercel Blob (if configured).
 */
async function uploadToBlob(
  buffer: Buffer,
  key: string,
  mime: string,
  token: string
): Promise<UploadResult> {
  try {
    const res = await fetch(`https://blob.vercel-storage.com/${key}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-content-type': mime,
        'x-add-random-suffix': 'false',
      },
      body: new Uint8Array(buffer),
    })

    if (!res.ok) {
      return { ok: false, error: `Blob storage upload failed with status ${res.status}.` }
    }

    const data = await res.json()
    return { ok: true, url: data.url, key }
  } catch (err) {
    console.error('Blob upload error:', err)
    return { ok: false, error: 'Failed to upload to Vercel Blob storage.' }
  }
}

/**
 * Upload an image buffer to Cloudinary using their signed REST API.
 */
async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  mime: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<UploadResult> {
  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const random = randomBytes(8).toString('hex')
    const publicId = `${timestamp}-${random}`
    const fullFolder = `shewa-fashion/${folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'products'}`

    // Cloudinary signature requires parameters to be sorted alphabetically:
    // folder=...&public_id=...&timestamp=...<api_secret>
    const stringToSign = `folder=${fullFolder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    const signature = createHash('sha1').update(stringToSign).digest('hex')

    const formData = new FormData()
    const blob = new Blob([new Uint8Array(buffer)], { type: mime })
    formData.append('file', blob, `${publicId}.${mime.split('/')[1] || 'jpg'}`)
    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('folder', fullFolder)
    formData.append('public_id', publicId)
    formData.append('signature', signature)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('Cloudinary upload failed with status:', res.status, errText)
      return { ok: false, error: `Cloudinary upload failed with status ${res.status}.` }
    }

    const data = await res.json()
    return {
      ok: true,
      url: data.secure_url || data.url,
      key: data.public_id,
    }
  } catch (err) {
    console.error('Unexpected error during Cloudinary upload:', err)
    return { ok: false, error: 'Failed to connect to Cloudinary storage service.' }
  }
}

/**
 * Main server-side upload entry point with folder namespacing.
 * Validates file content, enforces allowlists, and persists to configured storage.
 */
export async function uploadImage(
  fileOrBuffer: Buffer | ArrayBuffer | Uint8Array,
  folder: string = 'products'
): Promise<UploadResult> {
  const buffer = Buffer.isBuffer(fileOrBuffer)
    ? fileOrBuffer
    : Buffer.from(fileOrBuffer as ArrayBuffer)

  // 1. Content and Magic Byte Validation
  const validation = validateImageBuffer(buffer)
  if (!validation.ok) {
    return { ok: false, error: validation.error }
  }

  // 2. Storage Provider Configuration Check
  const config = getStorageConfig()
  if (!isStorageConfigured()) {
    return {
      ok: false,
      error:
        'Image storage is not configured. Please configure Cloudinary, AWS S3, Cloudflare R2, or Vercel Blob credentials in .env.local to enable image uploads.',
    }
  }

  // 3. Generate Safe Storage Key
  const key = generateSafeStorageKey(validation.ext!, folder)

  // 4. Upload to Configured Provider (Cloudinary -> Vercel Blob -> S3/R2)
  if (config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret) {
    return uploadToCloudinary(
      buffer,
      folder,
      validation.mime!,
      config.cloudinaryCloudName,
      config.cloudinaryApiKey,
      config.cloudinaryApiSecret
    )
  }

  if (config.blobToken) {
    return uploadToBlob(buffer, key, validation.mime!, config.blobToken)
  }

  return uploadToS3(buffer, key, validation.mime!, config)
}

/**
 * Upload a product image (stored in products/ namespace).
 */
export async function uploadProductImage(
  fileOrBuffer: Buffer | ArrayBuffer | Uint8Array
): Promise<UploadResult> {
  return uploadImage(fileOrBuffer, 'products')
}

/**
 * Upload a gallery lookbook image (stored in gallery/ namespace).
 */
export async function uploadGalleryImage(
  fileOrBuffer: Buffer | ArrayBuffer | Uint8Array
): Promise<UploadResult> {
  return uploadImage(fileOrBuffer, 'gallery')
}

/**
 * Upload a store settings image / logo (stored in settings/ namespace).
 */
export async function uploadSettingsImage(
  fileOrBuffer: Buffer | ArrayBuffer | Uint8Array
): Promise<UploadResult> {
  return uploadImage(fileOrBuffer, 'settings')
}

/**
 * Check if an image URL is currently referenced by other products, gallery items, or store settings.
 * Prevents accidentally deleting images that are shared.
 */
export async function isImageShared(
  imageUrl: string,
  excludeGalleryItemId?: string
): Promise<boolean> {
  if (!imageUrl) return false
  try {
    const [productCount, galleryCount, settingsCount] = await Promise.all([
      prisma.productImage.count({ where: { url: imageUrl } }),
      prisma.galleryItem.count({
        where: {
          imageUrl,
          ...(excludeGalleryItemId ? { id: { not: excludeGalleryItemId } } : {}),
        },
      }),
      prisma.storeSettings.count({ where: { logoUrl: imageUrl } }),
    ])
    return productCount + galleryCount + settingsCount > 0
  } catch (err) {
    console.error('Error checking if image is shared:', err)
    return true // fail-safe: assume shared to prevent accidental deletion
  }
}

/**
 * Delete a stored image from cloud storage safely.
 * Only deletes keys within recognized namespaces (products/, gallery/, settings/).
 */
export async function deleteStoredImage(
  imageUrlOrKey: string,
  allowedPrefixes: string[] = ['products/', 'gallery/', 'settings/']
): Promise<boolean> {
  if (!imageUrlOrKey || !isStorageConfigured()) {
    return false
  }

  // Do not delete local demo/seed assets or external unsplash assets
  if (
    imageUrlOrKey.startsWith('/images/') ||
    imageUrlOrKey.includes('images.unsplash.com') ||
    imageUrlOrKey.startsWith('http://localhost')
  ) {
    return false
  }

  const config = getStorageConfig()

  // 1. Cloudinary asset deletion
  if (
    imageUrlOrKey.includes('res.cloudinary.com') ||
    imageUrlOrKey.startsWith('shewa-fashion/')
  ) {
    if (config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret) {
      try {
        let publicId = imageUrlOrKey
        if (imageUrlOrKey.startsWith('http://') || imageUrlOrKey.startsWith('https://')) {
          const parsed = new URL(imageUrlOrKey)
          const match = parsed.pathname.match(
            /\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/
          )
          if (match && match[1]) {
            publicId = match[1]
          }
        } else {
          publicId = publicId.replace(/\.[a-zA-Z0-9]+$/, '')
        }

        const strippedFolder = publicId.replace(/^shewa-fashion\//, '')
        if (!allowedPrefixes.some((prefix) => strippedFolder.startsWith(prefix))) {
          return false
        }

        const timestamp = Math.floor(Date.now() / 1000)
        const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${config.cloudinaryApiSecret}`
        const signature = createHash('sha1').update(stringToSign).digest('hex')

        const formData = new FormData()
        formData.append('public_id', publicId)
        formData.append('api_key', config.cloudinaryApiKey)
        formData.append('timestamp', String(timestamp))
        formData.append('signature', signature)

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/destroy`,
          {
            method: 'POST',
            body: formData,
          }
        )

        return res.ok
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err)
        return false
      }
    }
    return false
  }

  // Extract storage key from URL
  let key = imageUrlOrKey
  if (imageUrlOrKey.startsWith('http://') || imageUrlOrKey.startsWith('https://')) {
    try {
      const parsed = new URL(imageUrlOrKey)
      const pathname = parsed.pathname.replace(/^\//, '')
      // If pathname starts with bucket name, strip it
      if (config.bucket && pathname.startsWith(`${config.bucket}/`)) {
        key = pathname.slice(config.bucket.length + 1)
      } else {
        key = pathname
      }
    } catch {
      return false
    }
  }

  if (!allowedPrefixes.some((prefix) => key.startsWith(prefix))) {
    // Only delete keys within the allowed namespaces for safety
    return false
  }

  try {
    if (config.blobToken) {
      await fetch(`https://blob.vercel-storage.com/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${config.blobToken}` },
      })
      return true
    }

    if (config.bucket && config.accessKeyId && config.secretAccessKey) {
      const { bucket, region = 'auto', accessKeyId, secretAccessKey, endpoint } = config
      const rawHost = endpoint
        ? new URL(endpoint).host
        : `${bucket}.s3.${region === 'auto' ? 'us-east-1' : region}.amazonaws.com`
      const isCustomEndpoint = Boolean(endpoint)
      const requestPath = isCustomEndpoint ? `/${bucket}/${key}` : `/${key}`
      const fullUrl = isCustomEndpoint
        ? `${endpoint!.replace(/\/$/, '')}/${bucket}/${key}`
        : `https://${rawHost}/${key}`

      const now = new Date()
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
      const dateStamp = amzDate.substring(0, 8)
      const payloadHash = sha256('')

      const canonicalHeaders = `host:${rawHost}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
      const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'

      const canonicalRequest = [
        'DELETE',
        requestPath,
        '',
        canonicalHeaders,
        signedHeaders,
        payloadHash,
      ].join('\n')

      const credentialScope = `${dateStamp}/${region}/s3/aws4_request`
      const stringToSign = [
        'AWS4-HMAC-SHA256',
        amzDate,
        credentialScope,
        sha256(canonicalRequest),
      ].join('\n')

      const signingKey = getSigV4Key(secretAccessKey, dateStamp, region, 's3')
      const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')

      const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

      const res = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          Host: rawHost,
          'x-amz-date': amzDate,
          'x-amz-content-sha256': payloadHash,
          Authorization: authHeader,
        },
      })

      return res.ok || res.status === 204 || res.status === 404
    }
  } catch (err) {
    console.error('Failed to delete image from storage:', err)
  }

  return false
}

/**
 * Delete a product image from storage.
 * Maintained for backward compatibility.
 */
export async function deleteProductImage(imageUrlOrKey: string): Promise<boolean> {
  return deleteStoredImage(imageUrlOrKey, ['products/', 'gallery/', 'settings/'])
}
