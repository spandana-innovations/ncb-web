/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  
  // Compress responses
  compress: true,
  
  // Aggressive static asset caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // Images and fonts: 1 week
        source: "/(.*\\.(?:png|jpg|jpeg|gif|ico|woff2|woff))",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
  
  // Prefetch links in viewport (default true but making explicit)
  experimental: {
    optimisticClientCache: true,
  },
};

export default nextConfig;
