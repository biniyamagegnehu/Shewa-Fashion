import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { getGalleryItems } from "@/lib/products";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

// Allow blocking route for uncached database access with Next.js 16 Cache Components
export const instant = false;

export const metadata: Metadata = {
  title: "Lookbook Gallery | Shewa Fashion",
  description:
    "Explore the Shewa Fashion editorial gallery — campaign vignettes and visual narratives capturing contemporary Ethiopian fashion in Addis Ababa.",
  openGraph: {
    title: "Lookbook Gallery | Shewa Fashion",
    description:
      "Campaign vignettes and visual narratives capturing contemporary Ethiopian style.",
  },
};

export default async function GalleryPage() {
  const galleryItems = await getGalleryItems();

  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
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
              Gallery
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-10 sm:mb-14">
          <SectionHeading
            eyebrow="Visual Journal"
            heading="The Shewa Lookbook"
            description="Campaign vignettes captured on the streets and in the creative studios of Addis Ababa, exploring contemporary Ethiopian silhouettes and authentic textile craftsmanship."
          />
        </div>

        {/* Gallery Content */}
        {galleryItems.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-surface border border-border/80 rounded-2xl p-6">
            <div className="w-16 h-16 rounded-full bg-accent-gold/10 text-accent-gold flex items-center justify-center mb-5">
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
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-main mb-2">
              Lookbook In Preparation
            </h2>
            <p className="text-sm text-secondary max-w-sm mb-6 leading-relaxed">
              Our seasonal campaign photography is currently being curated. Please
              check back soon to view our latest visual stories.
            </p>
            <Button href="/shop" variant="primary" size="md">
              Browse Current Collection
            </Button>
          </div>
        ) : (
          <GalleryGrid items={galleryItems} />
        )}

        {/* Bottom Call to Action */}
        <div className="mt-16 sm:mt-24 p-8 sm:p-12 rounded-3xl bg-surface border border-border shadow-xs text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-gold block">
            Discover the Garments
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-main">
            Inspired by What You See?
          </h2>
          <p className="text-secondary text-sm leading-relaxed">
            Every piece featured in our editorial journal is designed and handcrafted
            in limited runs. Browse the shop catalogue or discover our curated
            thematic edits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button href="/shop" variant="primary" size="md">
              Explore Full Shop
            </Button>
            <Button href="/collections" variant="outline" size="md">
              View Collections
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
