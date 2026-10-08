import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { featuredCollection } from "@/data/mock-data";

export function FeaturedCollection() {
  return (
    <section aria-labelledby="featured-collection-heading" className="py-12 sm:py-16 md:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-surface border border-border shadow-sm grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Editorial Campaign Imagery */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:col-span-7 overflow-hidden bg-[#F0EFEB]">
            <Image
              src={featuredCollection.image}
              alt="Shewa Heritage Capsule Campaign"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center"
            />
            {/* Subtle Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-main/30 via-transparent to-transparent lg:hidden" />
          </div>

          {/* Editorial Story Panel */}
          <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-surface">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-xs font-semibold uppercase tracking-widest text-accent-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <span>{featuredCollection.badge || "Featured Capsule"}</span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium pb-1">
                  {featuredCollection.subtitle}
                </p>
                <h2
                  id="featured-collection-heading"
                  className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-main leading-tight"
                >
                  {featuredCollection.title}
                </h2>
              </div>

              <p className="text-secondary text-sm sm:text-base leading-relaxed">
                {featuredCollection.description}
              </p>

              {/* Artisan Highlights */}
              <div className="space-y-2 pt-2 border-t border-border text-xs sm:text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Hand-spun organic cotton from Shewa Valley</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Subtle handwoven Tibeb-inspired geometric hem</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Tailored in limited, numbered runs</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6 sm:pt-8">
              <Button
                href={featuredCollection.href}
                size="lg"
                variant="primary"
                fullWidth
                className="sm:w-auto"
              >
                Discover the Collection
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
