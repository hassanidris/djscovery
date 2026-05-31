/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: "incremental",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // @opentelemetry/api is an optional peer dep of supabase-js — ignore it
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@opentelemetry/api": false,
    };
    return config;
  },
};

export default nextConfig;
