/**
 * Shewa Fashion — Catalog & Product Data Access Layer
 *
 * Server-only module for querying products, categories, and collections
 * from PostgreSQL via Prisma.
 *
 * DO NOT import this file into Client Components ('use client').
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type ProductSortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc";

export interface CatalogQueryOptions {
  q?: string;
  category?: string;
  collection?: string;
  availability?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  available: boolean;
  featured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  collection: {
    id: string;
    name: string;
    slug: string;
  } | null;
  image: string;
  imageAlt: string;
  createdAt: Date;
}

export interface CatalogResult {
  products: CatalogProduct[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ProductDetailImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface ProductDetailOption {
  id: string;
  type: "SIZE" | "SHOE_SIZE" | "COLOR" | "ONE_SIZE";
  value: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  available: boolean;
  featured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  collection: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: ProductDetailImage[];
  options: ProductDetailOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOption {
  label: string;
  slug: string;
  count?: number;
}

export interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
}

export interface CollectionDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
}

const VALID_SORT_OPTIONS: Record<string, ProductSortOption> = {
  featured: "featured",
  newest: "newest",
  "price-asc": "price-asc",
  "price-desc": "price-desc",
};

/**
 * Normalizes sort input to ensure only allowed sort options are used.
 */
export function normalizeSort(rawSort?: string): ProductSortOption {
  if (!rawSort) return "featured";
  return VALID_SORT_OPTIONS[rawSort.toLowerCase()] ?? "featured";
}

/**
 * Fetches products matching search and filter criteria with pagination.
 */
export async function getCatalogProducts(
  options: CatalogQueryOptions = {}
): Promise<CatalogResult> {
  const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 12;
  const rawPage = options.page ? Number(options.page) : 1;
  const targetPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  // Build Prisma Where Input
  const where: Prisma.ProductWhereInput = {};

  // 1. Availability Filter
  if (options.availability === "available") {
    where.available = true;
  }

  // 2. Category Filter
  if (options.category && options.category !== "all") {
    where.category = {
      slug: options.category.toLowerCase().trim(),
    };
  }

  // 3. Collection Filter
  if (options.collection && options.collection !== "all") {
    where.collection = {
      slug: options.collection.toLowerCase().trim(),
    };
  }

  // 4. Keyword Search (name and description)
  if (options.q && options.q.trim().length > 0) {
    const searchTerm = options.q.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // 5. Deterministic Sorting
  const sort = normalizeSort(options.sort);
  let orderBy: Prisma.ProductOrderByWithRelationInput[];

  switch (sort) {
    case "price-asc":
      orderBy = [{ price: "asc" }, { createdAt: "desc" }];
      break;
    case "price-desc":
      orderBy = [{ price: "desc" }, { createdAt: "desc" }];
      break;
    case "newest":
      orderBy = [{ createdAt: "desc" }, { id: "asc" }];
      break;
    case "featured":
    default:
      orderBy = [{ featured: "desc" }, { createdAt: "desc" }, { id: "asc" }];
      break;
  }

  try {
    // Total count for pagination
    const totalCount = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const currentPage = Math.min(targetPage, totalPages);
    const skip = (currentPage - 1) * pageSize;

    // Fetch bounded product page
    const rawProducts = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
          select: {
            url: true,
            alt: true,
          },
        },
      },
    });

    // Map to clean CatalogProduct format
    const products: CatalogProduct[] = rawProducts.map((p) => {
      const primaryImage = p.images[0];
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        available: p.available,
        featured: p.featured,
        category: p.category,
        collection: p.collection,
        image: primaryImage?.url || "",
        imageAlt: primaryImage?.alt || p.name,
        createdAt: p.createdAt,
      };
    });

    return {
      products,
      totalCount,
      totalPages,
      currentPage,
      pageSize,
    };
  } catch (error) {
    console.error("Error querying catalog products from database:", error);
    return {
      products: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize,
    };
  }
}

/**
 * Fetches all active categories with product counts.
 */
export async function getCatalogCategories(): Promise<FilterOption[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return categories.map((c) => ({
      label: c.name,
      slug: c.slug,
      count: c._count.products,
    }));
  } catch (error) {
    console.error("Error querying catalog categories:", error);
    return [];
  }
}

/**
 * Fetches all active collections with product counts.
 */
export async function getCatalogCollections(): Promise<FilterOption[]> {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return collections.map((c) => ({
      label: c.name,
      slug: c.slug,
      count: c._count.products,
    }));
  } catch (error) {
    console.error("Error querying catalog collections:", error);
    return [];
  }
}

