"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function CollectionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Collections page error:", error.message);
  }, [error]);

  return (
    <main className="py-16 sm:py-24 bg-background min-h-[60vh] flex items-center">
      <Container>
        <div className="max-w-md mx-auto text-center p-8 bg-surface border border-border/80 rounded-2xl shadow-sm">
          <div className="w-14 h-14 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </div>

          <h2 className="font-serif text-2xl font-semibold text-main mb-2">
            Unable to Load Collections
          </h2>

          <p className="text-sm text-secondary mb-6 leading-relaxed">
            We encountered a temporary issue retrieving the collections.
            Please try again or browse all products.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
            >
              Try Again
            </button>
            <Link
              href="/shop"
              className="px-5 py-2.5 bg-surface border border-border hover:bg-background text-main text-sm font-semibold rounded-xl transition-colors shadow-xs"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
