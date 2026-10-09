import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop by Category | Shewa Fashion",
  description:
    "Browse all fashion categories at Shewa Fashion — Women, Men, Kids, Shoes, Bags, and Accessories. Discover handcrafted Ethiopian contemporary style.",
  openGraph: {
    title: "Shop by Category | Shewa Fashion",
    description:
      "Browse all fashion categories at Shewa Fashion — Women, Men, Kids, Shoes, Bags, and Accessories.",
  },
};

// Allow blocking route for uncached database access with Next.js 16 Cache Components
export const instant = false;

// Fallback placeholder images by category slug when DB image is absent
const FALLBACK_IMAGES: Record<string, string> = {
  women:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  men: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  kids: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
  shoes:
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  bags: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
  accessories:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
};

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb */}
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
              Categories
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-10 sm:mb-14">
          <SectionHeading
            eyebrow="Browse Catalog"
            heading="Shop by Category"
            description="Discover tailored garments, handcrafted leather footwear, structural bags, and regional artisan accents crafted in Addis Ababa."
          />
        </div>

        {/* Category Grid */}
        {categories.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-surface border border-border/80 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary mb-5">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-main mb-2">
              No Categories Available
            </h2>
            <p className="text-sm text-secondary max-w-sm mb-6">
              Our catalogue is being organised. Please check back shortly.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors shadow-xs"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((category, index) => {
              const imageSrc =
                category.image ||
                FALLBACK_IMAGES[category.slug] ||
                DEFAULT_FALLBACK;

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-surface border border-border/80 aspect-[3/4] p-4 sm:p-5 text-white shadow-xs hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={`Browse ${category.name} — ${category.productCount} ${category.productCount === 1 ? "product" : "products"}`}
                >
                  {/* Category Background Image */}
                  <Image
                    src={imageSrc}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    priority={index < 3}
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-main/85 via-main/25 to-transparent transition-opacity group-hover:from-main/90" />

                  {/* Label */}
                  <div className="relative z-10 flex flex-col gap-1">
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-accent-gold font-semibold">
                      {category.productCount}{" "}
                      {category.productCount === 1 ? "Item" : "Items"}
                    </span>
                    <h2 className="font-serif text-lg sm:text-xl lg:text-2xl font-medium tracking-wide text-white group-hover:text-primary-light transition-colors">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-[11px] sm:text-xs text-white/75 leading-relaxed line-clamp-2 mt-0.5 hidden sm:block">
                        {category.description}
                      </p>
                    )}
                    <span className="text-[11px] text-white/80 group-hover:text-white transition-colors flex items-center gap-1 pt-1">
                      Explore
                      <svg
                        className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {categories.length > 0 && (
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-sm text-secondary mb-4">
              Looking for something specific?
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors shadow-xs"
            >
              Browse All Products
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
}
