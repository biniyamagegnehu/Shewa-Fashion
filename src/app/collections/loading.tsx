import React from "react";
import { Container } from "@/components/ui/container";

export default function CollectionsLoading() {
  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb skeleton */}
        <div className="w-32 h-4 bg-border/60 rounded-md animate-pulse mb-4" />

        {/* Header skeleton */}
        <div className="mb-10 sm:mb-14 space-y-3">
          <div className="w-24 h-3 bg-border/50 rounded-sm animate-pulse" />
          <div className="w-48 h-9 bg-border/80 rounded-lg animate-pulse" />
          <div className="w-full max-w-lg h-4 bg-border/50 rounded-md animate-pulse" />
        </div>

        {/* Collection cards skeleton */}
        <div className="space-y-6 sm:space-y-8">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden border border-border grid grid-cols-1 md:grid-cols-12"
            >
              <div className="md:col-span-5 aspect-[16/9] md:aspect-auto md:min-h-[260px] bg-border/60 animate-pulse" />
              <div className="md:col-span-7 p-6 sm:p-8 space-y-4">
                <div className="w-28 h-6 bg-border/60 rounded-full animate-pulse" />
                <div className="w-48 h-8 bg-border/80 rounded-lg animate-pulse" />
                <div className="w-full h-4 bg-border/50 rounded-md animate-pulse" />
                <div className="w-3/4 h-4 bg-border/40 rounded-md animate-pulse" />
                <div className="w-32 h-5 bg-border/60 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
