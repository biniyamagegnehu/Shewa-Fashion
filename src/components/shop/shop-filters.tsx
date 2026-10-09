"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterOption } from "@/lib/products";
import { cn } from "@/lib/utils";

interface ShopFiltersProps {
  categories: FilterOption[];
  collections: FilterOption[];
  className?: string;
  onFilterApplied?: () => void;
}

export function ShopFilters({
  categories,
  collections,
  className = "",
  onFilterApplied,
}: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") ?? "all";
  const currentCollection = searchParams.get("collection") ?? "all";
  const currentAvailability = searchParams.get("availability") ?? "all";

  const hasActiveFilters = Boolean(
    (currentCategory && currentCategory !== "all") ||
    (currentCollection && currentCollection !== "all") ||
    (currentAvailability && currentAvailability !== "all") ||
    searchParams.get("q")
  );

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // Reset pagination
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      if (onFilterApplied) onFilterApplied();
    });
  };

  const handleClearAll = () => {
    startTransition(() => {
      // Keep only sort if set, or completely clear
      const sort = searchParams.get("sort");
      const url = sort ? `${pathname}?sort=${sort}` : pathname;
      router.push(url, { scroll: false });
      if (onFilterApplied) onFilterApplied();
    });
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header with Clear button */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="font-serif text-base font-semibold text-main tracking-tight">
          Filter Catalogue
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={isPending}
            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Category
        </h4>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateParam("category", "all")}
            disabled={isPending}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left font-medium",
              currentCategory === "all"
                ? "bg-primary-light text-primary font-semibold"
                : "text-main hover:bg-background"
            )}
          >
            <span>All Categories</span>
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => updateParam("category", cat.slug)}
                disabled={isPending}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left",
                  isSelected
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-main hover:bg-background"
                )}
              >
                <span>{cat.label}</span>
                {typeof cat.count === "number" && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-sans font-medium",
                      isSelected
                        ? "bg-primary/20 text-primary"
                        : "text-secondary/70 bg-background"
                    )}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Collection Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Collection
        </h4>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateParam("collection", "all")}
            disabled={isPending}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left font-medium",
              currentCollection === "all"
                ? "bg-primary-light text-primary font-semibold"
                : "text-main hover:bg-background"
            )}
          >
            <span>All Collections</span>
          </button>

          {collections.map((col) => {
            const isSelected = currentCollection === col.slug;
            return (
              <button
                key={col.slug}
                type="button"
                onClick={() => updateParam("collection", col.slug)}
                disabled={isPending}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left",
                  isSelected
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-main hover:bg-background"
                )}
              >
                <span>{col.label}</span>
                {typeof col.count === "number" && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-sans font-medium",
                      isSelected
                        ? "bg-primary/20 text-primary"
                        : "text-secondary/70 bg-background"
                    )}
                  >
                    {col.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Availability Filter */}
      <div className="space-y-3 pt-2 border-t border-border">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Availability
        </h4>
        <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background cursor-pointer select-none">
          <input
            type="checkbox"
            checked={currentAvailability === "available"}
            onChange={(e) =>
              updateParam("availability", e.target.checked ? "available" : "all")
            }
            disabled={isPending}
            className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border text-primary cursor-pointer accent-[#5B9BD5]"
          />
          <span className="text-sm font-medium text-main">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}
