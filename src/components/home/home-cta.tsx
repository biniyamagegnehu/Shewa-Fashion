import React from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function HomeCta() {
  return (
    <section aria-labelledby="cta-heading" className="py-16 sm:py-20 md:py-24">
      <Container size="narrow">
        <div className="relative overflow-hidden rounded-2xl bg-surface border border-border p-8 sm:p-12 md:p-16 text-center shadow-xs">
          {/* Subtle Ambient Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-gold-light/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 space-y-4 sm:space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-semibold uppercase tracking-widest">
              Seasonal Essentials
            </span>

            <h2
              id="cta-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-main leading-tight"
            >
              Find your style.
            </h2>

            <p className="text-secondary text-sm sm:text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Explore our latest collection of contemporary apparel, handcrafted
              leather footwear, and timeless Ethiopian artisan accessories.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button href="/shop" size="lg" variant="primary" fullWidth className="sm:w-auto">
                Explore Shop
              </Button>
              <Button
                href="/collections"
                size="lg"
                variant="outline"
                fullWidth
                className="sm:w-auto"
              >
                View Collections
              </Button>
            </div>

            {/* Reassurance Badges */}
            <div className="pt-8 sm:pt-10 border-t border-border mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-secondary">
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                <span>Ethical Artisan Production</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Addis Ababa Design Studio</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span>Reliable Worldwide Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
