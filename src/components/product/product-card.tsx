import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/data/mock-data";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col w-full text-left transition-all",
        className
      )}
    >
      <Link
        href={`/shop?product=${product.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-xl"
        aria-label={`${product.name}, priced at ${formatPrice(product.price)}`}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F0EFEB] border border-border/80">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 45vw, 25vw"
            priority={priority}
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Badge Overlay */}
          {product.badge && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className={cn(
                  "px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full shadow-xs",
                  product.badge === "NEW" && "bg-primary text-white",
                  product.badge === "BESTSELLER" && "bg-accent-gold text-white",
                  product.badge === "LIMITED" && "bg-main text-white",
                  product.badge === "FEATURED" && "bg-primary-light text-primary"
                )}
              >
                {product.badge}
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="pt-3.5 pb-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-secondary tracking-wider uppercase font-medium">
            <span>{product.collection || product.categoryLabel}</span>
            {product.available && (
              <span className="text-[11px] text-success font-normal lowercase">
                in stock
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
