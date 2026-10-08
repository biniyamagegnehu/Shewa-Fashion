import React from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { bestSellers } from "@/data/mock-data";

export function BestSellers() {
  return (
    <section aria-labelledby="best-sellers-heading" className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Customer Favorites"
          heading="Best Sellers"
          description="Our most coveted contemporary silhouettes, handcrafted leather goods, and everyday staples."
          className="mb-8 sm:mb-12"
        />

        {/* Distinct 2-column Grid on Mobile -> 4-column on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Best Sellers Button */}
        <div className="mt-8 sm:mt-12 text-center">
          <Button href="/shop" variant="secondary" size="md">
            Shop All Best Sellers
          </Button>
        </div>
      </Container>
    </section>
  );
}
