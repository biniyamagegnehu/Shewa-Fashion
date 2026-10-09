import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import {
  getCatalogProducts,
  getCatalogCategories,
  getCatalogCollections,
} from "../src/lib/products";

async function main() {
  console.log("=== Testing Shewa Fashion Catalog Queries ===\n");

  // 1. Default Query
  const defaultRes = await getCatalogProducts({});
  console.log(`[1] Default Products: count=${defaultRes.totalCount}, pageItems=${defaultRes.products.length}, totalPages=${defaultRes.totalPages}`);
  if (defaultRes.totalCount !== 18 || defaultRes.products.length !== 12) {
    throw new Error("Default query assertion failed");
  }

  // 2. Pagination - Page 2
  const page2Res = await getCatalogProducts({ page: 2 });
  console.log(`[2] Page 2 Products: count=${page2Res.totalCount}, pageItems=${page2Res.products.length}, currentPage=${page2Res.currentPage}`);
  if (page2Res.products.length !== 6 || page2Res.currentPage !== 2) {
    throw new Error("Page 2 query assertion failed");
  }

  // 3. Category Filter: Shoes
  const shoesRes = await getCatalogProducts({ category: "shoes" });
  console.log(`[3] Shoes Category: count=${shoesRes.totalCount}, all match shoes: ${shoesRes.products.every((p) => p.category?.slug === "shoes")}`);
  if (shoesRes.totalCount === 0 || !shoesRes.products.every((p) => p.category?.slug === "shoes")) {
    throw new Error("Category filter assertion failed");
  }

  // 4. Collection Filter: Best Sellers
  const bsRes = await getCatalogProducts({ collection: "best-sellers" });
  console.log(`[4] Best Sellers Collection: count=${bsRes.totalCount}`);
  if (bsRes.totalCount === 0) {
    throw new Error("Collection filter assertion failed");
  }

  // 5. Keyword Search: 'linen'
  const linenRes = await getCatalogProducts({ q: "linen" });
  console.log(`[5] Search 'linen': count=${linenRes.totalCount}`);
  if (linenRes.totalCount === 0) {
    throw new Error("Search assertion failed");
  }

  // 6. Availability: Available only
  const availRes = await getCatalogProducts({ availability: "available" });
  console.log(`[6] Availability filter: count=${availRes.totalCount}`);

  // 7. Sort: Price Ascending
  const priceAsc = await getCatalogProducts({ sort: "price-asc", pageSize: 5 });
  console.log(`[7] Sort 'price-asc': first=${priceAsc.products[0]?.price} ETB, second=${priceAsc.products[1]?.price} ETB`);
  if ((priceAsc.products[0]?.price ?? 0) > (priceAsc.products[1]?.price ?? 0)) {
    throw new Error("Price ascending sort assertion failed");
  }

  // 8. Sort: Price Descending
  const priceDesc = await getCatalogProducts({ sort: "price-desc", pageSize: 5 });
  console.log(`[8] Sort 'price-desc': first=${priceDesc.products[0]?.price} ETB, second=${priceDesc.products[1]?.price} ETB`);
  if ((priceDesc.products[0]?.price ?? 0) < (priceDesc.products[1]?.price ?? 0)) {
    throw new Error("Price descending sort assertion failed");
  }

  // 9. Categories & Collections List
  const categories = await getCatalogCategories();
  const collections = await getCatalogCollections();
  console.log(`[9] Metadata: ${categories.length} categories, ${collections.length} collections`);
  if (categories.length !== 6 || collections.length !== 5) {
    throw new Error("Category/Collection count assertion failed");
  }

  // 10. Invalid Query Handling
  const invalidRes = await getCatalogProducts({
    category: "nonexistent-category-slug",
    sort: "unsupported-sort-value",
    page: -10,
  });
  console.log(`[10] Invalid Parameters Safe Handling: count=${invalidRes.totalCount}, currentPage=${invalidRes.currentPage}`);
  if (invalidRes.totalCount !== 0 || invalidRes.currentPage !== 1) {
    throw new Error("Invalid parameters assertion failed");
  }

  console.log("\n✅ All catalog queries successfully verified against live database!");
}

main().catch((err) => {
  console.error("❌ Catalog test error:", err);
  process.exit(1);
});
