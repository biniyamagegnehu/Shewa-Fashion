"use client";

import React, { useState } from "react";
import { ProductDetailOption } from "@/lib/products";
import { cn } from "@/lib/utils";

interface ProductOptionsProps {
  options: ProductDetailOption[];
}

export function ProductOptions({ options }: ProductOptionsProps) {
  const safeOptions = options || [];

  // Group options by type
  const sizes = safeOptions.filter((o) => o.type === "SIZE");
  const shoeSizes = safeOptions.filter((o) => o.type === "SHOE_SIZE");
  const colors = safeOptions.filter((o) => o.type === "COLOR");
  const oneSizes = safeOptions.filter((o) => o.type === "ONE_SIZE");

  // Selection state for each group (called unconditionally)
  const [selectedSize, setSelectedSize] = useState<string>(
    sizes[0]?.value ?? ""
  );
  const [selectedShoeSize, setSelectedShoeSize] = useState<string>(
    shoeSizes[0]?.value ?? ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    colors[0]?.value ?? ""
  );

  // If no options exist, return null
  if (safeOptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 pt-4 border-t border-border/80">
      {/* 1. Clothing Sizes */}
      {sizes.length > 0 && (
        <fieldset className="space-y-2.5">
          <div className="flex items-center justify-between text-xs tracking-wider uppercase">
            <legend className="font-semibold text-main">
              Size
            </legend>
            {selectedSize && (
              <span className="text-secondary font-medium lowercase">
                selected: <strong className="text-main font-semibold uppercase">{selectedSize}</strong>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Clothing size options">
            {sizes.map((opt) => {
              const isSelected = selectedSize === opt.value;
              return (
                <button
                  key={opt.id || opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedSize(opt.value)}
                  className={cn(
                    "min-w-12 h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer flex items-center justify-center shadow-2xs",
                    isSelected
                      ? "bg-main text-white border-main shadow-xs"
                      : "bg-surface text-main border-border hover:border-primary/50 hover:bg-background"
                  )}
                >
                  {opt.value}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* 2. Shoe Sizes */}
      {shoeSizes.length > 0 && (
        <fieldset className="space-y-2.5">
          <div className="flex items-center justify-between text-xs tracking-wider uppercase">
            <legend className="font-semibold text-main">
              Shoe Size (EU)
            </legend>
            {selectedShoeSize && (
              <span className="text-secondary font-medium lowercase">
                selected: <strong className="text-main font-semibold">{selectedShoeSize}</strong>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Shoe size options">
            {shoeSizes.map((opt) => {
              const isSelected = selectedShoeSize === opt.value;
              return (
                <button
                  key={opt.id || opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedShoeSize(opt.value)}
                  className={cn(
                    "min-w-12 h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer flex items-center justify-center shadow-2xs",
                    isSelected
                      ? "bg-main text-white border-main shadow-xs"
                      : "bg-surface text-main border-border hover:border-primary/50 hover:bg-background"
                  )}
                >
                  {opt.value}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* 3. Colors */}
      {colors.length > 0 && (
        <fieldset className="space-y-2.5">
          <div className="flex items-center justify-between text-xs tracking-wider uppercase">
            <legend className="font-semibold text-main">
              Color
            </legend>
            {selectedColor && (
              <span className="text-secondary font-medium lowercase">
                selected: <strong className="text-main font-semibold capitalize">{selectedColor}</strong>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Color options">
            {colors.map((opt) => {
              const isSelected = selectedColor === opt.value;
              return (
                <button
                  key={opt.id || opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedColor(opt.value)}
                  className={cn(
                    "px-4 h-10 rounded-xl text-xs sm:text-sm font-medium transition-all border cursor-pointer flex items-center gap-2 shadow-2xs",
                    isSelected
                      ? "bg-primary-light text-primary border-primary font-semibold shadow-xs"
                      : "bg-surface text-main border-border hover:border-primary/50 hover:bg-background"
                  )}
                >
                  <span>{opt.value}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* 4. One Size */}
      {oneSizes.length > 0 && sizes.length === 0 && shoeSizes.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-secondary font-medium">
          <span className="px-3 py-1 rounded-full bg-background border border-border text-main font-semibold">
            One Size
          </span>
          <span>Standard universal artisan fit</span>
        </div>
      )}
    </div>
  );
}
