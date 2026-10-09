import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { getStoreSettings } from "@/lib/products";

// Allow blocking route for uncached database access with Next.js 16 Cache Components
export const instant = false;

export const metadata: Metadata = {
  title: "Contact & Social Media | Shewa Fashion",
  description:
    "Connect with Shewa Fashion in Addis Ababa. Reach our design studio directly through Telegram, WhatsApp, phone, email, and social media channels.",
  openGraph: {
    title: "Contact & Social Media | Shewa Fashion",
    description:
      "Connect with Shewa Fashion through Telegram, WhatsApp, phone, and our social media channels in Addis Ababa.",
  },
};

export default async function ContactPage() {
  const settings = await getStoreSettings();

  // Resolved contact data with database priority and portfolio defaults
  const storeName = settings?.storeName || "Shewa Fashion";
  const phone = settings?.phone || "+251 91 123 4567";
  const phoneHref = `tel:${phone.replace(/\s+/g, "")}`;

  const email = settings?.email || "hello@shewafashion.com";
  const emailHref = `mailto:${email}`;

  const whatsapp = settings?.whatsapp || "+251 91 123 4567";
  const whatsappHref = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hello Shewa Fashion! I'd like to inquire about your current collection."
  )}`;

  const telegramHandle = settings?.telegram
    ? settings.telegram.replace(/^@/, "").replace(/^t\.me\//, "")
    : "shewafashion";
  const telegramHref = `https://t.me/${telegramHandle}`;

  const address =
    settings?.address ||
    "Bole Sub-City, Next to Edna Mall, Addis Ababa, Ethiopia";

  const openingHours =
    settings?.openingHours ||
    "Monday – Saturday: 9:00 AM – 7:00 PM (EAT) • Sunday: Closed";

  const instagramHandle = settings?.instagram
    ? settings.instagram.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    : "shewafashion";
  const instagramHref = `https://instagram.com/${instagramHandle}`;

  const facebookHandle = settings?.facebook
    ? settings.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, "")
    : "shewafashion.et";
  const facebookHref = `https://facebook.com/${facebookHandle}`;

  const tiktokHandle = settings?.tiktok
    ? settings.tiktok.replace(/^@/, "").replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/, "")
    : "shewafashion";
  const tiktokHref = `https://tiktok.com/@${tiktokHandle}`;

  const googleMapsHref =
    settings?.googleMapsUrl && settings.googleMapsUrl.startsWith("http")
      ? settings.googleMapsUrl
      : "https://maps.google.com/?q=Bole+Edna+Mall+Addis+Ababa";

  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-2 text-xs text-secondary font-medium tracking-wide">
            <li>
              <Link href="/" className="hover:text-main transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-secondary/50">
              /
            </li>
            <li aria-current="page" className="text-main font-semibold">
              Contact & Social
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-10 sm:mb-14">
          <SectionHeading
            eyebrow="Connect With Our Studio"
            heading="Contact & Social Channels"
            description="In Addis Ababa and across the globe, we connect directly with our clients through messaging and social media. Reach out for styling advice, boutique fitting visits, or bespoke garment inquiries."
          />
        </div>

        {/* 1. Fast Direct Messaging Channels Grid */}
        <section aria-labelledby="direct-messaging-heading" className="mb-14 sm:mb-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-accent-gold block">
                Instant Communication
              </span>
              <h2
                id="direct-messaging-heading"
                className="font-serif text-xl sm:text-2xl font-medium text-main"
              >
                Direct Messaging & Support
              </h2>
            </div>
            <span className="hidden sm:inline-block text-xs text-secondary">
              Typically replies within 1 hour during store hours
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Telegram Card */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:border-[#229ED9]/60 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center transition-transform group-hover:scale-105">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#229ED9]/10 text-[#229ED9]">
                    Primary
                  </span>
                </div>
                <h3 className="font-serif text-lg font-medium text-main mb-1">
                  Telegram
                </h3>
                <p className="text-secondary text-xs leading-relaxed mb-4">
                  Chat directly with our styling team, place immediate courier
                  orders, or browse our daily channel drops.
                </p>
                <div className="text-xs font-mono text-main font-semibold mb-4">
                  @{telegramHandle}
                </div>
              </div>
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1a8bbf] text-white text-xs font-semibold text-center transition-colors shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <span>Chat on Telegram</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </a>
            </div>

            {/* WhatsApp Card */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:border-[#25D366]/60 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center transition-transform group-hover:scale-105">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#25D366]/10 text-[#25D366]">
                    Instant
                  </span>
                </div>
                <h3 className="font-serif text-lg font-medium text-main mb-1">
                  WhatsApp
                </h3>
                <p className="text-secondary text-xs leading-relaxed mb-4">
                  Quick text inquiries, size consultations, photo sharing, and
                  customer service assistance.
                </p>
                <div className="text-xs font-mono text-main font-semibold mb-4">
                  {whatsapp}
                </div>
              </div>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebd56] text-white text-xs font-semibold text-center transition-colors shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <span>Message on WhatsApp</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </a>
            </div>

            {/* Direct Phone Call Card */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary/60 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary-light text-primary">
                    Boutique
                  </span>
                </div>
                <h3 className="font-serif text-lg font-medium text-main mb-1">
                  Phone Call
                </h3>
                <p className="text-secondary text-xs leading-relaxed mb-4">
                  Speak directly with our studio staff in Addis Ababa during
                  regular boutique operating hours.
                </p>
                <div className="text-xs font-mono text-main font-semibold mb-4">
                  {phone}
                </div>
              </div>
              <a
                href={phoneHref}
                className="w-full py-2.5 px-4 rounded-xl bg-surface border border-border hover:border-primary text-main hover:text-primary text-xs font-semibold text-center transition-colors shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <span>Call the Studio</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </a>
            </div>

            {/* Email Inquiries Card */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:border-accent-gold/60 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-gold-light text-accent-gold flex items-center justify-center transition-transform group-hover:scale-105">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-gold-light text-accent-gold">
                    Editorial
                  </span>
                </div>
                <h3 className="font-serif text-lg font-medium text-main mb-1">
                  Email Desk
                </h3>
                <p className="text-secondary text-xs leading-relaxed mb-4">
                  For formal styling inquiries, wedding/bespoke orders, press
                  collaborations, and wholesale partnerships.
                </p>
                <div className="text-xs font-mono text-main font-semibold truncate mb-4">
                  {email}
                </div>
              </div>
              <a
                href={emailHref}
                className="w-full py-2.5 px-4 rounded-xl bg-surface border border-border hover:border-accent-gold text-main hover:text-accent-gold text-xs font-semibold text-center transition-colors shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <span>Send an Email</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* 2. Social Media Channels Hub */}
        <section aria-labelledby="social-media-heading" className="mb-14 sm:mb-20">
          <div className="mb-6">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-accent-gold block">
              Follow Our Journey
            </span>
            <h2
              id="social-media-heading"
              className="font-serif text-xl sm:text-2xl font-medium text-main"
            >
              Social Media Communities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instagram */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs hover:border-pink-500/50 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-main">
                      Instagram
                    </h3>
                    <span className="text-xs text-secondary font-mono">
                      @{instagramHandle}
                    </span>
                  </div>
                </div>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed mb-6">
                  Explore our seasonal lookbook reels, styled outfit stories,
                  behind-the-scenes weaving ateliers, and daily boutique drops.
                </p>
              </div>
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-border hover:border-pink-500 hover:text-pink-600 bg-background text-xs font-semibold text-center transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Follow on Instagram</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </a>
            </div>

            {/* TikTok */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs hover:border-cyan-500/50 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-main">
                      TikTok
                    </h3>
                    <span className="text-xs text-secondary font-mono">
                      @{tiktokHandle}
                    </span>
                  </div>
                </div>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed mb-6">
                  Watch artisan loom weaving videos, fabric texture breakdowns,
                  fashion styling tutorials, and Addis Ababa street walks.
                </p>
              </div>
              <a
                href={tiktokHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-border hover:border-cyan-500 hover:text-cyan-600 bg-background text-xs font-semibold text-center transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Follow on TikTok</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </a>
            </div>

            {/* Facebook */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs hover:border-[#1877F2]/50 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-xs">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-main">
                      Facebook
                    </h3>
                    <span className="text-xs text-secondary font-mono">
                      {facebookHandle}
                    </span>
                  </div>
                </div>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed mb-6">
                  Join our seasonal announcements, community discussions, customer
                  reviews, and upcoming trunk show invitations.
                </p>
              </div>
              <a
                href={facebookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-border hover:border-[#1877F2] hover:text-[#1877F2] bg-background text-xs font-semibold text-center transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Follow on Facebook</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* 3. Physical Boutique & Visiting Information */}
        <section aria-labelledby="boutique-visit-heading" className="mb-14 sm:mb-20">
          <div className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-surface border border-border/80 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-accent-gold block">
                  Addis Ababa Studio
                </span>
                <h2
                  id="boutique-visit-heading"
                  className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-main tracking-tight"
                >
                  Visit Our Bole Boutique
                </h2>
                <p className="text-secondary text-sm sm:text-base leading-relaxed">
                  Located in the heart of Bole, our physical showroom showcases full
                  collections, fabric sample swatches, and custom fitting rooms.
                  Walk-ins are warmly welcome, or connect ahead on Telegram to reserve
                  a dedicated styling consultation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-background border border-border">
                    <span className="text-xs font-semibold uppercase text-main block mb-1">
                      Studio Address
                    </span>
                    <p className="text-xs text-secondary leading-relaxed">
                      {address}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border">
                    <span className="text-xs font-semibold uppercase text-main block mb-1">
                      Operating Hours
                    </span>
                    <p className="text-xs text-secondary leading-relaxed">
                      {openingHours}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={googleMapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                  >
                    <span>Open in Google Maps</span>
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
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Inquiry Type Cards Sidebar */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-background border border-border">
                  <h3 className="font-serif text-base font-medium text-main mb-1">
                    Boutique Fittings & Styling
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed mb-2">
                    Message us on WhatsApp or Telegram to arrange a private fitting
                    session with our head stylist.
                  </p>
                  <span className="text-[11px] font-semibold text-primary">
                    Available during boutique hours
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-background border border-border">
                  <h3 className="font-serif text-base font-medium text-main mb-1">
                    Custom & Bespoke Weaving
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed mb-2">
                    Looking for handwoven bridal ensembles or personalized silk-blend
                    cotton pieces? We take bespoke appointments.
                  </p>
                  <span className="text-[11px] font-semibold text-accent-gold">
                    Requires 2–4 weeks craft lead time
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-background border border-border">
                  <h3 className="font-serif text-base font-medium text-main mb-1">
                    Addis Ababa Local Courier
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed mb-2">
                    Orders confirmed via Telegram or WhatsApp can be dispatched same-day
                    or next-day across central Addis Ababa.
                  </p>
                  <span className="text-[11px] font-semibold text-green-600">
                    Same-day delivery available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Bottom Catalog CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-main text-white text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-gold block">
            {storeName} Collection
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-white">
            Ready to Explore the Catalog?
          </h2>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Discover our curated categories, from tailored blazers and hand-loomed
            cotton dresses to artisan footwear and leather bags.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button href="/shop" variant="primary" size="md">
              Browse All Products
            </Button>
            <Button
              href="/collections"
              variant="outline"
              size="md"
              className="border-white/30 text-white hover:bg-white hover:text-main"
            >
              Curated Collections
            </Button>
            <Button
              href="/gallery"
              variant="ghost"
              size="md"
              className="text-white/90 hover:text-white"
            >
              Lookbook Gallery
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
