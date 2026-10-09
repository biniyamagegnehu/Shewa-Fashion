"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  imageAlt?: string;
  category?: string | { id?: string; name: string; slug: string } | null;
  categoryLabel?: string;
  collection?: string | { id?: string; name: string; slug: string } | null;
  badge?: string;
  available?: boolean;
  featured?: boolean;
  description?: string;
}

export interface ProductCardProps {
  product: ProductCardData;
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  // Resolve category label
  const categoryText =
    typeof product.category === "object" && product.category !== null
      ? product.category.name
      : product.categoryLabel ||
        (typeof product.category === "string" ? product.category : undefined);

  // Resolve collection label
  const collectionText =
    typeof product.collection === "object" && product.collection !== null
      ? product.collection.name
      : typeof product.collection === "string"
      ? product.collection
      : undefined;

  // Primary label to show in header row
  const metaLabel = collectionText || categoryText || "Fashion";

  // Badge priority: explicit badge > featured badge
  const displayBadge =
    product.badge || (product.featured ? "FEATURED" : undefined);

  const hasImage = Boolean(product.image && product.image.trim().length > 0 && !imageError);

  return (
    <article
      className={cn(
        "group relative flex flex-col w-full text-left transition-all",
        className
      )}
    >
      <Link
        href={`/shop/${product.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-xl"
        aria-label={`${product.name}, priced at ${formatPrice(product.price)}`}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F0EFEB] border border-border/80">
          {hasImage && product.image ? (
            <Image
              src={product.image}
              alt={product.imageAlt || product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              onError={() => setImageError(true)}
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            /* Missing / fallback image container */
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-primary-light/40 to-background">
              <svg
                className="w-12 h-12 text-secondary/40 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <span className="font-serif text-xs text-secondary/70 tracking-wider uppercase">
                Shewa Fashion
              </span>
            </div>
          )}

          {/* Badge Overlay */}
          {displayBadge && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className={cn(
                  "px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full shadow-xs",
                  displayBadge === "NEW" && "bg-primary text-white",
                  displayBadge === "BESTSELLER" && "bg-accent-gold text-white",
                  displayBadge === "LIMITED" && "bg-main text-white",
                  displayBadge === "FEATURED" && "bg-primary-light text-primary border border-primary/20"
                )}
              >
                {displayBadge}
              </span>
            </div>
          )}

          {/* Availability Overlay indicator if out of stock */}
          {product.available === false && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-main text-white px-3 py-1.5 text-xs font-medium uppercase tracking-widest rounded-md">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="pt-3.5 pb-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-secondary tracking-wider uppercase font-medium">
            <span className="truncate pr-2">{metaLabel}</span>
            {product.available !== false ? (
              <span className="text-[11px] text-success font-medium shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                in stock
              </span>
            ) : (
              <span className="text-[11px] text-secondary/70 font-medium shrink-0">
                out of stock
              </span>
            )}
          </div>

          <h3 className="font-serif text-base sm:text-lg font-medium text-main group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          <p className="text-sm sm:text-base font-semibold text-main pt-0.5">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </article>
  );
}
