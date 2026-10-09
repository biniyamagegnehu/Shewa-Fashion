import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

// Allow blocking route for Next.js 16 Cache Components
export const instant = false;

export const metadata: Metadata = {
  title: "About Us | Shewa Fashion",
  description:
    "Learn about Shewa Fashion — an Ethiopian fashion brand celebrating authentic textile craftsmanship, contemporary silhouettes, and everyday modern elegance.",
  openGraph: {
    title: "About Us | Shewa Fashion",
    description:
      "Celebrating Ethiopian textile craftsmanship and contemporary African silhouettes.",
  },
};

const brandValues = [
  {
    number: "01",
    title: "Artisan Heritage",
    description:
      "We celebrate centuries of Ethiopian textile tradition, drawing inspiration from generational weaving and leather crafting techniques to create modern pieces with soul.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Contemporary Silhouette",
    description:
      "Our designs balance refined architectural tailoring with relaxed everyday ease. We create versatile clothing for people who appreciate thoughtful, understated style.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Conscious Selection",
    description:
      "We prioritize natural fibers, raw organic cotton, pure linen, and responsibly sourced leather. Each item is produced in considered batches to reduce waste.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Cultural Pride & Expression",
    description:
      "Shewa Fashion represents the vibrant creative energy of Addis Ababa. We believe style is a quiet declaration of identity, individuality, and confidence.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253"
        />
      </svg>
    ),
  },
];

const materials = [
  {
    title: "Hand-Loomed Cotton",
    description:
      "Crafted with traditional pit and frame looms, our cotton textiles feature delicate textures and breathable weights tailored for modern silhouettes.",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
    alt: "Handwoven cotton fabric textures in warm natural hues",
  },
  {
    title: "Pure Breathable Linen",
    description:
      "Selected for natural drape and long-wearing durability, our linen collections offer effortless elegance across all seasons.",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
    alt: "Tailored linen dress showcasing natural fibers and clean finish",
  },
  {
    title: "Vegetable-Tanned Leather",
    description:
      "Sourced from regional workshops, our leather footwear and structural bags age gracefully, acquiring rich patina over time.",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    alt: "Artisan leather craft with hand-stitched detailing",
  },
];

export default function AboutPage() {
  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-2 text-xs text-secondary font-medium tracking-wide">
            <li>
              <Link href="/" className="hover:text-main transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-secondary/50">
              /
            </li>
            <li aria-current="page" className="text-main font-semibold">
              About
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-14 sm:mb-20">
          <div className="max-w-3xl mb-8 sm:mb-12">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-gold block mb-2">
              Our Story & Philosophy
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-main leading-[1.15]">
              Rooted in Heritage. Styled for Today.
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-secondary leading-relaxed">
              Shewa Fashion is a tribute to Ethiopian craftsmanship translated into
              contemporary wardrobe essentials. We honor traditional weaving and
              leatherworking traditions while creating clean, versatile silhouettes
              for everyday modern living.
            </p>
          </div>

          {/* Hero Editorial Imagery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch">
            <div className="md:col-span-7 relative aspect-[4/3] md:aspect-auto md:min-h-[420px] rounded-2xl overflow-hidden bg-surface border border-border shadow-xs">
              <Image
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80"
                alt="Contemporary Ethiopian fashion editorial showcasing handwoven garment"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-main/60 via-transparent to-transparent flex items-end p-6 sm:p-8 text-white">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-accent-gold font-semibold">
                    Studio Concept
                  </span>
                  <p className="font-serif text-lg sm:text-xl font-medium text-white/95 mt-1">
                    Contemporary lines meeting generational handcraft
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-4 sm:gap-6">
              <div className="relative aspect-square md:aspect-[16/10] rounded-2xl overflow-hidden bg-surface border border-border shadow-xs">
                <Image
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
                  alt="Detailed handwoven textile texture with gold accents"
                  fill
                  sizes="(max-width: 768px) 50vw, 42vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="relative aspect-square md:aspect-[16/10] rounded-2xl overflow-hidden bg-surface border border-border shadow-xs">
                <Image
                  src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80"
                  alt="Addis Ababa modern urban fashion look"
                  fill
                  sizes="(max-width: 768px) 50vw, 42vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Narrative Section */}
        <section
          aria-labelledby="brand-narrative-heading"
          className="mb-16 sm:mb-24 py-12 sm:py-16 px-6 sm:px-12 md:px-16 rounded-3xl bg-surface border border-border shadow-xs"
        >
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary block">
              The Journey
            </span>
            <h2
              id="brand-narrative-heading"
              className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-main leading-snug"
            >
              Fashion is more than apparel — it is a reflection of belonging, pride,
              and living heritage.
            </h2>
            <div className="w-12 h-0.5 bg-accent-gold mx-auto" aria-hidden="true" />
            <p className="text-secondary text-sm sm:text-base leading-relaxed">
              From our design studio in Bole, Addis Ababa, we explore how traditional
              Ethiopian textiles can effortlessly fit into modern lifestyles. Rather
              than treating heritage as something preserved in glass, we bring it
              directly into everyday wear: relaxed linen tunics, structured blazers,
              hand-stitched leather mules, and artisan woven tote bags.
            </p>
            <p className="text-secondary text-sm sm:text-base leading-relaxed">
              Every collection is designed to feel timeless rather than fleeting. We
              work with experienced weavers and craftspeople, honoring their pace,
              skill, and artistic integrity with fair and enduring partnerships.
            </p>
          </div>
        </section>

        {/* Brand Values Grid */}
        <section aria-labelledby="values-heading" className="mb-16 sm:mb-24">
          <div className="mb-10 sm:mb-14">
            <SectionHeading
              eyebrow="What Guides Us"
              heading="Our Core Values"
              description="Four principles that define how we design, source, and craft each Shewa Fashion release."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandValues.map((value) => (
              <div
                key={value.number}
                className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold tracking-widest text-accent-gold">
                      {value.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-main mb-3">
                    {value.title}
                  </h3>
                  <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Materials & Sourcing */}
        <section aria-labelledby="materials-heading" className="mb-16 sm:mb-24">
          <div className="mb-10 sm:mb-14">
            <SectionHeading
              eyebrow="Fabric & Texture"
              heading="Artisanal Materials"
              description="Each fabric is hand-selected for natural breathability, enduring texture, and comfortable all-day wear."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {materials.map((mat) => (
              <div
                key={mat.title}
                className="overflow-hidden rounded-2xl bg-surface border border-border shadow-xs group"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EFEB]">
                  <Image
                    src={mat.image}
                    alt={mat.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-main mb-2">
                    {mat.title}
                  </h3>
                  <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                    {mat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Callouts */}
        <section
          aria-labelledby="about-cta-heading"
          className="relative overflow-hidden rounded-3xl bg-main text-white p-8 sm:p-12 md:p-16 text-center"
        >
          {/* Subtle gold accent light */}
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-gold">
              Explore Our Work
            </span>
            <h2
              id="about-cta-heading"
              className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-tight"
            >
              Experience the Shewa Fashion Collection
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Explore our current catalog or get in touch with our team for styling
              inquiries and local fitting appointments in Addis Ababa.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button href="/shop" variant="primary" size="lg">
                Explore the Shop
              </Button>
              <Button
                href="/collections"
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white hover:text-main"
              >
                Curated Collections
              </Button>
              <Button
                href="/contact"
                variant="ghost"
                size="lg"
                className="text-white/90 hover:text-white"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
