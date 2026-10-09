"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLinks } from "@/components/layout/nav-links";
import { NavItem, SocialLink } from "@/types";

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
function NavLinksFallback() {
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium tracking-wide transition-colors py-2 relative text-secondary hover:text-main"
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-border/80 transition-colors">
        <Container>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="font-serif text-lg sm:text-xl md:text-2xl font-semibold tracking-[0.18em] uppercase text-main hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
              >
                Shewa Fashion
                <span className="text-accent-gold font-normal">.</span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Main Navigation"
              className="hidden lg:flex items-center gap-8"
            >
              {/* NavLinks uses usePathname — wrap in Suspense to satisfy Next.js prerender */}
              <Suspense fallback={<NavLinksFallback />}>
                <NavLinks items={navItems} />
              </Suspense>
            </nav>

            {/* Right Action Icons & CTA */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Action (Placeholder) */}
              <button
                type="button"
                aria-label="Search collection"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-secondary hover:text-main hover:bg-primary-light/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

              {/* Shopping Bag Action (Placeholder) */}
              <button
                type="button"
                aria-label="Shopping bag (0 items)"
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-secondary hover:text-main hover:bg-primary-light/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                <span className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full">
                  0
                </span>
              </button>

              {/* Desktop CTA Button */}
              <div className="hidden sm:block ml-2">
                <Button href="/shop" size="sm" variant="primary">
                  Explore Shop
                </Button>
              </div>

              {/* Mobile Hamburger Trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-secondary hover:text-main hover:bg-primary-light/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
