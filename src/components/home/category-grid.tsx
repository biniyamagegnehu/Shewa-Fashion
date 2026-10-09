import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories } from "@/data/mock-data";

export function CategoryGrid() {
  return (
    <section aria-labelledby="category-heading" className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Browse Catalog"
          heading="Shop by Category"
          description="Discover tailored garments, handcrafted leather footwear, structural bags, and regional artisan accents."
          className="mb-8 sm:mb-12"
        />

        {/* 6 Category Grid: Mobile 2-cols -> Tablet 3-cols -> Desktop 6-cols */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative flex flex-col justify-end overflow-hidden rounded-xl bg-surface border border-border/80 aspect-[4/5] p-3.5 sm:p-4 text-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label={`Browse ${category.name} — ${category.itemCount} items`}
            >
              {/* Category Background Image */}
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Gradient Scrim for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-main/85 via-main/30 to-transparent transition-opacity group-hover:from-main/90" />

              {/* Category Card Label */}
              <div className="relative z-10 flex flex-col gap-0.5">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-accent-gold font-medium">
                  {category.itemCount} Items
                </span>
                <h3 className="font-serif text-base sm:text-lg lg:text-xl font-medium tracking-wide text-white group-hover:text-primary-light transition-colors">
                  {category.name}
                </h3>
                <span className="text-[11px] text-white/75 group-hover:text-white transition-colors flex items-center gap-1 pt-0.5">
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
          ))}
        </div>
      </Container>
    </section>
  );
}
