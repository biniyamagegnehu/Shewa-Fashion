"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FilterOption } from "@/lib/products";
import { ShopFilters } from "@/components/shop/shop-filters";

interface MobileFilterDrawerProps {
  categories: FilterOption[];
  collections: FilterOption[];
  totalCount: number;
}

export function MobileFilterDrawer({
  categories,
  collections,
  totalCount,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  // Calculate active filter count
  const activeFilters = [
    searchParams.get("category"),
    searchParams.get("collection"),
    searchParams.get("availability") === "available" ? "available" : null,
    searchParams.get("q"),
  ].filter(Boolean).length;

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold bg-surface border border-border rounded-xl text-main hover:bg-background transition-colors shadow-xs"
        aria-label="Open filter menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-4 h-4 text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
          />
        </svg>
        <span>Filters</span>
        {activeFilters > 0 && (
          <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
            {activeFilters}
          </span>
        )}
      </button>

      {/* Slide-over Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-main/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs sm:max-w-sm bg-surface shadow-2xl flex flex-col justify-between">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-semibold text-main">Filters</h3>
                  {activeFilters > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary font-semibold">
                      {activeFilters} active
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-secondary hover:text-main rounded-lg transition-colors"
                  aria-label="Close filter menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Filters Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <ShopFilters
                  categories={categories}
                  collections={collections}
                  onFilterApplied={() => {
                    // keep open so user can adjust multiple filters
                  }}
                />
              </div>

              {/* Footer with Apply Button */}
              <div className="p-4 sm:p-6 border-t border-border bg-background/50">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-sm text-center"
                >
                  View {totalCount} {totalCount === 1 ? "Product" : "Products"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
