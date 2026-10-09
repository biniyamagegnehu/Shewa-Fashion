import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function ProductNotFound() {
  return (
    <main className="py-20 sm:py-32 bg-background min-h-[70vh] flex items-center">
      <Container>
        <div className="max-w-md mx-auto text-center p-8 sm:p-12 bg-surface border border-border/80 rounded-2xl shadow-sm">
          {/* Subtle Icon */}
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary mx-auto mb-5">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.12 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </div>

          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary block mb-2">
            Catalogue
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-main mb-3">
            Product Not Found
          </h1>

          <p className="text-sm text-secondary mb-8 leading-relaxed">
            The piece you are looking for may have concluded its limited artisan release,
            been renamed, or the link may have expired.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors shadow-xs"
            >
              Explore Collection
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-surface border border-border hover:bg-background text-main text-sm font-semibold transition-colors shadow-xs"
            >
              Return Home
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
