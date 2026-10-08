import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative pt-4 sm:pt-6 pb-12 sm:pb-16 md:pb-20 overflow-hidden"
    >
      <Container>
        {/* Mobile View (Dedicated Stacked Visual Composition) */}
        <div className="md:hidden relative rounded-2xl overflow-hidden bg-main text-white shadow-xl min-h-[540px] flex flex-col justify-end p-6">
          {/* Background Fashion Campaign Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85"
              alt="Shewa Fashion Contemporary Editorial Campaign"
              fill
              priority
              sizes="100vw"
              className="object-cover object-top opacity-85"
            />
            {/* Gradient Overlay for Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-main via-main/60 to-transparent" />
          </div>

          {/* Mobile Hero Content Overlay */}
          <div className="relative z-10 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-surface/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold uppercase tracking-widest text-accent-gold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span>Spring / Summer 2026</span>
            </div>

            <h1
              id="hero-title"
              className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white leading-tight"
            >
              Modern fashion,
              <br />
              <span className="italic font-normal">inspired by Shewa.</span>
            </h1>

            <p className="text-sm text-white/90 leading-relaxed max-w-sm">
              Contemporary clothing, shoes, bags, and artisan accessories
              blending Ethiopian textile heritage with effortless modern design.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Button href="/shop" size="md" variant="primary" fullWidth>
                Explore Shop
              </Button>
              <Button
                href="/collections"
                size="md"
                variant="outline"
                fullWidth
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
              >
                Explore Collection
              </Button>
            </div>
          </div>
        </div>

        {/* Tablet & Desktop View (Progressively Enhanced Editorial Layout) */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="md:col-span-7 lg:col-span-6 flex flex-col gap-6 py-6">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-primary-light border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>New Season • Volume IV Collection</span>
            </div>

            <h1
              id="hero-title-desktop"
              className="font-serif text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tight text-main leading-[1.12]"
            >
              Modern fashion,
              <br />
              <span className="italic font-normal text-secondary">
                inspired by Shewa.
              </span>
            </h1>

            <p className="text-secondary text-base lg:text-lg leading-relaxed max-w-xl">
              Contemporary clothing, handcrafted leather shoes, structural bags,
              and fine accessories crafted in celebration of authentic Ethiopian
              textile traditions.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 pt-2">
              <Button href="/shop" size="lg" variant="primary">
                Explore Shop
              </Button>
              <Button href="/collections" size="lg" variant="outline">
                Explore Collection
              </Button>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border mt-4">
              <div>
                <p className="font-serif text-xl lg:text-2xl font-medium text-main">
                  100%
                </p>
                <p className="text-xs text-secondary tracking-wide uppercase pt-0.5">
                  Artisan Fibers
                </p>
              </div>
              <div>
                <p className="font-serif text-xl lg:text-2xl font-medium text-main">
                  Addis Ababa
                </p>
                <p className="text-xs text-secondary tracking-wide uppercase pt-0.5">
                  Design Studio
                </p>
              </div>
              <div>
                <p className="font-serif text-xl lg:text-2xl font-medium text-main">
                  Worldwide
                </p>
                <p className="text-xs text-secondary tracking-wide uppercase pt-0.5">
                  Direct Shipping
                </p>
              </div>
            </div>
          </div>

          {/* Right Image Column */}
          <div className="md:col-span-5 lg:col-span-6 relative">
            <div className="relative aspect-[4/5] w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl bg-surface border border-border">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
                alt="Contemporary Ethiopian Fashion Silhouette"
                fill
                priority
                sizes="(max-width: 1024px) 45vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-main/30 via-transparent to-transparent" />
            </div>

            {/* Floating Editorial Badge */}
            <div className="absolute -bottom-6 -left-6 lg:left-4 bg-surface p-4 rounded-xl shadow-lg border border-border max-w-[220px]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-gold">
                Heritage Craft
              </span>
              <p className="font-serif text-sm font-medium text-main pt-0.5">
                Hand-spun organic cotton & vegetable-tanned leather.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
