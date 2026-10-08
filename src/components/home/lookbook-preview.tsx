import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { lookbookItems } from "@/data/mock-data";

export function LookbookPreview() {
  return (
    <section aria-labelledby="lookbook-heading" className="py-12 sm:py-16 md:py-20">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <SectionHeading
            eyebrow="Visual Journal"
            heading="The Shewa Lookbook"
            description="Campaign vignettes captured on the streets of Addis Ababa, exploring the rhythm of contemporary African style."
          />

          <div className="hidden sm:block shrink-0">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors group"
            >
              <span>Explore full lookbook</span>
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

        {/* Mobile: 2-column Grid | Desktop: Editorial Asymmetric Arrangement */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-5">
          {/* Look 1 */}
          <div className="md:col-span-6 lg:col-span-5 relative aspect-[3/4] overflow-hidden rounded-xl bg-surface border border-border group">
            <Image
              src={lookbookItems[0].image}
              alt={lookbookItems[0].title}
              fill
              sizes="(max-width: 640px) 50vw, 40vw"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-main/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] uppercase tracking-wider text-accent-gold font-medium">
                {lookbookItems[0].season}
              </span>
              <h3 className="font-serif text-sm sm:text-base font-medium">
                {lookbookItems[0].title}
              </h3>
            </div>
          </div>

          {/* Look 2 */}
          <div className="md:col-span-6 lg:col-span-7 relative aspect-[3/4] md:aspect-auto overflow-hidden rounded-xl bg-surface border border-border group">
            <Image
              src={lookbookItems[1].image}
              alt={lookbookItems[1].title}
              fill
              sizes="(max-width: 640px) 50vw, 60vw"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-main/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] uppercase tracking-wider text-accent-gold font-medium">
                {lookbookItems[1].season}
              </span>
              <h3 className="font-serif text-sm sm:text-base font-medium">
                {lookbookItems[1].title}
              </h3>
            </div>
          </div>

          {/* Look 3 */}
          <div className="md:col-span-6 lg:col-span-7 relative aspect-[3/4] md:aspect-auto overflow-hidden rounded-xl bg-surface border border-border group">
            <Image
              src={lookbookItems[2].image}
              alt={lookbookItems[2].title}
              fill
              sizes="(max-width: 640px) 50vw, 60vw"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-main/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] uppercase tracking-wider text-accent-gold font-medium">
                {lookbookItems[2].season}
              </span>
              <h3 className="font-serif text-sm sm:text-base font-medium">
                {lookbookItems[2].title}
              </h3>
            </div>
          </div>

          {/* Look 4 */}
          <div className="md:col-span-6 lg:col-span-5 relative aspect-[3/4] overflow-hidden rounded-xl bg-surface border border-border group">
            <Image
              src={lookbookItems[3].image}
              alt={lookbookItems[3].title}
              fill
              sizes="(max-width: 640px) 50vw, 40vw"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-main/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] uppercase tracking-wider text-accent-gold font-medium">
                {lookbookItems[3].season}
              </span>
              <h3 className="font-serif text-sm sm:text-base font-medium">
                {lookbookItems[3].title}
              </h3>
            </div>
          </div>
        </div>

        {/* Mobile View All Button */}
        <div className="sm:hidden pt-6">
          <Button href="/gallery" variant="outline" fullWidth size="md">
            Explore the Lookbook
          </Button>
        </div>
      </Container>
    </section>
  );
}
