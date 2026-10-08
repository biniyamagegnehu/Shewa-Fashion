import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export function BrandStory() {
  return (
    <section aria-labelledby="brand-story-heading" className="py-12 sm:py-16 md:py-20">
      <Container size="narrow">
        <div className="text-center p-8 sm:p-12 md:p-16 rounded-2xl bg-surface border border-border shadow-xs space-y-4 sm:space-y-6">
          <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-accent-gold">
            Our Story
          </span>

          <h2
            id="brand-story-heading"
            className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-main leading-snug max-w-xl mx-auto"
          >
            Shewa Fashion brings together contemporary style and a connection to
            Ethiopian identity.
          </h2>

          <p className="text-secondary text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            From our design studio in Bole, Addis Ababa, we collaborate with
            generational weavers and leatherworkers to craft wardrobe essentials
            imbued with purpose, heritage, and quiet luxury.
          </p>

          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-primary hover:text-primary-hover transition-colors group"
            >
              <span>Learn more about our studio</span>
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
      </Container>
    </section>
  );
}
