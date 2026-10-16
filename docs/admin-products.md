# Shewa Fashion — Phase 12: Product Management Documentation

## Overview

Phase 12 delivers an end-to-end, secure, mobile-first product catalogue management system for administrators of Shewa Fashion. This includes product listing with server-side search, filtering, and pagination, product creation with client and server validation, product editing with live slug and relation management, and safe deletion with transactional cascade clean-up.

---

## 1. Routes & Server-Side Security

All admin product routes and server mutations are guarded by server-side administrator session validation (`requireAdminSession` / `verifyAdminSession`). Client-side checks alone are never relied upon.

| Route | Method | Guard | Description |
|---|---|---|---|
| `/admin/products` | GET | `requireAdminSession('/admin/products')` | Catalogue product list with search, category/collection/status filters, pagination, and responsive cards/table. |
| `/admin/products/new` | GET | `requireAdminSession('/admin/products/new')` | Add new product form with live slug generator and image preview. |
| `/admin/products/[id]/edit` | GET | `requireAdminSession('/admin/products/[id]/edit')` | Pre-populated edit form. Returns 404 (`notFound()`) if invalid ID. |
| `createProductAction` | POST (Action) | `verifyAdminSession()` | Server action to validate input, ensure slug uniqueness, verify category/collection IDs in DB, and create product inside a transaction. |
| `updateProductAction` | POST (Action) | `verifyAdminSession()` | Server action to validate updates, verify slug uniqueness (retaining current slug), and update relations in a transaction. |
| `deleteProductAction` | POST (Action) | `verifyAdminSession()` | Server action to safely delete product, cascade remove images and options, while preserving categories and collections. |

---

## 2. Supported Data Model & Relations

Prisma schema models utilized:
- **`Product`**:
  - `id`: CUID identifier
  - `name`: String, 2–120 characters
  - `slug`: String, unique, URL-safe kebab-case
  - `description`: String, 10–2000 characters
  - `price`: Integer in Ethiopian Birr (ETB), non-negative (e.g. `4800` = 4,800 ETB)
  - `available`: Boolean (published vs draft/hidden)
  - `featured`: Boolean (curated showcase)
  - `categoryId`: Foreign key to `Category` (`onDelete: SetNull`)
  - `collectionId`: Foreign key to `Collection` (`onDelete: SetNull`)
- **`ProductImage`**:
  - `url`: String (validated `https://`, `http://`, or `/images/...` URL; unsafe schemes rejected)
  - `alt`: String
  - `sortOrder`: Integer
  - Relation: `onDelete: Cascade` to `Product`
- **`ProductOption`**:
  - `type`: Enum (`SIZE`, `SHOE_SIZE`, `COLOR`, `ONE_SIZE`)
  - `value`: String
  - Relation: `onDelete: Cascade` to `Product`

---

## 3. Product Listing Features

- **Search**: Case-insensitive text search across product name, slug, and description.
- **Filter Toolbar**:
  - Category dropdown (populated from PostgreSQL `Category` records)
  - Collection dropdown (populated from PostgreSQL `Collection` records)
  - Publication Status (All, Published, Draft / Hidden)
  - Featured Flag (All, Featured Only, Standard)
- **Pagination**:
  - Page size: 10 items per page
  - URL-synchronized `page` parameter with query preservation
  - Previous / Next buttons with boundary disabling and page pill indicators
- **Mobile Responsive Design**:
  - Desktop: Full tabular view with thumbnail, name, slug, category, collection, price, badges, updated date, and action buttons. Contained with horizontal overflow protection.
  - Mobile: Clean vertical card list with responsive image thumbnails, stacked badges, and touch-friendly actions. Zero viewport overflow.
- **Empty States**:
  - Distinguishes between completely empty catalogue and no search/filter matches.

---

## 4. Product Creation & Editing

- **Validation Engine (`src/lib/validation.ts`)**:
  - Client and server shared validation rules.
  - `slugify()`: Converts names into clean kebab-case URLs.
  - `isValidImageUrl()`: Validates URL formats and blocks unsafe URI schemes (`javascript:`, `data:`, `ftp:`).
  - Integer ETB representation: Prevents floating-point rounding errors.
- **Slug Conflict Handling**:
  - When creating: rejects existing slugs in the database with user-friendly error message.
  - When editing: permits product to retain its own existing slug while rejecting collisions with other products.
- **Relational Integrity**:
  - Category and collection references are checked against actual database records before insertion.
  - Options (sizes and colors) are cleanly separated and updated inside atomic Prisma transactions.

---

## 5. Public Catalogue Compatibility

- **Public Shop (`/shop`, `/products/[slug]`)**:
  - Respects `available: true` visibility rules.
  - Draft (`available: false`) products do not appear in public listings or search queries.
  - Deleted products immediately return 404 in public routes.
  - Cache revalidation is automatically triggered via `revalidatePath('/shop')`, `revalidatePath('/products')`, and `revalidatePath('/admin')` upon any mutation.

---

## 6. Verification Commands

Run the test suites to verify functionality:
```bash
# Verify Phase 12 product management
npm run test:products

# Verify Phase 11 dashboard metrics
npm run test:dashboard

# Verify Phase 10 authentication & authorization
npm run test:auth

# Verify public catalog
npm run test:catalog

# Full Next.js production build verification
npm run build
```
