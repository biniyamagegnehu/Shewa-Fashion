/**
 * Shewa Fashion — Prisma Client Singleton
 *
 * Exports a single shared PrismaClient instance that is safe to use
 * across Next.js hot-reloads in development and in production.
 *
 * IMPORTANT: This module is server-only. Never import it into a
 * Client Component ('use client'). If you accidentally do, Next.js
 * will throw a build error because PrismaClient cannot run in the
 * browser.
 *
 * Pattern: Store the client on the Node.js global object in
 * development so hot-reload does not create a new connection pool
 * on every module evaluation. In production, a fresh instance is
 * always created since the module cache persists for the lifetime
 * of the process.
 *
 * Reference: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from "@prisma/client";

// Extend the NodeJS global type to hold our cached client.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
