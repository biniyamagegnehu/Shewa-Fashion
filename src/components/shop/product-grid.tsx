"use client";

import React from "react";
import Link from "next/link";
import { CatalogProduct } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";

interface ProductGridProps {
  products: CatalogProduct[];
  hasActiveFilters?: boolean;
}

export function ProductGrid({ products, hasActiveFilters = false }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="w-full py-16 sm:py-24 px-4 flex flex-col items-center justify-center text-center bg-surface border border-border/80 rounded-2xl shadow-xs">
        {/* Empty State Icon */}
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary mb-5">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-main mb-2">
          No Products Found
        </h3>

        <p className="text-sm sm:text-base text-secondary max-w-md mb-6 leading-relaxed">
          {hasActiveFilters
            ? "We couldn't find any products matching your selected search or filter criteria. Try adjusting your selections or clearing your filters."
            : "The catalogue is currently updating with our latest artisan collections. Please check back shortly."}
        </p>

        {hasActiveFilters ? (
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors shadow-xs"
          >
            Clear All Filters
          </Link>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors shadow-xs"
          >
            Return to Homepage
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
