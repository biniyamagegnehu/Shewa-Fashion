import React from "react";
import { Container } from "@/components/ui/container";

export default function CategoriesLoading() {
  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb skeleton */}
        <div className="w-32 h-4 bg-border/60 rounded-md animate-pulse mb-4" />

        {/* Header skeleton */}
        <div className="mb-10 sm:mb-14 space-y-3">
          <div className="w-24 h-3 bg-border/50 rounded-sm animate-pulse" />
          <div className="w-56 h-9 bg-border/80 rounded-lg animate-pulse" />
          <div className="w-full max-w-lg h-4 bg-border/50 rounded-md animate-pulse" />
        </div>

        {/* Category grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="aspect-[3/4] w-full bg-border/60 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
