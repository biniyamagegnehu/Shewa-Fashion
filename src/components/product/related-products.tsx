import React from "react";
import { CatalogProduct } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";

interface RelatedProductsProps {
  products: CatalogProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-products-heading"
      className="pt-16 sm:pt-24 border-t border-border/80 mt-16 sm:mt-24"
    >
      <div className="flex flex-col items-start mb-8 sm:mb-12">
        <span className="text-xs font-semibold tracking-[0.16em] uppercase text-primary mb-1">
          Complete the Silhouette
        </span>
        <h2
          id="related-products-heading"
          className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-main"
        >
          You May Also Like
        </h2>
        <p className="mt-1 text-sm text-secondary">
          Curated pieces crafted with complementary fabrics and design aesthetics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
