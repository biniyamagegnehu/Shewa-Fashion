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
      className={`${playfair.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-main antialiased selection:bg-primary-light selection:text-main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(storeJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
        />
        <AppHeader settings={settings} />
        <main className="flex-1 w-full">{children}</main>
        <AppFooter settings={settings} />
      </body>
    </html>
  );
}
