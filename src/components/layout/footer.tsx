import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { StoreSettingsRecord } from "@/lib/products";

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

interface FooterProps {
  settings?: StoreSettingsRecord | null;
}

export function Footer({ settings }: FooterProps) {
  const storeName = settings?.storeName || "Shewa Fashion";
  const description =
    settings?.description ||
    "Contemporary Ethiopian fashion celebrating authentic textile craftsmanship, timeless silhouettes, and everyday modern elegance.";

  // Build active verified social links
  const activeSocials: { name: string; href: string; handle: string }[] = [];

  if (settings?.instagram) {
    const handle = settings.instagram
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
    const href = settings.instagram.startsWith("http")
      ? settings.instagram
      : `https://instagram.com/${handle}`;
    activeSocials.push({ name: "Instagram", href, handle: `@${handle}` });
  }

  if (settings?.telegram) {
    const handle = settings.telegram
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?t\.me\//, "");
    const href = settings.telegram.startsWith("http")
      ? settings.telegram
      : `https://t.me/${handle}`;
    activeSocials.push({ name: "Telegram", href, handle: `@${handle}` });
  }

  if (settings?.tiktok) {
    const handle = settings.tiktok
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/, "");
    const href = settings.tiktok.startsWith("http")
      ? settings.tiktok
      : `https://tiktok.com/@${handle}`;
    activeSocials.push({ name: "TikTok", href, handle: `@${handle}` });
  }

  if (settings?.facebook) {
    const handle = settings.facebook.replace(
      /^https?:\/\/(www\.)?facebook\.com\//,
      ""
    );
    const href = settings.facebook.startsWith("http")
      ? settings.facebook
      : `https://facebook.com/${handle}`;
    activeSocials.push({ name: "Facebook", href, handle });
  }

  if (settings?.whatsapp) {
    const num = settings.whatsapp.replace(/[^0-9]/g, "");
    const href = `https://wa.me/${num}`;
    activeSocials.push({ name: "WhatsApp", href, handle: settings.whatsapp });
  }

  const hasContactInfo = Boolean(
    settings?.address ||
      settings?.phone ||
      settings?.email ||
      settings?.openingHours
  );

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
              {storeName}
              <span className="text-accent-gold ml-0.5">.</span>
            </Link>
            <p className="text-secondary text-sm leading-relaxed max-w-sm">
              {description}
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
              {settings?.address ? (
                <p className="leading-relaxed whitespace-pre-line">
                  {settings.address}
                </p>
              ) : (
                <p className="leading-relaxed">Addis Ababa, Ethiopia</p>
              )}

              {settings?.phone && (
                <p className="pt-1">
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                    className="hover:text-primary transition-colors"
                  >
                    {settings.phone}
                  </a>
                </p>
              )}

              {settings?.email && (
                <p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {settings.email}
                  </a>
                </p>
              )}

              {settings?.openingHours && (
                <p className="text-xs text-secondary/80 pt-1">
                  {settings.openingHours}
                </p>
              )}

              {!hasContactInfo && (
                <p className="text-xs text-secondary/70 italic">
                  Visit our atelier in Addis Ababa.
                </p>
              )}
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
            {activeSocials.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {activeSocials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow ${storeName} on ${social.name}`}
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
            ) : (
              <p className="text-xs text-secondary/70">
                Connect with us for styling inquiries.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Legal / Copyright Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
          <p>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/about"
              className="hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-primary transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/gallery"
              className="hover:text-primary transition-colors"
            >
              Lookbook
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
