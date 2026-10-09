/**
 * Shewa Fashion — Database Seed Script
 *
 * Populates the database with realistic demo data for development
 * and portfolio demonstration purposes.
 *
 * CURRENCY CONVENTION
 * -------------------
 * All prices are stored as plain integers representing full Ethiopian
 * Birr (ETB) amounts.  Example: 3450 means 3,450 ETB.
 * No sub-unit (cent) precision is used in this demo catalog.
 *
 * IDEMPOTENCY
 * -----------
 * Every upsert uses a stable unique key (slug or id).
 * Running this script multiple times is safe and will not create
 * duplicate records.
 *
 * WHAT IS NOT SEEDED
 * ------------------
 * - User accounts or admin passwords (authentication is Phase 5+)
 * - Real personal information or real contact details
 * - ContactMessage records
 *
 * RUN COMMAND
 * -----------
 *   npx prisma db seed
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { PrismaClient, OptionType } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

// ============================================================
// Categories
// ============================================================
const categoryData = [
  {
    slug: "women",
    name: "Women",
    description:
      "Contemporary dresses, tailored blazers, and modern Shewa silhouettes.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    slug: "men",
    name: "Men",
    description: "Crisp linen shirts, mandarin tunics, and structured tailoring.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    slug: "kids",
    name: "Kids",
    description: "Breathable artisan cotton sets and playful occasion wear.",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    slug: "shoes",
    name: "Shoes",
    description:
      "Handcrafted Ethiopian leather mules, Chelsea boots, and sandals.",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    slug: "bags",
    name: "Bags",
    description: "Architectural leather totes, woven carryalls, and day bags.",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Handwoven scarves, warm brass jewelry, and artisan belts.",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
];

// ============================================================
// Collections
// ============================================================
const collectionData = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "The latest additions to the Shewa Fashion catalogue.",
    isActive: true,
  },
  {
    slug: "best-sellers",
    name: "Best Sellers",
    description: "Our most loved and frequently requested pieces.",
    isActive: true,
  },
  {
    slug: "everyday-essentials",
    name: "Everyday Essentials",
    description: "Versatile wardrobe staples for modern Ethiopian life.",
    isActive: true,
  },
  {
    slug: "ethiopian-heritage",
    name: "Ethiopian Heritage",
    description:
      "Modern interpretations of traditional Ethiopian craft and textile.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85",
    isActive: true,
  },
  {
    slug: "seasonal-edit",
    name: "Seasonal Edit",
    description: "Curated selection for the current season.",
    isActive: true,
  },
];

// ============================================================
// Products
// Prices in ETB (integer, full Birr)
// ============================================================
const productData = [
  // --- Women ---
  {
    slug: "entoto-tiered-cotton-midi-dress",
    name: "Entoto Tiered Cotton Midi Dress",
    description:
      "Lightweight tiered dress crafted from hand-spun Ethiopian cotton with delicate hem embroidery.",
    price: 3450,
    available: true,
    featured: true,
    categorySlug: "women",
    collectionSlug: "ethiopian-heritage",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        alt: "Entoto Tiered Cotton Midi Dress — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SIZE, value: "XS" },
      { type: OptionType.SIZE, value: "S" },
      { type: OptionType.SIZE, value: "M" },
      { type: OptionType.SIZE, value: "L" },
      { type: OptionType.SIZE, value: "XL" },
    ],
  },
  {
    slug: "semien-woven-cotton-tunic",
    name: "Semien Woven Cotton Tunic",
    description:
      "Our signature relaxed tunic featuring hand-loomed texture and contemporary side slits.",
    price: 2600,
    available: true,
    featured: false,
    categorySlug: "women",
    collectionSlug: "best-sellers",
    images: [
      {
        url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
        alt: "Semien Woven Cotton Tunic — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SIZE, value: "S" },
      { type: OptionType.SIZE, value: "M" },
      { type: OptionType.SIZE, value: "L" },
      { type: OptionType.SIZE, value: "XL" },
    ],
  },
  {
    slug: "bole-contemporary-tailored-blazer",
    name: "Bole Contemporary Tailored Blazer",
    description:
      "Unstructured single-breasted blazer in fine woven cotton-linen blend.",
    price: 4950,
    available: true,
    featured: true,
    categorySlug: "women",
    collectionSlug: "best-sellers",
    images: [
      {
        url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
        alt: "Bole Contemporary Tailored Blazer — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SIZE, value: "S" },
      { type: OptionType.SIZE, value: "M" },
      { type: OptionType.SIZE, value: "L" },
    ],
  },
  {
    slug: "modern-womens-linen-dress",
    name: "Modern Women's Linen Dress",
    description:
      "Clean-lined shirt dress in breathable natural linen. Effortlessly smart for warm days.",
    price: 3200,
    available: true,
    featured: false,
    categorySlug: "women",
    collectionSlug: "everyday-essentials",
    images: [
      {
        url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
        alt: "Modern Women's Linen Dress — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SIZE, value: "XS" },
      { type: OptionType.SIZE, value: "S" },
      { type: OptionType.SIZE, value: "M" },
      { type: OptionType.SIZE, value: "L" },
      { type: OptionType.COLOR, value: "Natural" },
      { type: OptionType.COLOR, value: "White" },
    ],
  },
  // --- Men ---
  {
    slug: "shewa-linen-mandarin-shirt",
    name: "Shewa Linen Mandarin Shirt",
    description:
      "Breezy pure linen shirt featuring a modern mandarin collar and mother-of-pearl buttons.",
    price: 2150,
    available: true,
    featured: true,
    categorySlug: "men",
    collectionSlug: "new-arrivals",
    images: [
      {
        url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
        alt: "Shewa Linen Mandarin Shirt — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SIZE, value: "S" },
      { type: OptionType.SIZE, value: "M" },
      { type: OptionType.SIZE, value: "L" },
      { type: OptionType.SIZE, value: "XL" },
      { type: OptionType.COLOR, value: "White" },
      { type: OptionType.COLOR, value: "Blue" },
    ],
  },
  {
    slug: "awash-relaxed-linen-trouser",
    name: "Awash Relaxed Linen Trouser",
    description:
      "Tailored straight-leg trousers in breathable stone linen with an adjustable drawstring waist.",
    price: 2350,
    available: true,
    featured: false,
    categorySlug: "men",
    collectionSlug: "best-sellers",
    images: [
      {
        url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80",
        alt: "Awash Relaxed Linen Trouser — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SIZE, value: "S" },
      { type: OptionType.SIZE, value: "M" },
      { type: OptionType.SIZE, value: "L" },
      { type: OptionType.SIZE, value: "XL" },
    ],
  },
  {
    slug: "ethiopian-heritage-inspired-shirt",
    name: "Ethiopian Heritage-Inspired Shirt",
    description:
      "Men's dress shirt featuring subtle tilet embroidery at the collar and cuffs, inspired by traditional Ethiopian textile art.",
    price: 2800,
    available: true,
    featured: true,
    categorySlug: "men",
    collectionSlug: "ethiopian-heritage",
    images: [
      {
        url: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=800&q=80",
        alt: "Ethiopian Heritage-Inspired Shirt — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SIZE, value: "S" },
      { type: OptionType.SIZE, value: "M" },
      { type: OptionType.SIZE, value: "L" },
      { type: OptionType.SIZE, value: "XL" },
      { type: OptionType.COLOR, value: "White" },
    ],
  },
  {
    slug: "lightweight-denim-jacket",
    name: "Lightweight Denim Jacket",
    description:
      "Classic washed denim jacket with a relaxed silhouette. A wardrobe cornerstone.",
    price: 3900,
    available: true,
    featured: false,
    categorySlug: "men",
    collectionSlug: "everyday-essentials",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
        alt: "Lightweight Denim Jacket — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SIZE, value: "S" },
      { type: OptionType.SIZE, value: "M" },
      { type: OptionType.SIZE, value: "L" },
      { type: OptionType.SIZE, value: "XL" },
    ],
  },
  // --- Kids ---
  {
    slug: "kids-cotton-set",
    name: "Kids Cotton Set",
    description:
      "Soft and breathable two-piece artisan cotton set for everyday play and special occasions.",
    price: 1450,
    available: true,
    featured: false,
    categorySlug: "kids",
    collectionSlug: "everyday-essentials",
    images: [
      {
        url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
        alt: "Kids Cotton Set — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SIZE, value: "2-3Y" },
      { type: OptionType.SIZE, value: "4-5Y" },
      { type: OptionType.SIZE, value: "6-7Y" },
      { type: OptionType.SIZE, value: "8-9Y" },
    ],
  },
  // --- Shoes ---
  {
    slug: "tana-minimalist-leather-mules",
    name: "Tana Minimalist Leather Mules",
    description:
      "Sleek slip-on mules sculpted from buttery soft leather with a cushioned insole.",
    price: 2900,
    available: true,
    featured: true,
    categorySlug: "shoes",
    collectionSlug: "new-arrivals",
    images: [
      {
        url: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80",
        alt: "Tana Minimalist Leather Mules — side view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SHOE_SIZE, value: "36" },
      { type: OptionType.SHOE_SIZE, value: "37" },
      { type: OptionType.SHOE_SIZE, value: "38" },
      { type: OptionType.SHOE_SIZE, value: "39" },
      { type: OptionType.SHOE_SIZE, value: "40" },
      { type: OptionType.SHOE_SIZE, value: "41" },
    ],
  },
  {
    slug: "minimal-sneakers",
    name: "Minimal Sneakers",
    description:
      "Clean low-profile sneakers with a leather upper and flexible rubber sole.",
    price: 3200,
    available: true,
    featured: false,
    categorySlug: "shoes",
    collectionSlug: "everyday-essentials",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        alt: "Minimal Sneakers — side view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SHOE_SIZE, value: "39" },
      { type: OptionType.SHOE_SIZE, value: "40" },
      { type: OptionType.SHOE_SIZE, value: "41" },
      { type: OptionType.SHOE_SIZE, value: "42" },
      { type: OptionType.SHOE_SIZE, value: "43" },
      { type: OptionType.SHOE_SIZE, value: "44" },
    ],
  },
  {
    slug: "casual-sandals",
    name: "Casual Sandals",
    description:
      "Handstitched leather sandals with an adjustable ankle strap, perfect for warm Ethiopian summers.",
    price: 1950,
    available: true,
    featured: false,
    categorySlug: "shoes",
    collectionSlug: "seasonal-edit",
    images: [
      {
        url: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80",
        alt: "Casual Sandals — top view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SHOE_SIZE, value: "36" },
      { type: OptionType.SHOE_SIZE, value: "37" },
      { type: OptionType.SHOE_SIZE, value: "38" },
      { type: OptionType.SHOE_SIZE, value: "39" },
      { type: OptionType.SHOE_SIZE, value: "40" },
    ],
  },
  // --- Bags ---
  {
    slug: "abyssinian-structured-leather-tote",
    name: "Abyssinian Structured Leather Tote",
    description:
      "Vegetable-tanned full-grain leather tote handcrafted by master leatherworkers in Addis Ababa.",
    price: 4800,
    available: true,
    featured: true,
    categorySlug: "bags",
    collectionSlug: "new-arrivals",
    images: [
      {
        url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
        alt: "Abyssinian Structured Leather Tote — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.COLOR, value: "Tan" },
      { type: OptionType.COLOR, value: "Black" },
    ],
  },
  {
    slug: "everyday-shoulder-bag",
    name: "Everyday Shoulder Bag",
    description:
      "A timeless structured shoulder bag with a magnetic clasp and interior pockets.",
    price: 3650,
    available: true,
    featured: false,
    categorySlug: "bags",
    collectionSlug: "everyday-essentials",
    images: [
      {
        url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
        alt: "Everyday Shoulder Bag — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.COLOR, value: "Black" },
      { type: OptionType.COLOR, value: "Camel" },
    ],
  },
  {
    slug: "structured-crossbody-bag",
    name: "Structured Crossbody Bag",
    description:
      "Compact leather crossbody with an adjustable chain strap and zip closure.",
    price: 2750,
    available: true,
    featured: false,
    categorySlug: "bags",
    collectionSlug: "new-arrivals",
    images: [
      {
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        alt: "Structured Crossbody Bag — front view",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.COLOR, value: "Black" },
      { type: OptionType.COLOR, value: "White" },
    ],
  },
  // --- Accessories ---
  {
    slug: "kaffa-handwoven-silk-cotton-scarf",
    name: "Kaffa Handwoven Silk & Cotton Scarf",
    description:
      "Artisan-loomed Ethiopian scarf featuring subtle gold woven border accents.",
    price: 1650,
    available: true,
    featured: false,
    categorySlug: "accessories",
    collectionSlug: "ethiopian-heritage",
    images: [
      {
        url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
        alt: "Kaffa Handwoven Silk & Cotton Scarf — draped view",
        sortOrder: 0,
      },
    ],
    options: [{ type: OptionType.ONE_SIZE, value: "One Size" }],
  },
  {
    slug: "zoma-artisan-brass-cuff",
    name: "Zoma Artisan Brass Cuff",
    description:
      "Hand-hammered warm brass bracelet inspired by historic Ethiopian geometric motifs.",
    price: 1250,
    available: true,
    featured: false,
    categorySlug: "accessories",
    collectionSlug: "best-sellers",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611591475819-79b8b73ff2f3?auto=format&fit=crop&w=800&q=80",
        alt: "Zoma Artisan Brass Cuff — on wrist",
        sortOrder: 0,
      },
    ],
    options: [{ type: OptionType.ONE_SIZE, value: "One Size" }],
  },
  {
    slug: "classic-leather-belt",
    name: "Classic Leather Belt",
    description:
      "Full-grain vegetable-tanned leather belt with a brushed brass buckle.",
    price: 980,
    available: true,
    featured: false,
    categorySlug: "accessories",
    collectionSlug: "everyday-essentials",
    images: [
      {
        url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80",
        alt: "Classic Leather Belt — flat lay",
        sortOrder: 0,
      },
    ],
    options: [
      { type: OptionType.SIZE, value: "S/M" },
      { type: OptionType.SIZE, value: "L/XL" },
    ],
  },
];

// ============================================================
// Gallery Items
// ============================================================
const galleryData = [
  {
    title: "Morning in Bole",
    imageUrl:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    alt: "Model in handwoven cotton — Morning in Bole editorial",
    description: "Layered handwoven cotton with effortless tailoring.",
    sortOrder: 0,
    isPublished: true,
  },
  {
    title: "Sculpted Textures",
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
    alt: "Raw organic cotton editorial — Sculpted Textures",
    description:
      "Raw organic cotton paired with vegetable-tanned accessories.",
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Addis Modernity",
    imageUrl:
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80",
    alt: "Contemporary fashion in Addis Ababa — Addis Modernity editorial",
    description:
      "Clean architectural lines inspired by the capital's creative energy.",
    sortOrder: 2,
    isPublished: true,
  },
  {
    title: "Twilight Silhouette",
    imageUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
    alt: "Evening fashion editorial — Twilight Silhouette",
    description:
      "Flowing midnight hues accented with subtle Ethiopian gold threading.",
    sortOrder: 3,
    isPublished: true,
  },
  {
    title: "The Heritage Capsule",
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85",
    alt: "Heritage Capsule campaign image",
    description:
      "Modern Ethiopian tailoring meets centuries-old handwoven craft.",
    sortOrder: 4,
    isPublished: true,
  },
];

// ============================================================
// Main seed function
// ============================================================
async function main(): Promise<void> {
  console.log("🌱 Starting seed...\n");

  // -- Categories --
  console.log("  Seeding categories…");
  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const { slug, ...rest } = cat;
    const record = await prisma.category.upsert({
      where: { slug },
      update: rest,
      create: { slug, ...rest },
    });
    categories[slug] = record.id;
    console.log(`    ✓ ${record.name} (${record.id})`);
  }

  // -- Collections --
  console.log("\n  Seeding collections…");
  const collections: Record<string, string> = {};
  for (const col of collectionData) {
    const { slug, ...rest } = col;
    const record = await prisma.collection.upsert({
      where: { slug },
      update: rest,
      create: { slug, ...rest },
    });
    collections[slug] = record.id;
    console.log(`    ✓ ${record.name} (${record.id})`);
  }

  // -- Products --
  console.log("\n  Seeding products…");
  for (const p of productData) {
    const {
      slug,
      categorySlug,
      collectionSlug,
      images,
      options,
      ...productFields
    } = p;

    const categoryId = categories[categorySlug] ?? null;
    const collectionId = collectionSlug
      ? (collections[collectionSlug] ?? null)
      : null;

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        ...productFields,
        categoryId,
        collectionId,
      },
      create: {
        slug,
        ...productFields,
        categoryId,
        collectionId,
      },
    });

    // Upsert images (match by productId + url)
    for (const img of images) {
      const existingImg = await prisma.productImage.findFirst({
        where: { productId: product.id, url: img.url },
        select: { id: true },
      });

      if (existingImg) {
        await prisma.productImage.update({
          where: { id: existingImg.id },
          data: {
            alt: img.alt,
            sortOrder: img.sortOrder,
          },
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: img.url,
            alt: img.alt,
            sortOrder: img.sortOrder,
          },
        });
      }
    }

    // Upsert options (unique constraint: productId + type + value)
    for (const opt of options) {
      await prisma.productOption.upsert({
        where: {
          productId_type_value: {
            productId: product.id,
            type: opt.type,
            value: opt.value,
          },
        },
        update: {},
        create: {
          productId: product.id,
          type: opt.type,
          value: opt.value,
        },
      });
    }

    console.log(`    ✓ ${product.name}`);
  }

  // -- Gallery Items --
  console.log("\n  Seeding gallery items…");
  for (const item of galleryData) {
    const existing = await prisma.galleryItem.findFirst({
      where: { title: item.title },
      select: { id: true },
    });
    if (existing) {
      await prisma.galleryItem.update({
        where: { id: existing.id },
        data: item,
      });
    } else {
      await prisma.galleryItem.create({ data: item });
    }
    console.log(`    ✓ ${item.title}`);
  }

  // -- Store Settings --
  console.log("\n  Seeding store settings…");
  await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: {
      storeName: "Shewa Fashion",
      description:
        "An Ethiopian fashion retailer celebrating modern African design and traditional craftsmanship.",
    },
    create: {
      id: "singleton",
      storeName: "Shewa Fashion",
      description:
        "An Ethiopian fashion retailer celebrating modern African design and traditional craftsmanship.",
      // All contact / social fields are intentionally left null.
      // Do not invent real contact details or social-media accounts.
    },
  });
  console.log("    ✓ Store settings (singleton)");

  console.log("\n✅ Seed complete.\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
