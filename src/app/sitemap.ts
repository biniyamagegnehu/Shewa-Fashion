import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  try {
    const [products, categories, collections] = await Promise.all([
      prisma.product.findMany({
        where: { available: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 2000,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.collection.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/shop/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${SITE_URL}/categories/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    const collectionRoutes: MetadataRoute.Sitemap = collections.map((col) => ({
      url: `${SITE_URL}/collections/${col.slug}`,
      lastModified: col.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...collectionRoutes]
  } catch (error) {
    console.error('Failed to generate dynamic sitemap entries from database:', error)
    return staticRoutes
  }
}
