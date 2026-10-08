import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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

export const metadata: Metadata = {
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
    url: "https://shewafashion.com",
    title: "Shewa Fashion | Modern Ethiopian Fashion",
    description:
      "Contemporary Ethiopian fashion honoring heritage with modern tailoring, fine craftsmanship, and timeless elegance.",
    siteName: "Shewa Fashion",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-main antialiased selection:bg-primary-light selection:text-main">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
