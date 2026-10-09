import React from "react";
import { Container } from "@/components/ui/container";

export default function ShopLoading() {
  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb Skeleton */}
        <div className="w-32 h-4 bg-border/60 rounded-md animate-pulse mb-4" />

        {/* Header Skeleton */}
        <div className="mb-8 space-y-3">
          <div className="w-48 sm:w-64 h-8 sm:h-10 bg-border/80 rounded-lg animate-pulse" />
          <div className="w-full max-w-lg h-4 bg-border/50 rounded-md animate-pulse" />
        </div>

        {/* Category Pills Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {[80, 95, 80, 75, 85, 80, 110].map((width, idx) => (
            <div
              key={idx}
              style={{ width: `${width}px` }}
              className="h-9 bg-border/60 rounded-full animate-pulse shrink-0"
            />
          ))}
        </div>

        {/* Toolbar Skeleton (Search & Sort) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-border/80 mb-8">
          <div className="w-full sm:max-w-xs h-10 bg-border/60 rounded-xl animate-pulse" />
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="w-24 h-9 bg-border/60 rounded-xl animate-pulse" />
            <div className="w-32 h-9 bg-border/60 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xl:gap-12 items-start">
          {/* Desktop Filter Sidebar Skeleton */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="w-32 h-5 bg-border/80 rounded-md animate-pulse" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full h-8 bg-border/40 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="w-32 h-5 bg-border/80 rounded-md animate-pulse pt-4" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-8 bg-border/40 rounded-lg animate-pulse" />
              ))}
            </div>
          </aside>

          {/* Product Grid Skeleton */}
          <section className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="aspect-[3/4] w-full bg-border/70 rounded-xl animate-pulse" />
                  <div className="w-20 h-3 bg-border/50 rounded-sm animate-pulse" />
                  <div className="w-40 h-5 bg-border/70 rounded-md animate-pulse" />
                  <div className="w-24 h-4 bg-border/60 rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
