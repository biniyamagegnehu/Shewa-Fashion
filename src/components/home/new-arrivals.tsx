import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { newArrivals } from "@/data/mock-data";
import { Button } from "@/components/ui/button";

export function NewArrivals() {
  return (
    <section aria-labelledby="new-arrivals-heading" className="py-12 sm:py-16">
      <Container>
        {/* Section Header with Desktop 'View All' Link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <SectionHeading
            eyebrow="Latest Releases"
            heading="New Arrivals"
            description="Our latest pieces tailored in small artisan batches in Addis Ababa."
          />

          <div className="hidden sm:block shrink-0">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors group"
            >
              <span>View all releases</span>
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
            </Link>
          </div>
        </div>

        {/* Mobile Horizontal Swipeable Reel -> Desktop 4-column Grid */}
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 sm:overflow-visible">
          {newArrivals.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="w-[72vw] max-w-[280px] shrink-0 sm:w-full sm:max-w-none sm:shrink snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="sm:hidden pt-4">
          <Button href="/shop" variant="outline" fullWidth size="md">
            View All New Arrivals
          </Button>
        </div>
      </Container>
    </section>
  );
}
