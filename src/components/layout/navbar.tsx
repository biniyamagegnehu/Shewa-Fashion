"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLinks } from "@/components/layout/nav-links";
import { NavItem, SocialLink } from "@/types";
import { cn } from "@/lib/utils";
import type { StoreSettingsRecord } from "@/lib/products";
import Image from "next/image";

// Global navigation destinations
const navItems: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const socialLinks: SocialLink[] = [
  { name: "Instagram", href: "#", ariaLabel: "Follow Shewa Fashion on Instagram" },
  { name: "TikTok", href: "#", ariaLabel: "Follow Shewa Fashion on TikTok" },
  { name: "Telegram", href: "#", ariaLabel: "Join Shewa Fashion on Telegram" },
  { name: "WhatsApp", href: "#", ariaLabel: "Chat with Shewa Fashion on WhatsApp" },
];

/** Fallback nav links rendered during Suspense (no active state). */
function NavLinksFallback({ isTransparent }: { isTransparent?: boolean }) {
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium tracking-wide transition-colors py-2 relative",
            isTransparent
              ? "text-white/80 hover:text-white"
              : "text-secondary hover:text-main"
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function Navbar({ settings }: { settings?: StoreSettingsRecord | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolledOnHome, setIsScrolledOnHome] = useState(false);

  useEffect(() => {
    if (!isHome) {
      return;
    }

    const handleScroll = () => {
      const heroEl =
        document.getElementById("homepage-hero") ||
        document.querySelector("section[aria-labelledby='hero-title']");

      if (heroEl) {
        const heroBottom = heroEl.getBoundingClientRect().bottom;
        // Keep header transparent until hero finishes scrolling out of view
        setIsScrolledOnHome(heroBottom <= 70);
      } else {
        setIsScrolledOnHome(window.scrollY > window.innerHeight * 0.75);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const isScrolled = !isHome || isScrolledOnHome;
  const isHeroTransparent = isHome && !isScrolled;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          isHeroTransparent
            ? "bg-transparent border-0 border-none shadow-none text-white"
            : "bg-surface/90 backdrop-blur-md border-b border-border/80 text-main shadow-xs"
        )}
      >
        <Container>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className={cn(
                  "font-serif text-lg sm:text-xl md:text-2xl font-semibold tracking-[0.18em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs flex items-center gap-2.5",
                  isHeroTransparent
                    ? "text-white hover:text-white/90"
                    : "text-main hover:opacity-90"
                )}
              >
                {settings?.logoUrl && (
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                    <Image
                      src={settings.logoUrl}
                      alt={settings.storeName || "Shewa Fashion"}
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                )}
                <span>
                  {settings?.storeName || "Shewa Fashion"}
                  <span className="text-accent-gold font-normal">.</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Main Navigation"
              className="hidden lg:flex items-center gap-8"
            >
              {/* NavLinks uses usePathname — wrap in Suspense to satisfy Next.js prerender */}
              <Suspense fallback={<NavLinksFallback isTransparent={isHeroTransparent} />}>
                <NavLinks items={navItems} isTransparent={isHeroTransparent} />
              </Suspense>
            </nav>

            {/* Right Action Icons & CTA */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Action (Placeholder) */}
              <button
                type="button"
                aria-label="Search collection"
                className={cn(
                  "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isHeroTransparent
                    ? "text-white/90 hover:text-white hover:bg-white/10"
                    : "text-secondary hover:text-main hover:bg-primary-light/30"
                )}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.75}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </button>

              {/* Desktop CTA Button */}
              <div className="hidden sm:block ml-2">
                {isHeroTransparent ? (
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center font-medium transition-all duration-150 ease-out min-h-[40px] px-4 py-2 text-xs sm:text-sm rounded-full bg-white text-main hover:bg-white/90 shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                  >
                    Explore Shop
                  </Link>
                ) : (
                  <Button href="/shop" size="sm" variant="primary">
                    Explore Shop
                  </Button>
                )}
              </div>

              {/* Mobile Hamburger Trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                className={cn(
                  "lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isHeroTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-secondary hover:text-main hover:bg-primary-light/30"
                )}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <Suspense fallback={null}>
        <MobileNav
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          items={navItems}
          socialLinks={socialLinks}
        />
      </Suspense>
    </>
  );
}
