/**
 * Shewa Fashion — Database Verification Script
 *
 * Run from the terminal to confirm the database connection and
 * verify that seed data was inserted correctly.
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/shewa_fashion"
 *   npx tsx prisma/verify-db.ts
 *
 * Or (if DATABASE_URL is already set in .env.local and you have
 * dotenv installed):
 *   npx tsx --env-file=.env.local prisma/verify-db.ts
 *
 * This script is for development verification only.
 * Do NOT expose it as a public HTTP endpoint.
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"],
});

async function main(): Promise<void> {
  console.log("🔍 Shewa Fashion — Database Verification\n");
  console.log("  Connecting to database…");

  // 1. Basic connectivity
  await prisma.$connect();
  console.log("  ✓ Connected successfully\n");

  // 2. Category count
  const categoryCount = await prisma.category.count();
  console.log(`  Categories : ${categoryCount}`);
  if (categoryCount !== 6) {
    console.warn(
      `  ⚠  Expected 6 categories, found ${categoryCount}. Have you run the seed?`
    );
  }

  // 3. Collection count
  const collectionCount = await prisma.collection.count();
  console.log(`  Collections: ${collectionCount}`);
  if (collectionCount !== 5) {
    console.warn(
      `  ⚠  Expected 5 collections, found ${collectionCount}. Have you run the seed?`
    );
  }

  // 4. Product count
  const productCount = await prisma.product.count();
  console.log(`  Products   : ${productCount}`);
  if (productCount < 12) {
    console.warn(
      `  ⚠  Expected at least 12 products, found ${productCount}. Have you run the seed?`
    );
  }

  // 5. Gallery items
  const galleryCount = await prisma.galleryItem.count();
  console.log(`  Gallery    : ${galleryCount}`);

  // 6. Store settings
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "singleton" },
  });
  console.log(`  Store name : ${settings?.storeName ?? "(not found)"}`);

  // 7. Featured product with category and images
  console.log("\n  Fetching a featured product with relations…");
  const featuredProduct = await prisma.product.findFirst({
    where: { featured: true, available: true },
    include: {
      category: { select: { name: true, slug: true } },
      collection: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      options: { take: 5 },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!featuredProduct) {
    console.warn("  ⚠  No featured product found.");
  } else {
    console.log(`\n  ✓ Featured product sample:`);
    console.log(`    Name      : ${featuredProduct.name}`);
    console.log(`    Slug      : ${featuredProduct.slug}`);
    console.log(
      `    Price     : ${featuredProduct.price.toLocaleString()} ETB`
    );
    console.log(`    Category  : ${featuredProduct.category?.name ?? "—"}`);
    console.log(`    Collection: ${featuredProduct.collection?.name ?? "—"}`);
    console.log(`    Images    : ${featuredProduct.images.length}`);
    console.log(`    Options   : ${featuredProduct.options.length}`);
    if (featuredProduct.images[0]) {
      console.log(`    Image URL : ${featuredProduct.images[0].url}`);
    }
  }

  console.log("\n✅ Verification complete.\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
