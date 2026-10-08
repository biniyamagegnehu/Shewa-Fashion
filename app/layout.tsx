import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shewa Fashion",
  description:
    "Shewa Fashion — contemporary clothing, shoes, bags, and accessories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}