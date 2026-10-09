"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

interface ShopSortProps {
  currentSort?: string;
  className?: string;
}

export function ShopSort({ currentSort = "featured", className = "" }: ShopSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeSort = searchParams.get("sort") ?? currentSort;

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSort === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }

    // Reset pagination to page 1 on sort change
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label
        htmlFor="catalog-sort"
        className="text-xs sm:text-sm font-medium text-secondary whitespace-nowrap"
      >
        Sort by:
      </label>

      <div className="relative inline-block">
        <select
          id="catalog-sort"
          value={activeSort}
          disabled={isPending}
          onChange={(e) => handleSortChange(e.target.value)}
          className="appearance-none bg-surface border border-border rounded-xl pl-3.5 pr-8 py-2 text-xs sm:text-sm font-medium text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-secondary">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
