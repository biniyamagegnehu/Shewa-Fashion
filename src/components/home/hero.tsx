import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section
      id="homepage-hero"
      aria-labelledby="hero-title"
      className="relative w-full overflow-hidden bg-main -mt-16 sm:-mt-20 min-h-[600px] sm:min-h-[660px] md:min-h-[720px] lg:min-h-[780px] xl:h-[92vh] xl:max-h-[900px] flex items-center justify-center"
    >
      {/* 1. Background Fashion Photography (Full-Width, Uncluttered) */}
      <div className="absolute -top-2 inset-x-0 bottom-0 z-0">
        {/* Desktop / Tablet Landscape Editorial Image */}
        <div className="hidden md:block absolute inset-0">
          <Image
            src="/images/hero/shewa-hero-editorial.jpg"
            alt="Shewa Fashion Contemporary Apparel & Handcrafted Leather Footwear"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[78%_center] xl:object-center select-none"
          />
        </div>

        {/* Mobile Vertical Editorial Image */}
        <div className="md:hidden absolute inset-0">
          <Image
            src="/images/hero/shewa-hero-mobile.jpg"
            alt="Shewa Fashion Modern Ethiopian Apparel and Footwear Collection"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top select-none"
          />
        </div>

        {/* 2. Seamless Cinematic Overlay & Scrim for Readability */}
        {/* Uniform dark ambient wash */}
        <div className="absolute inset-0 bg-black/45 md:bg-black/40 pointer-events-none" />

        {/* Vertical gradient: darker at top (for transparent header) and bottom (for section transition) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#111822]/80 via-transparent via-40% to-[#111822]/85 pointer-events-none" />
      </div>

      {/* 3. Centered Editorial Content (Wearix-Inspired Layout) */}
      <Container className="relative z-10 w-full pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl flex flex-col items-center gap-4 sm:gap-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-medium text-white shadow-xs">
            <span className="px-2 py-0.5 rounded-full bg-white text-main text-[10px] font-bold tracking-wider uppercase">
              New
            </span>
            <span className="tracking-wide text-white/95">
              Style That Feels Like You
            </span>
          </div>

          {/* Main Headline */}
          <h1
            id="hero-title"
            className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.12] text-balance max-w-2xl sm:max-w-3xl"
          >
            Find Your{" "}
            <span className="italic font-normal text-primary-light">
              Everyday Style.
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-xl font-normal mx-auto text-balance">
            Explore clothing and footwear selected to bring comfort, confidence,
            and character to your everyday look.
          </p>

          {/* Side-by-Side Balanced CTAs (Desktop & Mobile) */}
          <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-4 pt-3 w-full max-w-md mx-auto">
            <Link
              href="/shop"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm md:text-base font-semibold shadow-lg hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-main"
            >
              <span>Explore Collection</span>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1"
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

            <Link
              href="/collections"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md text-xs sm:text-sm md:text-base font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-main"
            >
              <span>View Collections</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
