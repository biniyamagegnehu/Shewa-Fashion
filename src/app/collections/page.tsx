import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCollections } from "@/lib/products";

export const metadata: Metadata = {
  title: "Collections | Shewa Fashion",
  description:
    "Explore curated collections at Shewa Fashion — New Arrivals, Best Sellers, Everyday Essentials, Ethiopian Heritage, and Seasonal Edits.",
  openGraph: {
    title: "Collections | Shewa Fashion",
    description:
      "Explore curated fashion collections at Shewa Fashion. Handcrafted Ethiopian contemporary style.",
  },
};

// Allow blocking route for uncached database access with Next.js 16 Cache Components
export const instant = false;

// Fallback editorial imagery by collection slug
const FALLBACK_IMAGES: Record<string, string> = {
  "new-arrivals":
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  "best-sellers":
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
  "everyday-essentials":
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
  "ethiopian-heritage":
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  "seasonal-edit":
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80",
};

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80";

export default async function CollectionsPage() {
  const collections = await getCollections();

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
              Collections
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-10 sm:mb-14">
          <SectionHeading
            eyebrow="Curated Edits"
            heading="Collections"
            description="Handpicked groupings that tell a story — from new arrivals to Ethiopian heritage capsules."
          />
        </div>

        {/* Collections */}
        {collections.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-surface border border-border/80 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-accent-gold-light flex items-center justify-center text-accent-gold mb-5">
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
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-main mb-2">
              No Collections Available
            </h2>
            <p className="text-sm text-secondary max-w-sm mb-6">
              Our curated collections are being prepared. Please check back
              shortly.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors shadow-xs"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {collections.map((collection, index) => {
              const imageSrc =
                collection.image ||
                FALLBACK_IMAGES[collection.slug] ||
                DEFAULT_FALLBACK;

              // Alternate layout: even = image left, odd = image right
              const isEven = index % 2 === 0;

              return (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-surface border border-border shadow-xs hover:shadow-md transition-all block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={`View ${collection.name} collection — ${collection.productCount} ${collection.productCount === 1 ? "product" : "products"}`}
                >
                  <div
                    className={`grid grid-cols-1 md:grid-cols-12 items-stretch ${!isEven ? "md:flex-row-reverse" : ""}`}
                  >
                    {/* Collection Image */}
                    <div
                      className={`relative aspect-[16/9] md:aspect-auto md:col-span-5 overflow-hidden bg-[#F0EFEB] min-h-[200px] md:min-h-[260px] ${!isEven ? "md:order-last" : ""}`}
                    >
                      <Image
                        src={imageSrc}
                        alt={collection.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 42vw"
                        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        priority={index < 2}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-main/20 via-transparent to-transparent" />
                    </div>

                    {/* Collection Info */}
                    <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-xs font-semibold uppercase tracking-widest text-accent-gold">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                          <span>Collection</span>
                        </div>
                        <span className="text-xs text-secondary font-medium">
                          {collection.productCount}{" "}
                          {collection.productCount === 1 ? "piece" : "pieces"}
                        </span>
                      </div>

                      <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-main mb-3 group-hover:text-primary transition-colors">
                        {collection.name}
                      </h2>

                      {collection.description && (
                        <p className="text-secondary text-sm sm:text-base leading-relaxed mb-5 max-w-lg">
                          {collection.description}
                        </p>
                      )}

                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-primary-hover transition-colors">
                        Explore Collection
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {collections.length > 0 && (
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-sm text-secondary mb-4">
              Want to browse everything at once?
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
