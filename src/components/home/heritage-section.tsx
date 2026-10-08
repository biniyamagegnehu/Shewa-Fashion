import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function HeritageSection() {
  return (
    <section
      aria-labelledby="heritage-heading"
      className="py-16 sm:py-20 md:py-24 bg-surface border-y border-border"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Editorial Image Arrangement */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] max-w-lg mx-auto rounded-2xl overflow-hidden shadow-xl bg-[#F0EFEB] border border-border">
              <Image
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80"
                alt="Ethiopian Textile Craftsmanship and Contemporary Tailoring"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>

            {/* Subtle Origin Badge */}
            <div className="absolute -bottom-4 right-4 sm:right-8 bg-background p-4 rounded-xl border border-border shadow-md max-w-[240px]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-gold">
                Rooted in Addis Ababa
              </span>
              <p className="font-serif text-sm font-medium text-main pt-0.5">
                Generational weaving traditions meet modern architectural cuts.
              </p>
            </div>
          </div>

          {/* Editorial Story */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-accent-gold">
                Identity & Origin
              </span>
              <h2
                id="heritage-heading"
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-main leading-[1.15]"
              >
                Inspired by where
                <br />
                <span className="italic font-normal">we come from.</span>
              </h2>
            </div>

            <p className="text-secondary text-base lg:text-lg leading-relaxed">
              Shewa Fashion honors the timeless textile lineage of Ethiopia while
              designing for contemporary global living. We believe authentic
              craftsmanship belongs in the modern wardrobe — not as costume, but
              as effortless everyday elegance.
            </p>

            {/* Heritage Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-background border border-border/80 space-y-1.5">
                <h3 className="font-serif text-base font-medium text-main">
                  Generational Weaving
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Working with master artisans who preserve regional Ethiopian
                  loom techniques.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border/80 space-y-1.5">
                <h3 className="font-serif text-base font-medium text-main">
                  Pure Regional Fibers
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Hand-spun unbleached cotton, natural plant dyes, and Ethiopian
                  highland leather.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button href="/about" variant="outline" size="md">
                Read Our Heritage Story
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
