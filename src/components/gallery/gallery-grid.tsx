"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { GalleryItemRecord } from "@/lib/products";

interface GalleryGridProps {
  items: GalleryItemRecord[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedItem =
    selectedIndex !== null && items[selectedIndex]
      ? items[selectedIndex]
      : null;

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev !== null && prev < items.length - 1 ? prev + 1 : 0
    );
  }, [selectedIndex, items.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : items.length - 1
    );
  }, [selectedIndex, items.length]);

  // Keyboard navigation for modal lightbox
  useEffect(() => {
    if (selectedIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scrolling while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedIndex, handleClose, handleNext, handlePrev]);

  return (
    <div>
      {/* Editorial Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {items.map((item, index) => {
          // Asymmetric heights for an editorial fashion magazine feel
          const isLarge = index % 5 === 0;

          return (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-2xl bg-surface border border-border/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                isLarge ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              {/* Image Container with Button trigger */}
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl overflow-hidden block"
                aria-label={`View full editorial image: ${item.title}`}
              >
                <div
                  className={`relative w-full overflow-hidden bg-[#F0EFEB] ${
                    isLarge
                      ? "aspect-[16/10] sm:aspect-[16/9]"
                      : "aspect-[4/5] sm:aspect-[3/4]"
                  }`}
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.alt || item.title}
                      fill
                      sizes={
                        isLarge
                          ? "(max-width: 640px) 100vw, 66vw"
                          : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      }
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      priority={index < 2}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F0EFEB] text-secondary">
                      <span className="text-xs uppercase tracking-widest font-semibold">
                        Image Unavailable
                      </span>
                    </div>
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-main/80 via-main/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  {/* Text Overlay */}
                  <div className="absolute inset-0 p-5 sm:p-6 lg:p-8 flex flex-col justify-end text-white">
                    <span className="text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-accent-gold mb-1">
                      Look #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-white mb-1.5">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs sm:text-sm text-white/85 line-clamp-2 max-w-lg leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Expand indicator */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-white/70 group-hover:text-white transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
                        />
                      </svg>
                      <span>Click to enlarge</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-main/90 backdrop-blur-md transition-all animate-fadeIn"
          onClick={handleClose}
        >
          {/* Modal Container */}
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-surface rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-accent-gold block">
                  Shewa Lookbook Editorial
                </span>
                <h2
                  id="lightbox-title"
                  className="font-serif text-lg sm:text-xl font-medium text-main"
                >
                  {selectedItem.title}
                </h2>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-secondary/10 hover:bg-secondary/20 flex items-center justify-center text-main transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full max-h-[60vh] bg-[#F0EFEB] overflow-hidden">
              {selectedItem.imageUrl ? (
                <Image
                  src={selectedItem.imageUrl}
                  alt={selectedItem.alt || selectedItem.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1000px"
                  className="object-contain object-center"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-secondary text-sm">
                  Image Unavailable
                </div>
              )}

              {/* Navigation Arrows */}
              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-main/60 hover:bg-main/80 text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Previous image"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5 8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-main/60 hover:bg-main/80 text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Next image"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Modal Caption Footer */}
            {selectedItem.description && (
              <div className="p-4 sm:p-6 bg-surface border-t border-border">
                <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-2xl">
                  {selectedItem.description}
                </p>
                <div className="mt-2 text-[11px] text-secondary/70">
                  Use Left/Right arrow keys to navigate, Esc to close.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