/**
 * Fetches all active categories with full detail (image, description, product count).
 */
export async function getCategories(): Promise<CategoryDetail[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      productCount: c._count.products,
    }));
  } catch (error) {
    console.error("Error querying categories:", error);
    return [];
  }
}

/**
 * Fetches a single active category by slug.
 * Returns null if not found or inactive.
 */
export async function getCategoryBySlug(
  slug: string
): Promise<CategoryDetail | null> {
  if (!slug || typeof slug !== "string") return null;

  try {
    const category = await prisma.category.findFirst({
      where: { slug: slug.trim(), isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      productCount: category._count.products,
    };
  } catch (error) {
    console.error("Error querying category by slug:", error);
    return null;
  }
}

/**
 * Fetches all active collections with full detail (image, description, product count).
 */
export async function getCollections(): Promise<CollectionDetail[]> {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return collections.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      productCount: c._count.products,
    }));
  } catch (error) {
    console.error("Error querying collections:", error);
    return [];
  }
}

/**
 * Fetches a single active collection by slug.
 * Returns null if not found or inactive.
 */
export async function getCollectionBySlug(
  slug: string
): Promise<CollectionDetail | null> {
  if (!slug || typeof slug !== "string") return null;

  try {
    const collection = await prisma.collection.findFirst({
      where: { slug: slug.trim(), isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) return null;

    return {
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
      productCount: collection._count.products,
    };
  } catch (error) {
    console.error("Error querying collection by slug:", error);
    return null;
  }
}

/**
 * Fetches a single product by its unique slug with its category, collection,
 * sorted images, and options.
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  if (!slug || typeof slug !== "string") return null;

  try {
    const product = await prisma.product.findUnique({
      where: { slug: slug.trim() },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
            url: true,
            alt: true,
            sortOrder: true,
          },
        },
        options: {
          select: {
            id: true,
            type: true,
            value: true,
          },
        },
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      available: product.available,
      featured: product.featured,
      category: product.category,
      collection: product.collection,
      images: product.images,
      options: product.options as ProductDetailOption[],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  } catch (error) {
    console.error("Error retrieving product by slug from database:", error);
    return null;
  }
}

/**
 * Fetches related products in the same category or collection, excluding the current product.
 */
export async function getRelatedProducts(
  currentProductId: string,
  categoryId?: string | null,
  limit = 4
): Promise<CatalogProduct[]> {
  try {
    const where: Prisma.ProductWhereInput = {
      id: { not: currentProductId },
      available: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const rawProducts = await prisma.product.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
          select: {
            url: true,
            alt: true,
          },
        },
      },
    });

    // If fewer than limit products were found in the same category, fill with other available products
    if (rawProducts.length < limit) {
      const existingIds = [currentProductId, ...rawProducts.map((p) => p.id)];
      const fallbackProducts = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          available: true,
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: limit - rawProducts.length,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          collection: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { url: true, alt: true },
          },
        },
      });
      rawProducts.push(...fallbackProducts);
    }

    return rawProducts.map((p) => {
      const primaryImage = p.images[0];
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        available: p.available,
        featured: p.featured,
        category: p.category,
        collection: p.collection,
        image: primaryImage?.url || "",
        imageAlt: primaryImage?.alt || p.name,
        createdAt: p.createdAt,
      };
    });
  } catch (error) {
    console.error("Error retrieving related products:", error);
    return [];
  }
}

export interface GalleryItemRecord {
  id: string;
  title: string;
  imageUrl: string;
  alt: string;
  description: string | null;
  sortOrder: number;
}

export interface StoreSettingsRecord {
  storeName: string;
  description?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  openingHours?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  telegram?: string | null;
  googleMapsUrl?: string | null;
}

/**
 * Fetches all published gallery lookbook items ordered by sortOrder.
 */
export async function getGalleryItems(): Promise<GalleryItemRecord[]> {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        alt: true,
        description: true,
        sortOrder: true,
      },
    });
    return items;
  } catch (error) {
    console.error("Error retrieving gallery items from database:", error);
    return [];
  }
}

/**
 * Retrieves the store settings singleton record with all public details.
 */
export async function getStoreSettings(): Promise<StoreSettingsRecord | null> {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "singleton" },
      select: {
        storeName: true,
        description: true,
        logoUrl: true,
        phone: true,
        email: true,
        whatsapp: true,
        address: true,
        openingHours: true,
        instagram: true,
        facebook: true,
        tiktok: true,
        telegram: true,
        googleMapsUrl: true,
      },
    });
    return settings;
  } catch (error) {
    console.error("Error retrieving store settings:", error);
    return null;
  }
}
