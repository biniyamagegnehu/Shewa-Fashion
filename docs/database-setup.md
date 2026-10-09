# Shewa Fashion — Database & Prisma Setup Guide

This guide details how to configure, run, migrate, and verify the local PostgreSQL database using Prisma ORM for the **Shewa Fashion** project.

All instructions are written for **Windows** using **PowerShell**.

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your machine:

* **Node.js**: v20 or newer (v24 LTS recommended)
* **npm**: v10 or newer
* **PostgreSQL**: PostgreSQL 16+ (PostgreSQL 18 is installed locally on Windows at `C:\Program Files\PostgreSQL\18\bin`)

---

## 2. PostgreSQL Installation & Service Management

### Check If PostgreSQL Is Running

Run the following command in PowerShell:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe"
```

If it returns `accepting connections`, PostgreSQL is actively running.

### Start or Stop the PostgreSQL Windows Service

If the service is stopped, manage it via PowerShell (run as Administrator if needed):

```powershell
# Start the service
Start-Service postgresql-x64-18

# Check service status
Get-Service postgresql-x64-18
```

---

## 3. Creating the Local Database

To create a dedicated `shewa_fashion` database, run `psql` or use `createdb`:

```powershell
# Connect as postgres superuser and create database
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE shewa_fashion;"
```

You will be prompted to enter the password chosen during PostgreSQL installation.

Alternatively, you can create it inside the interactive `psql` shell:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

Inside `psql`:

```sql
CREATE DATABASE shewa_fashion;
\l
\q
```

---

## 4. Configuring Environment Variables

Create a local `.env.local` file by copying `.env.example`:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and configure your `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shewa_fashion"
```

Replace `YOUR_PASSWORD` with your actual local PostgreSQL superuser password.

> **Security Note:**
> `.env.local` and `.env` files are ignored by Git (`.gitignore`).
> **Never commit real credentials or production connection strings to Git.**

---

## 5. Prisma Configuration Overview

In this project, Prisma is configured with:

* **Prisma Version:** `6.19.3`
* **Provider:** `postgresql`
* **Schema Location:** `prisma/schema.prisma`
* **Singleton Client:** `src/lib/prisma.ts` (prevents multiple client instances during Next.js hot-reloads)
* **Seed Script:** `prisma/seed.ts` (configured via `package.json#prisma.seed` using `tsx`)
* **Verification Script:** `prisma/verify-db.ts`

### Models Implemented

1. **`User`**: Administrator authentication model (stores `passwordHash`, role enum, no plaintext passwords).
2. **`Category`**: Shop categories (`women`, `men`, `kids`, `shoes`, `bags`, `accessories`).
3. **`Collection`**: Curated collections (`new-arrivals`, `best-sellers`, `everyday-essentials`, `ethiopian-heritage`, `seasonal-edit`).
4. **`Product`**: Fashion catalog products. Prices are stored in **Ethiopian Birr (ETB)** as integers.
5. **`ProductImage`**: Ordered product images (URLs only, not binary data).
6. **`ProductOption`**: Sizes, shoe sizes, colors, and one-size options per product.
7. **`GalleryItem`**: Curated fashion lookbook and editorial gallery.
8. **`ContactMessage`**: Customer contact submissions with `UNREAD`, `READ`, `ARCHIVED` status.
9. **`StoreSettings`**: Singleton store configuration (`id: "singleton"`).

---

## 6. Step-by-Step Workflow Commands

All scripts are pre-configured in `package.json`:

### Step 1: Validate Schema

Ensure the schema syntax and constraints are error-free:

```powershell
npx prisma validate
```

### Step 2: Generate the Prisma Client

Generates type definitions and client code:

```powershell
npm run db:generate
# or: npx prisma generate
```

### Step 3: Run Database Migrations

Create and apply the initial migration to your local PostgreSQL instance:

```powershell
npm run db:migrate
# or: npx prisma migrate dev --name init
```

This will create SQL migration files under `prisma/migrations/` and apply them to your `shewa_fashion` database.

### Step 4: Seed the Database

Populate initial categories, collections, demo products, gallery items, and store settings:

```powershell
npm run db:seed
# or: npx prisma db seed
```

The seed script is **fully idempotent** using upserts and deterministic slugs. It can be safely run multiple times without duplicating records.

### Step 5: Verify the Database

Run the automated verification script to confirm connectivity, record counts, and relational queries:

```powershell
npm run db:verify
# or: npx tsx prisma/verify-db.ts
```

Output should confirm:
* Connection success
* 6 categories
* 5 collections
* 18 products with images and options
* 5 gallery items
* Singleton store settings

### Step 6 (Optional): Open Prisma Studio

Inspect and manage records visually in the browser:

```powershell
npm run db:studio
# or: npx prisma studio
```

---

## 7. Development vs. Production Migrations

| Environment | Command | Behavior |
| :--- | :--- | :--- |
| **Development** | `npx prisma migrate dev` | Creates new migration SQL files, prompts for names, applies pending migrations, and re-generates client. |
| **Production / CI** | `npx prisma migrate deploy` | Applies existing committed migration SQL files without prompting or modifying schema. Run during deployment builds. |

---

## 8. Troubleshooting Common Errors

### `P1001: Can't reach database server at localhost:5432`
* **Cause**: PostgreSQL service is stopped or port 5432 is blocked.
* **Fix**: Run `Get-Service postgresql-x64-18` in PowerShell. If stopped, start it with `Start-Service postgresql-x64-18`.

### `P1000: Authentication failed against database server`
* **Cause**: Incorrect username or password in `DATABASE_URL`.
* **Fix**: Verify your credentials in `.env.local`. Test them with `& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres`.

### `P1003: Database does not exist`
* **Cause**: The `shewa_fashion` database has not been created yet.
* **Fix**: `npx prisma migrate dev` will offer to create it automatically, or create it manually with `CREATE DATABASE shewa_fashion;`.

### `Environment variable not found: DATABASE_URL`
* **Cause**: Prisma could not locate `.env.local` or `.env`.
* **Fix**: Ensure `.env.local` exists in the project root or provide the environment variable directly in PowerShell:
  ```powershell
  $env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shewa_fashion"
  ```

---

## 9. Configuring Production (Vercel / Supabase / Neon)

When deploying to Vercel or cloud platforms:

1. Create a hosted PostgreSQL database (e.g. Vercel Postgres, Supabase, Neon).
2. Set `DATABASE_URL` in your platform's environment variable dashboard (never in git).
3. If using a connection pooler (e.g. Supabase PgBouncer or Neon connection pooling), configure `DIRECT_URL` for direct DDL migrations:
   ```env
   DATABASE_URL="postgresql://user:pass@pooler.neon.tech/shewa_fashion?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://user:pass@direct.neon.tech/shewa_fashion?sslmode=require"
   ```
4. Configure the build command or post-build hook to execute `npx prisma migrate deploy`.
