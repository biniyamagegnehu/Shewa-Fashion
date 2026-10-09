"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProductDetailImage } from "@/lib/products";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductDetailImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[selectedIndex] : null;
  const isCurrentFailed = currentImage ? failedImages[selectedIndex] : true;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Hero Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#F0EFEB] border border-border/80 shadow-xs">
        {hasImages && currentImage && !isCurrentFailed ? (
          <Image
            src={currentImage.url}
            alt={currentImage.alt || productName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
            priority
            onError={() => handleImageError(selectedIndex)}
            className="object-cover object-center transition-all duration-300"
          />
        ) : (
          /* Graceful Missing/Failed Image Fallback */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-primary-light/40 to-background">
            <svg
              className="w-16 h-16 text-secondary/40 mb-3"
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
            <span className="font-serif text-sm font-medium text-main">
              {productName}
            </span>
            <span className="text-xs text-secondary mt-1">
              Image preview currently unavailable
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails Row (Only visible when 2 or more images exist) */}
      {images.length > 1 && (
        <div
          role="region"
          aria-label="Product thumbnails"
          className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1"
        >
          {images.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            const isThumbFailed = failedImages[idx];

            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Select photo ${idx + 1} of ${productName}`}
                aria-pressed={isSelected}
                className={cn(
                  "relative aspect-[3/4] w-20 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-[#F0EFEB] border transition-all cursor-pointer",
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                    : "border-border/80 hover:border-primary/50 opacity-75 hover:opacity-100"
                )}
              >
                {!isThumbFailed ? (
                  <Image
                    src={img.url}
                    alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                    fill
                    sizes="96px"
                    onError={() => handleImageError(idx)}
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-background text-[10px] text-secondary">
                    Thumbnail
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
