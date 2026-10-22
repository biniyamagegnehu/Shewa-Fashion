import type { NextConfig } from "next";

function getRemotePatterns() {
  const patterns: Array<{ protocol: "http" | "https"; hostname: string; port?: string; pathname?: string }> = [
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    },
    // AWS S3
    {
      protocol: "https",
      hostname: "**.s3.amazonaws.com",
    },
    {
      protocol: "https",
      hostname: "**.s3.*.amazonaws.com",
    },
    // Cloudflare R2
    {
      protocol: "https",
      hostname: "**.r2.cloudflarestorage.com",
    },
    {
      protocol: "https",
      hostname: "**.r2.dev",
    },
    // Vercel Blob
    {
      protocol: "https",
      hostname: "**.public.blob.vercel-storage.com",
    },
    {
      protocol: "https",
      hostname: "blob.vercel-storage.com",
    },
    // Cloudinary
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
    },
    // Shewa Fashion custom CDN / public domain (cdn.shewafashion.com and any subdomain)
    {
      protocol: "https",
      hostname: "cdn.shewafashion.com",
    },
    {
      protocol: "https",
      hostname: "**.shewafashion.com",
    },
  ];

  // Support custom domain / endpoint if configured in environment
  const customUrls = [process.env.STORAGE_PUBLIC_URL, process.env.STORAGE_ENDPOINT].filter(Boolean);
  for (const rawUrl of customUrls) {
    try {
      const parsed = new URL(rawUrl as string);
      const proto = parsed.protocol.replace(":", "") as "http" | "https";
      if (!patterns.some((p) => p.hostname === parsed.hostname)) {
        patterns.push({
          protocol: proto === "http" ? "http" : "https",
          hostname: parsed.hostname,
          port: parsed.port || undefined,
        });
      }
    } catch {
      // Ignore invalid URL strings in environment
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: getRemotePatterns(),
  },
  experimental: {
    agentFeedback: true,
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
