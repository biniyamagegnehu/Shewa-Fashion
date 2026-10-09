"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterOption } from "@/lib/products";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  categories: FilterOption[];
  className?: string;
}

export function CategoryPills({ categories, className = "" }: CategoryPillsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") ?? "all";

  const handleSelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }

    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-2 ${className}`}>
      <div className="flex items-center gap-2 min-w-max">
        {/* All Pill */}
        <button
          type="button"
          onClick={() => handleSelect("all")}
          disabled={isPending}
          className={cn(
            "px-4 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all shadow-2xs whitespace-nowrap",
            currentCategory === "all"
              ? "bg-primary text-white shadow-xs font-semibold"
              : "bg-surface border border-border text-main hover:bg-background"
          )}
        >
          All Categories
        </button>

        {/* Category Pills */}
        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleSelect(cat.slug)}
              disabled={isPending}
              className={cn(
                "px-4 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all shadow-2xs whitespace-nowrap flex items-center gap-1.5",
                isActive
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "bg-surface border border-border text-main hover:bg-background"
              )}
            >
              <span>{cat.label}</span>
              {typeof cat.count === "number" && (
                <span
                  className={cn(
                    "text-[11px] px-1.5 py-0.2 rounded-full font-sans",
                    isActive ? "bg-white/20 text-white" : "text-secondary/70 bg-background"
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
  );
}
