import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getCollectionBySlug, getCatalogProducts } from "@/lib/products";
import { normalizeSort } from "@/lib/products";
import { ProductGrid } from "@/components/shop/product-grid";
import { Pagination } from "@/components/shop/pagination";
import { ShopSort } from "@/components/shop/shop-sort";

// Allow blocking route for uncached database access with Next.js 16 Cache Components
export const instant = false;

// Fallback images by slug
const FALLBACK_IMAGES: Record<string, string> = {
  "new-arrivals":
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80",
  "best-sellers":
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=80",
  "everyday-essentials":
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1400&q=80",
  "ethiopian-heritage":
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
  "seasonal-edit":
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80",
};

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Collection Not Found | Shewa Fashion",
      description: "The requested collection could not be found.",
    };
  }

  return {
    title: `${collection.name} | Shewa Fashion`,
    description:
      collection.description ||
      `Shop the ${collection.name} collection at Shewa Fashion — handcrafted Ethiopian contemporary fashion.`,
    openGraph: {
      title: `${collection.name} | Shewa Fashion`,
      description:
        collection.description ||
        `Shop the ${collection.name} collection at Shewa Fashion.`,
      images: collection.image
        ? [{ url: collection.image, alt: collection.name }]
        : [],
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const resolvedParams = await searchParams;

  const sort =
    typeof resolvedParams.sort === "string" ? resolvedParams.sort : "featured";
  const rawPage =
    typeof resolvedParams.page === "string"
      ? parseInt(resolvedParams.page, 10)
      : 1;
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  // Fetch collection and products in parallel
  const [collection, catalogData] = await Promise.all([
    getCollectionBySlug(slug),
    getCatalogProducts({
      collection: slug,
      sort: normalizeSort(sort),
      page,
      pageSize: 12,
    }),
  ]);

  if (!collection) {
    notFound();
  }

  const { products, totalCount, totalPages, currentPage } = catalogData;

  const imageSrc =
    collection.image || FALLBACK_IMAGES[collection.slug] || DEFAULT_FALLBACK;

  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-secondary font-medium tracking-wide">
            <li>
              <Link href="/" className="hover:text-main transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-secondary/40">
              /
            </li>
            <li>
              <Link
                href="/collections"
                className="hover:text-main transition-colors"
              >
                Collections
              </Link>
            </li>
            <li aria-hidden="true" className="text-secondary/40">
              /
            </li>
            <li
              aria-current="page"
              className="text-main font-semibold truncate max-w-[200px] sm:max-w-none"
            >
              {collection.name}
            </li>
          </ol>
        </nav>

        {/* Collection Hero — editorial full-width banner */}
        <div className="relative overflow-hidden rounded-2xl mb-8 sm:mb-12 bg-surface border border-border shadow-sm">
          {/* Hero Image */}
          <div className="relative aspect-[21/9] min-h-[200px] sm:min-h-[280px] overflow-hidden bg-[#F0EFEB]">
            <Image
              src={imageSrc}
              alt={collection.name}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            {/* Deep editorial gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-main/80 via-main/40 to-transparent" />

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12 max-w-2xl">
              {/* Collection badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/20 border border-accent-gold/30 text-xs font-semibold uppercase tracking-widest text-accent-gold mb-4 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                Curated Collection
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tight text-white mb-3">
                {collection.name}
              </h1>

              {collection.description && (
                <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-md mb-4">
                  {collection.description}
                </p>
              )}

              <p className="text-xs sm:text-sm text-white/70 font-medium">
                <span className="font-semibold text-white">{totalCount}</span>{" "}
                {totalCount === 1 ? "piece" : "pieces"} in this collection
              </p>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border mb-6">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-main">
              {collection.name}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-secondary whitespace-nowrap hidden sm:block">
                {totalCount === 0
                  ? "No products"
                  : `Showing ${(currentPage - 1) * 12 + 1}–${Math.min(currentPage * 12, totalCount)} of ${totalCount}`}
              </span>
              <ShopSort currentSort={sort} />
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid products={products} hasActiveFilters={false} />

          {/* Pagination */}
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </Container>
    </main>
  );
}
