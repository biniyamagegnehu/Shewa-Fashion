# Shewa Fashion — Phase 11: Admin Dashboard

## 1. Overview & Architecture

Phase 11 introduces the authenticated administration dashboard for Shewa Fashion at `/admin`.

The dashboard is built using Next.js 16.4 App Router server components, PostgreSQL 18, and Prisma ORM. It provides a real-time executive overview of the fashion retailer's catalogue, inventory status, and store configuration, while strictly adhering to server-side session authorization established in Phase 10.

---

## 2. Route Access Control & Security

### Authorization Enforcement
* Every request to `/admin` invokes `requireAdminSession('/admin')` from `src/lib/auth.ts` on the server before rendering.
* **Unauthenticated Visitors**: Redirected directly to `/admin/login?from=%2Fadmin`.
* **Database Role Verification**: Validates that the user actively exists in PostgreSQL with `role === 'ADMIN'`. Client-provided headers or cookies are never trusted for authorization.
* **Open Redirect Defense**: Destination paths are sanitized with `getSafeRedirectUrl()`, restricting redirections exclusively to verified internal `/admin` routes.
* **Session Termination**: Logging out via the navigation bar calls `logoutAction()`, which revokes the session record in PostgreSQL and clears the `HttpOnly` cookie.

---

## 3. Reusable Layout & Navigation Structure

### Layout Architecture
* **[AdminShell](file:///c:/Users/biniy/Desktop/Dev/Shewa-Fashion/src/components/admin/admin-shell.tsx)**: Reusable layout container providing sidebar offset (`lg:pl-64`), header integration, zero horizontal overflow (`overflow-x-hidden`), and consistent spacing across all administration pages.
* **[AdminNav](file:///c:/Users/biniy/Desktop/Dev/Shewa-Fashion/src/components/admin/admin-nav.tsx)**:
  * **Desktop Sidebar**: Fixed 64-width (`16rem`) sidebar with Shewa Fashion branding, active link indicators, and administrator profile card.
  * **Mobile Drawer**: Off-canvas slide-out drawer accessible via hamburger button on mobile screens (< 1024px), featuring backdrop blur, focus trap, and Escape key dismissal.
* **[AdminHeader](file:///c:/Users/biniy/Desktop/Dev/Shewa-Fashion/src/components/admin/admin-header.tsx)**: Top navigation bar displaying breadcrumbs, current view title, public storefront quick link (`View Store ↗`), and administrator identity badge.

### Navigation Items & Scope Boundaries
| Navigation Item | Route | Status | Phase | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Overview** | `/admin` | Active | Phase 11 | Complete catalogue overview and statistics dashboard. |
| **Products** | `#` | Planned | Phase 12 | Catalogue product CRUD and inventory management (Coming Soon). |
| **Categories & Collections** | `#` | Planned | Phase 13 | Taxonomy and curation grouping controls (Coming Soon). |
| **Lookbook & Store Settings** | `#` | Planned | Phase 14 | Editorial gallery and store metadata controls (Coming Soon). |
| **Image Infrastructure** | `#` | Planned | Phase 15 | Media upload and asset pipeline management (Coming Soon). |

*Note: Future phase navigation entries are clearly labeled and disabled to prevent broken 404 links or confusing placeholder redirects.*

---

## 4. Real Database Overview Data

All statistics are queried directly on the server using Prisma count and aggregate operations:

1. **Total Products**: `prisma.product.count()`
2. **Available Products**: `prisma.product.count({ where: { available: true } })`
3. **Featured Products**: `prisma.product.count({ where: { featured: true } })`
4. **Categories Count**: `prisma.category.count()`
5. **Collections Count**: `prisma.collection.count()`
6. **Lookbook Items**: `prisma.galleryItem.count()`
7. **Store Configuration**: `prisma.storeSettings.findUnique({ where: { id: 'singleton' } })`
8. **Recent Products**: `prisma.product.findMany({ take: 6, orderBy: { createdAt: 'desc' } })` including primary image, category, and collection relations.

### Currency Convention
All product prices are stored as full-Birr integers in PostgreSQL and formatted cleanly according to project conventions:
```typescript
`${product.price.toLocaleString()} ETB`
```

### Error & Empty State Resilience
* If the database encounters a connection issue, a non-intrusive alert banner informs the administrator without exposing SQL syntax, connection strings, or internal stack traces.
* If the catalogue is empty (0 products), a helpful empty state card is displayed instead of a blank table.

---

## 5. Mobile & Responsive Design

The layout was verified to prevent horizontal overflow across all required viewport widths:
* **Mobile (320px, 375px, 390px, 430px)**:
  * Single-column stacking for statistics cards (`grid-cols-1`).
  * Card-list view for recent products (`sm:hidden`) replacing wide tabular layouts.
  * Off-canvas drawer navigation with touch-friendly 44px+ hit targets.
* **Tablet (768px)**:
  * Two-column grid (`sm:grid-cols-2`) for statistics cards.
  * Structured table view (`sm:block`) with horizontal scroll container.
* **Desktop (1024px, 1280px, 1440px)**:
  * Four-column grid (`lg:grid-cols-4`) for statistics.
  * Fixed 64-width left sidebar and sticky top header.

---

## 6. Verification & Test Commands

Run the Phase 11 dashboard automated verification suite:
```bash
npm run test:dashboard
```

Run full regression test suites:
```bash
npm run test:auth
npm run test:api-response
npm run test:catalog
npm run db:verify
```

Verify TypeScript compiler and production build:
```bash
npx tsc --noEmit
npm run build
```
