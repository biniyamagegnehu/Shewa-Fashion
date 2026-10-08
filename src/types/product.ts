/**
 * Shewa Fashion - Product & Commerce Types
 */

export type ProductCategory =
  | "women"
  | "men"
  | "kids"
  | "shoes"
  | "bags"
  | "accessories";

export type ProductBadge = "NEW" | "BESTSELLER" | "FEATURED" | "LIMITED";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number; // In Ethiopian Birr (ETB)
  image: string;
  category: ProductCategory;
  categoryLabel: string;
  collection?: string;
  badge?: ProductBadge;
  available: boolean;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: ProductCategory;
  description: string;
  itemCount: number;
  image: string;
  href: string;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  image: string;
  badge?: string;
  href: string;
}

export interface LookbookItem {
  id: string;
  title: string;
  caption: string;
  season: string;
  image: string;
  aspectRatio?: "portrait" | "landscape" | "square";
}
