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
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';

    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://*.s3.amazonaws.com https://*.r2.cloudflarestorage.com https://*.public.blob.vercel-storage.com https://*.shewafashion.com",
      "connect-src 'self' https://api.cloudinary.com https://*.shewafashion.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ];

    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
      },
      {
        key: 'Content-Security-Policy',
        value: cspDirectives.join('; '),
      },
      ...(isProd
        ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains',
            },
          ]
        : []),
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
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
