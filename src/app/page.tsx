import React from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export default function Home() {
  return (
    <div className="py-8 sm:py-12 md:py-16 space-y-16 sm:space-y-24">
      {/* Design System Hero Intro */}
      <section aria-labelledby="hero-heading">
        <Container>
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary bg-primary-light rounded-full">
              Phase 2 Shell & Design System
            </span>

            <h1
              id="hero-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-main leading-[1.15]"
            >
              Modern Ethiopian Fashion Foundation
            </h1>

            <p className="text-secondary text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl">
              Shewa Fashion honors authentic Ethiopian craftsmanship through
              refined modern tailoring. This preview showcases the Phase 2
              site shell, reusable typography scale, accessible touch targets, and
              the light-blue brand token system.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button href="/shop" size="md" variant="primary">
                Explore Shop
              </Button>
              <Button href="/collections" size="md" variant="secondary">
                View Collections
              </Button>
              <Button href="/about" size="md" variant="outline">
                About Shewa
              </Button>
              <Button href="/contact" size="md" variant="ghost">
                Contact
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Color System Token Verification */}
      <section aria-labelledby="colors-heading" className="bg-surface py-12 sm:py-16 border-y border-border">
        <Container>
          <SectionHeading
            eyebrow="Color Architecture"
            heading="Curated Color Tokens"
            description="Our palette emphasizes clean neutrals with light blue as the core interactive brand color and Ethiopian gold as a delicate accent."
            className="mb-8 sm:mb-12"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Primary */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-3">
              <div className="h-14 rounded-lg bg-primary shadow-xs" />
              <div>
                <p className="text-sm font-semibold text-main">Primary Blue</p>
                <p className="text-xs text-secondary font-mono">#5B9BD5</p>
                <span className="text-[11px] text-secondary">Brand actions</span>
              </div>
            </div>

            {/* Primary Light */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-3">
              <div className="h-14 rounded-lg bg-primary-light border border-primary/20" />
              <div>
                <p className="text-sm font-semibold text-main">Primary Light</p>
                <p className="text-xs text-secondary font-mono">#EAF4FC</p>
                <span className="text-[11px] text-secondary">Tints & badges</span>
              </div>
            </div>

            {/* Accent Gold */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-3">
              <div className="h-14 rounded-lg bg-accent-gold shadow-xs" />
              <div>
                <p className="text-sm font-semibold text-main">Accent Gold</p>
                <p className="text-xs text-secondary font-mono">#D4A84F</p>
                <span className="text-[11px] text-secondary">Heritage details</span>
              </div>
            </div>

            {/* Surface */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-3">
              <div className="h-14 rounded-lg bg-surface border border-border shadow-xs" />
              <div>
                <p className="text-sm font-semibold text-main">Surface</p>
                <p className="text-xs text-secondary font-mono">#FFFFFF</p>
                <span className="text-[11px] text-secondary">Cards & panels</span>
              </div>
            </div>

            {/* Canvas / Background */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-3">
              <div className="h-14 rounded-lg bg-background border border-border" />
              <div>
                <p className="text-sm font-semibold text-main">Background</p>
                <p className="text-xs text-secondary font-mono">#FAFAF8</p>
                <span className="text-[11px] text-secondary">Warm canvas</span>
              </div>
            </div>

            {/* Main Text */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-3">
              <div className="h-14 rounded-lg bg-main shadow-xs" />
              <div>
                <p className="text-sm font-semibold text-main">Charcoal Text</p>
                <p className="text-xs text-secondary font-mono">#17202A</p>
                <span className="text-[11px] text-secondary">High contrast</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Button System Verification */}
      <section aria-labelledby="buttons-heading">
        <Container>
          <SectionHeading
            eyebrow="Interactive Elements"
            heading="Button Hierarchy & Touch Targets"
            description="Designed mobile-first with comfortable touch targets (44px+ minimum for medium/large sizes), accessible focus rings, and smooth hover feedback."
            className="mb-8 sm:mb-12"
          />

          <div className="space-y-8 bg-surface p-6 sm:p-8 rounded-2xl border border-border">
            {/* Variants */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-4">
                Variants (Medium Size — 44px Touch Target)
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            {/* Sizes */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-4">
                Responsive Sizing Scale
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm" variant="primary">
                  Small (40px)
                </Button>
                <Button size="md" variant="primary">
                  Medium (44px)
                </Button>
                <Button size="lg" variant="primary">
                  Large (52px)
                </Button>
              </div>
            </div>

            {/* Full Width Mobile Demonstration */}
            <div className="pt-6 border-t border-border max-w-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-4">
                Full-Width Mobile Action
              </h3>
              <Button fullWidth size="md" variant="primary">
                Full-Width Call to Action
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Responsive Shell Layout Preview */}
      <section aria-labelledby="layout-heading">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Mobile-First Foundation"
            heading="Adaptive Responsive Architecture"
            description="All shell components maintain balanced margins, readable typography hierarchy, and zero horizontal overflow across 320px mobile to 1440px desktop."
            className="mb-8 sm:mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface p-6 rounded-xl border border-border flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-gold">
                01. Mobile Priority
              </span>
              <h3 className="font-serif text-xl font-medium text-main">
                One-Hand Usability
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                Navigation drawer, action targets, and button tap areas are
                proportioned for comfortable single-handed mobile operation.
              </p>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-gold">
                02. Fashion-First
              </span>
              <h3 className="font-serif text-xl font-medium text-main">
                Photographic Focus
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                Quiet, warm-neutral backgrounds keep attention on Ethiopian
                textiles, garments, and artisan photography in future phases.
              </p>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-gold">
                03. Clean Hierarchy
              </span>
              <h3 className="font-serif text-xl font-medium text-main">
                Refined Navigation
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                Global navbar focuses on key destinations (Shop, Collections,
                About, Gallery, Contact), leaving product category filters for the shop.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
