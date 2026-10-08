import { Product, Category, Collection, LookbookItem } from "@/types";

/**
 * Formats a numeric price into Ethiopian Birr (ETB) format.
 * Example: 2450 -> "2,450 ETB"
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString()} ETB`;
}

/**
 * 6 Core Fashion Categories
 * Used in homepage category grid and linking directly into shop filters.
 */
export const categories: Category[] = [
  {
    id: "cat-women",
    name: "Women",
    slug: "women",
    description: "Contemporary dresses, tailored blazers, and modern Shewa silhouettes.",
    itemCount: 42,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    href: "/shop?category=women",
  },
  {
    id: "cat-men",
    name: "Men",
    slug: "men",
    description: "Crisp linen shirts, mandarin tunics, and structured tailoring.",
    itemCount: 36,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    href: "/shop?category=men",
  },
  {
    id: "cat-kids",
    name: "Kids",
    slug: "kids",
    description: "Breathable artisan cotton sets and playful occasion wear.",
    itemCount: 18,
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
    href: "/shop?category=kids",
  },
  {
    id: "cat-shoes",
    name: "Shoes",
    slug: "shoes",
    description: "Handcrafted Ethiopian leather mules, Chelsea boots, and sandals.",
    itemCount: 24,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    href: "/shop?category=shoes",
  },
  {
    id: "cat-bags",
    name: "Bags",
    slug: "bags",
    description: "Architectural leather totes, woven carryalls, and day bags.",
    itemCount: 20,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    href: "/shop?category=bags",
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Handwoven scarves, warm brass jewelry, and artisan belts.",
    itemCount: 28,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    href: "/shop?category=accessories",
  },
];

/**
 * Curated New Arrivals
 */
export const newArrivals: Product[] = [
  {
    id: "prod-na-1",
    name: "Entoto Tiered Cotton Midi Dress",
    slug: "entoto-tiered-cotton-midi-dress",
    price: 3450,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    category: "women",
    categoryLabel: "Women",
    collection: "Heritage Capsule",
    badge: "NEW",
    available: true,
    description: "Lightweight tiered dress crafted from hand-spun Ethiopian cotton with delicate hem embroidery.",
  },
  {
    id: "prod-na-2",
    name: "Shewa Linen Mandarin Shirt",
    slug: "shewa-linen-mandarin-shirt",
    price: 2150,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    category: "men",
    categoryLabel: "Men",
    badge: "NEW",
    available: true,
    description: "Breezy pure linen shirt featuring a modern mandarin collar and mother-of-pearl buttons.",
  },
  {
    id: "prod-na-3",
    name: "Abyssinian Structured Leather Tote",
    slug: "abyssinian-structured-leather-tote",
    price: 4800,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    category: "bags",
    categoryLabel: "Bags",
    collection: "Leather Guild",
    badge: "NEW",
    available: true,
    description: "Vegetable-tanned full-grain leather tote handcrafted by master leatherworkers in Addis Ababa.",
  },
  {
    id: "prod-na-4",
    name: "Tana Minimalist Leather Mules",
    slug: "tana-minimalist-leather-mules",
    price: 2900,
    image:
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80",
    category: "shoes",
    categoryLabel: "Shoes",
    badge: "NEW",
    available: true,
    description: "Sleek slip-on mules sculpted from buttery soft leather with a cushioned insole.",
  },
  {
    id: "prod-na-5",
    name: "Kaffa Handwoven Silk & Cotton Scarf",
    slug: "kaffa-handwoven-silk-cotton-scarf",
    price: 1650,
    image:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
    category: "accessories",
    categoryLabel: "Accessories",
    badge: "NEW",
    available: true,
    description: "Artisan-loomed Ethiopian scarf featuring subtle gold woven border accents.",
  },
];

/**
 * Curated Best Sellers
 */
export const bestSellers: Product[] = [
  {
    id: "prod-bs-1",
    name: "Semien Woven Cotton Tunic",
    slug: "semien-woven-cotton-tunic",
    price: 2600,
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
    category: "women",
    categoryLabel: "Women",
    badge: "BESTSELLER",
    available: true,
    description: "Our signature relaxed tunic featuring hand-loomed texture and contemporary side slits.",
  },
  {
    id: "prod-bs-2",
    name: "Awash Relaxed Linen Trouser",
    slug: "awash-relaxed-linen-trouser",
    price: 2350,
    image:
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80",
    category: "men",
    categoryLabel: "Men",
    badge: "BESTSELLER",
    available: true,
    description: "Tailored straight-leg trousers in breathable stone linen with an adjustable drawstring waist.",
  },
  {
    id: "prod-bs-3",
    name: "Zoma Artisan Brass Cuff",
    slug: "zoma-artisan-brass-cuff",
    price: 1250,
    image:
      "https://images.unsplash.com/photo-1611591475819-79b8b73ff2f3?auto=format&fit=crop&w=800&q=80",
    category: "accessories",
    categoryLabel: "Accessories",
    badge: "BESTSELLER",
    available: true,
    description: "Hand-hammered warm brass bracelet inspired by historic Ethiopian geometric motifs.",
  },
  {
    id: "prod-bs-4",
    name: "Bole Contemporary Tailored Blazer",
    slug: "bole-contemporary-tailored-blazer",
    price: 4950,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
    category: "women",
    categoryLabel: "Women",
    badge: "BESTSELLER",
    available: true,
    description: "Unstructured single-breasted blazer in fine woven cotton-linen blend.",
  },
];

/**
 * Featured Campaign / Capsule Collection
 */
export const featuredCollection: Collection = {
  id: "col-heritage",
  title: "The Heritage Capsule",
  slug: "heritage-capsule",
  subtitle: "Modern Ethiopian Tailoring • Volume IV",
  description:
    "An editorial dialogue between centuries-old handwoven cotton craftsmanship and architectural modern tailoring. Crafted in Addis Ababa with sustainably sourced regional fibers.",
  image:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85",
  badge: "LIMITED RELEASE",
  href: "/collections",
};

/**
 * Lookbook Preview Items
 */
export const lookbookItems: LookbookItem[] = [
  {
    id: "look-1",
    title: "Morning in Bole",
    caption: "Layered handwoven cotton with effortless tailoring.",
    season: "Spring / Summer 2026",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "portrait",
  },
  {
    id: "look-2",
    title: "Sculpted Textures",
    caption: "Raw organic cotton paired with vegetable-tanned accessories.",
    season: "Spring / Summer 2026",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "landscape",
  },
  {
    id: "look-3",
    title: "Addis Modernity",
    caption: "Clean architectural lines inspired by the capital's creative energy.",
    season: "Spring / Summer 2026",
    image:
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "portrait",
  },
  {
    id: "look-4",
    title: "Twilight Silhouette",
    caption: "Flowing midnight hues accented with subtle Ethiopian gold threading.",
    season: "Spring / Summer 2026",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "square",
  },
];
