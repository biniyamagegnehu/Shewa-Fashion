/**
 * Shewa Fashion — SEO, Metadata, & Schema.org Structured Data
 *
 * Provides centralized canonical URL resolution, safe JSON-LD serialization,
 * and Schema.org structured data generators for Organization, WebSite,
 * BreadcrumbList, and Product.
 */

import type { ProductDetail, StoreSettingsRecord } from '@/lib/products'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://shewafashion.com'

export const SITE_NAME = 'Shewa Fashion'

export const DEFAULT_TITLE = 'Shewa Fashion | Modern Ethiopian Fashion & Contemporary Apparel'

export const DEFAULT_DESCRIPTION =
  'Discover contemporary Ethiopian fashion, artisan textile craftsmanship, handcrafted leather footwear, structural bags, and refined modern silhouettes.'

/**
 * Returns an absolute canonical URL for a given relative or absolute path.
 */
export function getCanonicalUrl(path = ''): string {
  if (!path || path === '/' || path === '.') return SITE_URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${cleanPath.replace(/\/+$/, '')}`
}

/**
 * Safely serializes an object to JSON for inclusion inside an HTML script tag.
 * Replaces '<' with unicode escape '\\u003c' to prevent script injection attacks.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/**
 * Schema.org Organization / ClothingStore structured data.
 * Uses only real, non-fabricated store configuration.
 */
export function buildStoreJsonLd(settings?: StoreSettingsRecord | null) {
  const storeName = settings?.storeName || SITE_NAME
  const description = settings?.description || DEFAULT_DESCRIPTION

  // Collect verified social channels only
  const sameAs: string[] = []
  if (settings?.instagram) {
    sameAs.push(
      settings.instagram.startsWith('http')
        ? settings.instagram
        : `https://instagram.com/${settings.instagram.replace(/^@/, '')}`
    )
  }
  if (settings?.facebook) {
    sameAs.push(
      settings.facebook.startsWith('http')
        ? settings.facebook
        : `https://facebook.com/${settings.facebook}`
    )
  }
  if (settings?.telegram) {
    sameAs.push(
      settings.telegram.startsWith('http')
        ? settings.telegram
        : `https://t.me/${settings.telegram.replace(/^@/, '')}`
    )
  }
  if (settings?.tiktok) {
    sameAs.push(
      settings.tiktok.startsWith('http')
        ? settings.tiktok
        : `https://tiktok.com/@${settings.tiktok.replace(/^@/, '')}`
    )
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: storeName,
    url: SITE_URL,
    description,
    priceRange: 'ETB',
    currenciesAccepted: 'ETB',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Addis Ababa',
      addressCountry: 'ET',
      ...(settings?.address ? { streetAddress: settings.address } : {}),
    },
    ...(settings?.phone ? { telephone: settings.phone } : {}),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(settings?.logoUrl ? { logo: settings.logoUrl, image: settings.logoUrl } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

/**
 * Schema.org WebSite structured data with SearchAction.
 */
export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Schema.org BreadcrumbList structured data.
 */
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.url),
    })),
  }
}

/**
 * Schema.org Product structured data.
 * Adheres strictly to Ethiopian Birr (ETB) currency and reliable available stock data.
 * No fabricated ratings or reviews.
 */
export function buildProductJsonLd(product: ProductDetail) {
  const images = product.images.map((img) => img.url).filter(Boolean)
  const productUrl = getCanonicalUrl(`/shop/${product.slug}`)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: productUrl,
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'ETB',
      url: productUrl,
      availability: product.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }
}
