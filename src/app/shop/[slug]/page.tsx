import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/utils";
import {
  getProductBySlug,
  getRelatedProducts,
  getStoreSettings,
} from "@/lib/products";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductOptions } from "@/components/product/product-options";
import { ContactCta } from "@/components/product/contact-cta";
import { RelatedProducts } from "@/components/product/related-products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Shewa Fashion",
      description: "The requested fashion piece could not be found.",
    };
  }

  const primaryImage = product.images[0]?.url;

  return {
    title: `${product.name} | Shewa Fashion`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Shewa Fashion`,
      description: product.description,
      images: primaryImage
        ? [
            {
              url: primaryImage,
              alt: product.name,
              width: 800,
              height: 1067,
            },
          ]
        : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch complementary related products and store contact configuration
  const [relatedProducts, storeSettings] = await Promise.all([
    getRelatedProducts(product.id, product.category?.id, 4),
    getStoreSettings(),
  ]);

  return (
    <main className="py-8 sm:py-12 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-secondary font-medium tracking-wide">
            <li>
              <Link href="/" className="hover:text-main transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-secondary/40">
              /
            </li>
            <li>
              <Link href="/shop" className="hover:text-main transition-colors">
                Shop
              </Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden="true" className="text-secondary/40">
                  /
                </li>
                <li>
                  <Link
                    href={`/shop?category=${product.category.slug}`}
                    className="hover:text-main transition-colors"
                  >
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true" className="text-secondary/40">
              /
            </li>
            <li
              aria-current="page"
              className="text-main font-semibold truncate max-w-[200px] sm:max-w-none"
            >
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Details Primary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Column 1: Image Gallery (6 cols) */}
          <div className="lg:col-span-6 xl:col-span-6 w-full">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Column 2: Product Information & Purchase/Inquiry Flow (6 cols) */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
            {/* Category / Collection Tag & Badges */}
            <div className="flex items-center flex-wrap gap-2 text-xs tracking-wider uppercase font-semibold">
              {product.category && (
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="px-2.5 py-1 rounded-full bg-primary-light text-primary hover:bg-primary/20 transition-colors"
                >
                  {product.category.name}
                </Link>
              )}

              {product.collection && (
                <Link
                  href={`/shop?collection=${product.collection.slug}`}
                  className="px-2.5 py-1 rounded-full bg-accent-gold-light text-accent-gold hover:opacity-80 transition-opacity"
                >
                  {product.collection.name}
                </Link>
              )}

              {product.featured && (
                <span className="px-2.5 py-1 rounded-full bg-main text-white text-[11px]">
                  Featured Piece
                </span>
              )}
            </div>

            {/* Product Title */}
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-main">
                {product.name}
              </h1>
            </div>

            {/* Price in ETB */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-secondary tracking-wide uppercase font-medium">
                ETB (Tax Incl.)
              </span>
            </div>

            {/* Product Description */}
            <div className="text-sm sm:text-base text-secondary leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Product Options (Sizes, Shoe Sizes, Colors) */}
            <ProductOptions options={product.options} />

            {/* Availability & Contact / WhatsApp CTA */}
            <ContactCta
              productName={product.name}
              productSlug={product.slug}
              isAvailable={product.available}
              storeSettings={storeSettings}
            />

            {/* Ethiopian Artisan Craftsmanship Details */}
            <div className="mt-4 pt-6 border-t border-border/80 space-y-3 text-xs text-secondary">
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 text-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <span>Handcrafted with regional fibers and artisan heritage in Addis Ababa.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 text-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75m0 3.75a2.25 2.25 0 0 1-2.25 2.25h-4.5A2.25 2.25 0 0 1 7.5 7.5V3.75m6.75 3.75H7.5"
                  />
                </svg>
                <span>Same-day and next-day courier delivery available within Addis Ababa.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <RelatedProducts products={relatedProducts} />
      </Container>
    </main>
  );
}
