import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

interface FooterLink {
  label: string;
  href: string;
}

const exploreLinks: FooterLink[] = [
  { label: "Shop All", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "About Shewa", href: "/about" },
  { label: "Lookbook Gallery", href: "/gallery" },
  { label: "Contact Us", href: "/contact" },
];

const socialLinks = [
  { name: "Instagram", href: "#", handle: "@shewafashion" },
  { name: "Facebook", href: "#", handle: "shewafashion.et" },
  { name: "TikTok", href: "#", handle: "@shewafashion" },
  { name: "Telegram", href: "#", handle: "t.me/shewafashion" },
  { name: "WhatsApp", href: "#", handle: "+251 91 123 4567" },
];

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border mt-auto">
      <Container>
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="font-serif text-xl sm:text-2xl font-semibold tracking-[0.16em] uppercase text-main"
            >
              Shewa Fashion
              <span className="text-accent-gold ml-0.5">.</span>
            </Link>
            <p className="text-secondary text-sm leading-relaxed max-w-sm">
              Contemporary Ethiopian fashion celebrating authentic textile
              craftsmanship, timeless silhouettes, and everyday modern elegance.
            </p>
            <div className="inline-flex items-center gap-2 pt-1 text-xs font-medium text-accent-gold">
              <span className="w-2 h-2 rounded-full bg-accent-gold" />
              <span>Addis Ababa • Crafted with Heritage</span>
            </div>
          </div>

          {/* Explore Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-main">
              Explore
            </h3>
            <ul className="flex flex-col gap-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary hover:text-primary transition-colors py-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Studio */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-main">
              Studio & Contact
            </h3>
            <div className="text-sm text-secondary flex flex-col gap-2">
              <p className="leading-relaxed">
                Bole Sub-City, Next to Edna Mall
                <br />
                Addis Ababa, Ethiopia
              </p>
              <p className="pt-1">
                <a
                  href="tel:+251911234567"
                  className="hover:text-primary transition-colors"
                >
                  +251 91 123 4567
                </a>
              </p>
              <p>
                <a
                  href="mailto:hello@shewafashion.com"
                  className="hover:text-primary transition-colors"
                >
                  hello@shewafashion.com
                </a>
              </p>
              <p className="text-xs text-secondary/80 pt-1">
                Mon - Sat: 9:00 AM - 7:00 PM (EAT)
              </p>
            </div>
          </div>

          {/* Social Channels */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-main">
              Connect
            </h3>
            <p className="text-sm text-secondary">
              Follow our latest seasonal drops, artisan stories, and style
              guides.
            </p>
            <ul className="flex flex-col gap-2">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    aria-label={`Follow Shewa Fashion on ${social.name}`}
                    className="text-sm text-secondary hover:text-primary transition-colors inline-flex items-center justify-between w-full max-w-[200px] py-1"
                  >
                    <span>{social.name}</span>
                    <span className="text-xs text-secondary/60">
                      {social.handle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Legal / Copyright Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
          <p>
            © 2026 Shewa Fashion. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="hover:text-primary transition-colors"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors"
              aria-label="Terms of Service"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors"
              aria-label="Store Information"
            >
              Store Info
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
