import React from "react";
import { Container } from "@/components/ui/container";

export default function ProductDetailLoading() {
  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb Skeleton */}
        <div className="w-48 h-4 bg-border/60 rounded-md animate-pulse mb-8" />

        {/* Two-Column Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Gallery Column Skeleton (5 cols) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4">
            <div className="aspect-[3/4] w-full bg-border/70 rounded-2xl animate-pulse" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-[3/4] w-20 bg-border/50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Product Details Column Skeleton (6 cols) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 pt-2">
            <div className="space-y-3">
              <div className="w-24 h-4 bg-border/60 rounded-md animate-pulse" />
              <div className="w-3/4 h-8 sm:h-10 bg-border/80 rounded-lg animate-pulse" />
              <div className="w-32 h-6 bg-border/70 rounded-md animate-pulse" />
            </div>

            <div className="space-y-2 pt-2">
              <div className="w-full h-4 bg-border/50 rounded-md animate-pulse" />
              <div className="w-5/6 h-4 bg-border/50 rounded-md animate-pulse" />
              <div className="w-2/3 h-4 bg-border/50 rounded-md animate-pulse" />
            </div>

            <div className="space-y-3 pt-4 border-t border-border/80">
              <div className="w-20 h-4 bg-border/60 rounded-md animate-pulse" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-12 h-10 bg-border/60 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-border/80 space-y-3">
              <div className="w-full h-14 bg-border/40 rounded-xl animate-pulse" />
              <div className="w-full h-12 bg-border/70 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
