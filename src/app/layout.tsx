import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { AppHeader, AppFooter } from "@/components/layout/app-chrome";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

import { SITE_URL, buildStoreJsonLd, buildWebSiteJsonLd, safeJsonLd } from "@/lib/seo";
import { getStoreSettings } from "@/lib/products";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "./",
  },
  title: {
    default: "Shewa Fashion | Modern Ethiopian Fashion & Contemporary Apparel",
    template: "%s | Shewa Fashion",
  },
  description:
    "Shewa Fashion brings contemporary Ethiopian fashion, artisan textile craftsmanship, and refined modern silhouettes to life.",
  keywords: [
    "Ethiopian fashion",
    "Shewa Fashion",
    "Addis Ababa fashion",
    "Habesha clothing",
    "contemporary African design",
    "modern Ethiopian dress",
  ],
  authors: [{ name: "Shewa Fashion" }],
  creator: "Shewa Fashion",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Shewa Fashion | Modern Ethiopian Fashion",
    description:
      "Contemporary Ethiopian fashion honoring heritage with modern tailoring, fine craftsmanship, and timeless elegance.",
    siteName: "Shewa Fashion",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shewa Fashion | Modern Ethiopian Fashion & Contemporary Apparel",
    description:
      "Contemporary Ethiopian fashion honoring heritage with modern tailoring, fine craftsmanship, and timeless elegance.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
};

export const instant = false;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();
  const storeJsonLd = buildStoreJsonLd(settings);
  const websiteJsonLd = buildWebSiteJsonLd();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-main antialiased selection:bg-primary-light selection:text-main">
        {/* WCAG 2.2 AA (Criterion 2.4.1 Bypass Blocks): Skip to Content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-white focus:font-semibold focus:text-xs focus:rounded-xl focus:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(storeJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
        />
        <AppHeader settings={settings} />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full focus:outline-none">
          {children}
        </main>
        <AppFooter settings={settings} />
      </body>
    </html>
  );
}
