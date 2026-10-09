import React from "react";
import { cn } from "@/lib/utils";

interface ContactCtaProps {
  productName: string;
  productSlug: string;
  isAvailable: boolean;
  storeSettings?: {
    storeName: string;
    phone?: string | null;
    email?: string | null;
    whatsapp?: string | null;
    telegram?: string | null;
  } | null;
}

/** Telegram paper-plane icon */
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

/** Phone handset icon */
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

export function ContactCta({
  productName,
  productSlug,
  isAvailable,
  storeSettings,
}: ContactCtaProps) {
  const inquiryMessage = `Hello Shewa Fashion! I'm interested in "${productName}" (Ref: ${productSlug}). Could you help me with more details?`;
  const encodedMessage = encodeURIComponent(inquiryMessage);

  // Telegram DM link — handle @username or t.me/username formats
  const telegramHandle = storeSettings?.telegram
    ? storeSettings.telegram.replace(/^@/, "").replace(/^t\.me\//, "")
    : null;
  const telegramUrl = telegramHandle
    ? `https://t.me/${telegramHandle}?text=${encodedMessage}`
    : null;

  // Phone call link
  const phoneRaw = storeSettings?.phone?.replace(/\s+/g, "") ?? null;
  const phoneUrl = phoneRaw ? `tel:${phoneRaw}` : null;
  // Formatted for display — keep original spacing if available
  const phoneDisplay = storeSettings?.phone ?? phoneRaw;

  return (
    <div className="pt-6 border-t border-border/80 space-y-4">
      {/* Availability Status Card */}
      <div
        className={cn(
          "p-4 rounded-xl border flex items-start gap-3",
          isAvailable
            ? "bg-success/5 border-success/20 text-success"
            : "bg-secondary/5 border-border text-secondary"
        )}
      >
        <div className="mt-0.5">
          {isAvailable ? (
            <span className="w-2.5 h-2.5 rounded-full bg-success block" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-secondary block" />
          )}
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-main">
            {isAvailable ? "Available in Boutique" : "Currently Unavailable"}
          </p>
          <p className="text-secondary mt-0.5 leading-relaxed">
            {isAvailable
              ? "In stock for immediate local courier dispatch in Addis Ababa or boutique pickup."
              : "This piece is currently sold out. Inquire below to check for the next artisan batch or custom order."}
          </p>
        </div>
      </div>

      {/* Contact Action Buttons */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-secondary uppercase tracking-widest">
          Get in Touch
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Telegram DM Button */}
          {telegramUrl ? (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-[#229ED9] hover:bg-[#1a8bbf] text-white text-sm font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] focus-visible:ring-offset-2"
              aria-label={`DM Shewa Fashion on Telegram about ${productName}`}
            >
              <TelegramIcon className="w-5 h-5 shrink-0" />
              <span>DM on Telegram</span>
            </a>
          ) : (
            <a
              href={`https://t.me/shewafashion?text=${encodedMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-[#229ED9] hover:bg-[#1a8bbf] text-white text-sm font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] focus-visible:ring-offset-2"
              aria-label={`DM Shewa Fashion on Telegram about ${productName}`}
            >
              <TelegramIcon className="w-5 h-5 shrink-0" />
              <span>DM on Telegram</span>
            </a>
          )}

          {/* Phone Call Button */}
          {phoneUrl ? (
            <a
              href={phoneUrl}
              className="flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-surface border border-border hover:border-primary hover:text-primary text-main text-sm font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label={`Call Shewa Fashion at ${phoneDisplay}`}
            >
              <PhoneIcon className="w-5 h-5 shrink-0" />
              <span className="truncate">Call {phoneDisplay}</span>
            </a>
          ) : (
            <a
              href="tel:+251911234567"
              className="flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-surface border border-border hover:border-primary hover:text-primary text-main text-sm font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Call Shewa Fashion"
            >
              <PhoneIcon className="w-5 h-5 shrink-0" />
              <span>Call Us</span>
            </a>
          )}
        </div>
      </div>

      {/* Explanatory Context */}
      <p className="text-[11px] sm:text-xs text-secondary text-center leading-relaxed">
        Shewa Fashion pieces are crafted in boutique artisan batches. DM us on
        Telegram or call to confirm exact fit, fabric weight, or arrange a local
        fitting in Addis Ababa.
      </p>
    </div>
  );
}
