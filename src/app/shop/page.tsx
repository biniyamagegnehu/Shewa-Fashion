import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  getCatalogProducts,
  getCatalogCategories,
  getCatalogCollections,
} from "@/lib/products";
import { ShopSearch } from "@/components/shop/shop-search";
import { ShopSort } from "@/components/shop/shop-sort";
import { ShopFilters } from "@/components/shop/shop-filters";
import { MobileFilterDrawer } from "@/components/shop/mobile-filter-drawer";
import { ActiveFilters } from "@/components/shop/active-filters";
import { CategoryPills } from "@/components/shop/category-pills";
import { ProductGrid } from "@/components/shop/product-grid";
import { Pagination } from "@/components/shop/pagination";

export const metadata: Metadata = {
  title: "Shop Catalogue | Shewa Fashion",
  description:
    "Explore contemporary Ethiopian fashion, artisan leather shoes, handcrafted bags, and heritage accessories.",
};

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Await searchParams per Next.js 16 conventions
  const params = await searchParams;

  const q = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const collection = typeof params.collection === "string" ? params.collection : undefined;
  const availability =
    typeof params.availability === "string" ? params.availability : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "featured";
  const rawPage = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  // Fetch data in parallel
  const [catalogData, categories, collections] = await Promise.all([
    getCatalogProducts({
      q,
      category,
      collection,
      availability,
      sort,
      page,
      pageSize: 12,
    }),
    getCatalogCategories(),
    getCatalogCollections(),
  ]);

  const { products, totalCount, totalPages, currentPage } = catalogData;

  const hasActiveFilters = Boolean(
    q || (category && category !== "all") || (collection && collection !== "all") || availability === "available"
  );

  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 text-xs text-secondary font-medium tracking-wide">
            <li>
              <Link href="/" className="hover:text-main transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-secondary/50">
              /
            </li>
            <li aria-current="page" className="text-main font-semibold">
              Shop
            </li>
          </ol>
        </nav>

        {/* Page Title & Introductory Context */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-semibold tracking-[0.16em] uppercase text-primary block mb-1">
              Ethiopian Contemporary
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-main">
              The Collection
            </h1>
            <p className="mt-2 text-sm sm:text-base text-secondary max-w-xl leading-relaxed">
              Explore contemporary silhouettes, handcrafted leather footwear,
              sculptural bags, and handwoven accessories crafted in Addis Ababa.
            </p>
          </div>

          <div className="text-xs sm:text-sm text-secondary font-medium whitespace-nowrap">
            Showing{" "}
            <span className="font-semibold text-main">
              {totalCount === 0 ? 0 : (currentPage - 1) * 12 + 1}–
              {Math.min(currentPage * 12, totalCount)}
            </span>{" "}
            of <span className="font-semibold text-main">{totalCount}</span>{" "}
            {totalCount === 1 ? "product" : "products"}
          </div>
        </div>

        {/* Quick Category Pills */}
        <CategoryPills categories={categories} className="mb-6" />

        {/* Toolbar: Search, Mobile Filters, and Sorting Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-border">
          <div className="w-full sm:max-w-xs md:max-w-sm">
            <ShopSearch defaultValue={q} />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <MobileFilterDrawer
                categories={categories}
                collections={collections}
                totalCount={totalCount}
              />
            </div>

            {/* Sort Control */}
            <ShopSort currentSort={sort} />
          </div>
        </div>

        {/* Active Filter Chips */}
        <ActiveFilters categories={categories} collections={collections} />

        {/* Main Content Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xl:gap-12 items-start mt-6">
          {/* Desktop Sidebar Filters */}
          <aside
            aria-label="Product filters"
            className="hidden lg:block lg:col-span-1 sticky top-24 bg-surface p-6 rounded-2xl border border-border/80 shadow-xs"
          >
            <ShopFilters
              categories={categories}
              collections={collections}
            />
          </aside>

          {/* Product Grid and Pagination */}
          <section
            aria-label="Product catalogue listing"
            className="lg:col-span-3 min-w-0"
          >
            <ProductGrid
              products={products}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </section>
        </div>
      </Container>
    </main>
  );
}
