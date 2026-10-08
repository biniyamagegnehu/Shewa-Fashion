import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { NewArrivals } from "@/components/home/new-arrivals";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { BestSellers } from "@/components/home/best-sellers";
import { HeritageSection } from "@/components/home/heritage-section";
import { LookbookPreview } from "@/components/home/lookbook-preview";
import { BrandStory } from "@/components/home/brand-story";
import { HomeCta } from "@/components/home/home-cta";

export const metadata: Metadata = {
  title: "Shewa Fashion | Modern Ethiopian Fashion & Contemporary Apparel",
  description:
    "Discover contemporary Ethiopian fashion, handcrafted leather footwear, structural bags, and artisan accessories. Inspired by Shewa, designed for the modern wardrobe.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero / Campaign */}
      <Hero />

      {/* 2. Shop by Category */}
      <CategoryGrid />

      {/* 3. New Arrivals */}
      <NewArrivals />

      {/* 4. Featured Collection */}
      <FeaturedCollection />

      {/* 5. Best Sellers */}
      <BestSellers />

      {/* 6. Ethiopian Heritage */}
      <HeritageSection />

      {/* 7. Lookbook / Gallery Preview */}
      <LookbookPreview />

      {/* 8. Brand Story */}
      <BrandStory />

      {/* 9. Final CTA */}
      <HomeCta />
    </div>
  );
}
