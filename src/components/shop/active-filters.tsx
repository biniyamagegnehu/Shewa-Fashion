"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterOption } from "@/lib/products";

interface ActiveFiltersProps {
  categories: FilterOption[];
  collections: FilterOption[];
  className?: string;
}

export function ActiveFilters({
  categories,
  collections,
  className = "",
}: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q");
  const categorySlug = searchParams.get("category");
  const collectionSlug = searchParams.get("collection");
  const availability = searchParams.get("availability");

  const categoryLabel =
    categories.find((c) => c.slug === categorySlug)?.label ?? categorySlug;
  const collectionLabel =
    collections.find((c) => c.slug === collectionSlug)?.label ?? collectionSlug;

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleClearAll = () => {
    startTransition(() => {
      const sort = searchParams.get("sort");
      const url = sort ? `${pathname}?sort=${sort}` : pathname;
      router.push(url, { scroll: false });
    });
  };

  const hasAnyFilter = Boolean(
    q || (categorySlug && categorySlug !== "all") || (collectionSlug && collectionSlug !== "all") || availability === "available"
  );

  if (!hasAnyFilter) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-2 pb-4 ${className}`}>
      <span className="text-xs font-medium text-secondary">Active filters:</span>

      {/* 1. Search Query */}
      {q && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-primary-light text-primary rounded-full border border-primary/20">
          <span>Search: &ldquo;{q}&rdquo;</span>
          <button
            type="button"
            onClick={() => removeParam("q")}
            disabled={isPending}
            className="hover:text-primary-hover p-0.5 rounded-full"
            aria-label={`Remove search filter for ${q}`}
          >
            ✕
          </button>
        </span>
      )}

      {/* 2. Category */}
      {categorySlug && categorySlug !== "all" && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-primary-light text-primary rounded-full border border-primary/20">
          <span>Category: {categoryLabel}</span>
          <button
            type="button"
            onClick={() => removeParam("category")}
            disabled={isPending}
            className="hover:text-primary-hover p-0.5 rounded-full"
            aria-label={`Remove category filter for ${categoryLabel}`}
          >
            ✕
          </button>
        </span>
      )}

      {/* 3. Collection */}
      {collectionSlug && collectionSlug !== "all" && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-accent-gold-light text-accent-gold-hover rounded-full border border-accent-gold/25">
          <span>Collection: {collectionLabel}</span>
          <button
            type="button"
            onClick={() => removeParam("collection")}
            disabled={isPending}
            className="hover:opacity-80 p-0.5 rounded-full"
            aria-label={`Remove collection filter for ${collectionLabel}`}
          >
            ✕
          </button>
        </span>
      )}

      {/* 4. Availability */}
      {availability === "available" && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-success/10 text-success rounded-full border border-success/20">
          <span>In Stock Only</span>
          <button
            type="button"
            onClick={() => removeParam("availability")}
            disabled={isPending}
            className="hover:opacity-80 p-0.5 rounded-full"
            aria-label="Remove in stock availability filter"
          >
            ✕
          </button>
        </span>
      )}

      {/* Clear All button */}
      <button
        type="button"
        onClick={handleClearAll}
        disabled={isPending}
        className="text-xs text-secondary hover:text-main font-medium underline underline-offset-2 ml-1 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
