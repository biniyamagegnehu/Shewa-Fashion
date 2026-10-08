"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem, SocialLink } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  socialLinks: SocialLink[];
}

export function MobileNav({
  isOpen,
  onClose,
  items,
  socialLinks,
}: MobileNavProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on mount
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="fixed inset-0 z-50 lg:hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-main/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-surface shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <Link
              href="/"
              onClick={onClose}
              className="font-serif text-lg font-semibold tracking-[0.16em] uppercase text-main"
            >
              Shewa Fashion
              <span className="text-accent-gold ml-0.5">.</span>
            </Link>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-secondary hover:text-main hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            id="mobile-navigation"
            aria-label="Mobile Navigation"
            className="flex flex-col gap-1 py-6"
          >
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "min-h-[48px] px-4 rounded-lg flex items-center justify-between text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary-light text-primary font-semibold"
                      : "text-main hover:bg-background hover:text-primary"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Bottom Info & CTA */}
        <div className="pt-6 border-t border-border flex flex-col gap-4">
          <Button href="/shop" onClick={onClose} fullWidth size="md">
            Explore Shop
          </Button>

          <div className="text-xs text-secondary space-y-1 pt-2">
            <p className="font-medium text-main">Addis Ababa, Ethiopia</p>
            <p>Mon - Sat: 9:00 AM - 7:00 PM</p>
            <p className="pt-1">
              <a
                href="tel:+251911234567"
                className="hover:text-primary transition-colors"
              >
                +251 91 123 4567
              </a>
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                aria-label={social.ariaLabel}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-md text-secondary hover:text-primary hover:bg-primary-light/40 transition-colors text-xs font-semibold"
              >
                {social.name.slice(0, 2)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
