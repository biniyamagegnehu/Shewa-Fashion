import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getCategoryBySlug, getCatalogProducts } from "@/lib/products";
import { normalizeSort } from "@/lib/products";
import { ProductGrid } from "@/components/shop/product-grid";
import { Pagination } from "@/components/shop/pagination";
import { ShopSort } from "@/components/shop/shop-sort";

// Allow blocking route for uncached database access with Next.js 16 Cache Components
export const instant = false;

// Fallback images by slug
const FALLBACK_IMAGES: Record<string, string> = {
  women:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=80",
  men: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1400&q=80",
  kids: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=80",
  shoes:
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1400&q=80",
  bags: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=80",
  accessories:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=80",
};

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | Shewa Fashion",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${category.name} | Shewa Fashion`,
    description:
      category.description ||
      `Shop ${category.name} at Shewa Fashion — handcrafted Ethiopian contemporary fashion.`,
    openGraph: {
      title: `${category.name} | Shewa Fashion`,
      description:
        category.description ||
        `Shop ${category.name} at Shewa Fashion.`,
      images: category.image
        ? [{ url: category.image, alt: category.name }]
        : [],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const resolvedParams = await searchParams;

  const sort =
    typeof resolvedParams.sort === "string" ? resolvedParams.sort : "featured";
  const rawPage =
    typeof resolvedParams.page === "string"
      ? parseInt(resolvedParams.page, 10)
      : 1;
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  // Fetch category and products in parallel
  const [category, catalogData] = await Promise.all([
    getCategoryBySlug(slug),
    getCatalogProducts({
      category: slug,
      sort: normalizeSort(sort),
      page,
      pageSize: 12,
    }),
  ]);

  if (!category) {
    notFound();
  }

  const { products, totalCount, totalPages, currentPage } = catalogData;

  const imageSrc =
    category.image || FALLBACK_IMAGES[category.slug] || DEFAULT_FALLBACK;

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
                href="/categories"
                className="hover:text-main transition-colors"
              >
                Categories
              </Link>
            </li>
            <li aria-hidden="true" className="text-secondary/40">
              /
            </li>
            <li
              aria-current="page"
              className="text-main font-semibold truncate max-w-[200px] sm:max-w-none"
            >
              {category.name}
            </li>
          </ol>
        </nav>

        {/* Category Hero */}
        <div className="relative overflow-hidden rounded-2xl mb-8 sm:mb-12 bg-surface border border-border shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Hero Image */}
            <div className="relative aspect-[16/9] lg:aspect-auto lg:col-span-5 overflow-hidden bg-[#F0EFEB] min-h-[220px] lg:min-h-[320px]">
              <Image
                src={imageSrc}
                alt={category.name}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-main/30 via-transparent to-transparent lg:hidden" />
            </div>

            {/* Category Info Panel */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center bg-surface">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-semibold uppercase tracking-widest w-fit mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Category
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-main mb-3">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-secondary text-sm sm:text-base leading-relaxed mb-4 max-w-lg">
                  {category.description}
                </p>
              )}
              <p className="text-xs sm:text-sm text-secondary font-medium">
                <span className="font-semibold text-main">{totalCount}</span>{" "}
                {totalCount === 1 ? "product" : "products"} available
              </p>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border mb-6">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-main">
              {category.name} Products
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
