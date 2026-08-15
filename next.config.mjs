import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isCI =
  process.env.CI === "true" || process.env.NEXT_PUBLIC_APP_ENV === "staging";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/organizer/gigs",
        destination: "/organizer/gigs",
        permanent: true,
      },
      {
        source: "/dashboard/organizer/gigs/new",
        destination: "/organizer/gigs/new",
        permanent: true,
      },
      {
        source: "/dashboard/organizer/gigs/:gigId/edit",
        destination: "/organizer/gigs/:gigId/edit",
        permanent: true,
      },
      {
        source: "/dashboard/organizer/gigs/:gigId/applications",
        destination: "/organizer/gigs/:gigId/applications",
        permanent: true,
      },
      {
        source: "/dashboard/organizer/gigs/:gigId",
        destination: "/organizer/gigs/:gigId",
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
    serverComponentsExternalPackages: ["pg", "@prisma/adapter-pg"],
  },
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    unoptimized: isCI,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "d21buns5ku92am.cloudfront.net" },
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "*.cloudfront.net" },
      { protocol: "https", hostname: "*.sndcdn.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i.kfs.io" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "*.gstatic.com" },
      { protocol: "https", hostname: "imgproxy.ra.co" },
      { protocol: "https", hostname: "cdn.mos.cms.futurecdn.net" },
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "media.wonderlandmagazine.com" },
      { protocol: "https", hostname: "www.rollingstone.com" },
      { protocol: "https", hostname: "djmag.com" },
      { protocol: "https", hostname: "djlifemag.com" },
      { protocol: "https", hostname: "taogroup.com" },
      { protocol: "https", hostname: "theplayground.co.uk" },
      { protocol: "https", hostname: "www.b4l.cz" },
      { protocol: "https", hostname: "www.discoverbenelux.com" },
      { protocol: "https", hostname: "assets.podomatic.net" },
      {
        protocol: "https",
        hostname: "jarmybsjvztwrmsdcnje.supabase.co",
        pathname: "/storage/v1/object/public/djscovery-media/**",
      },
      {
        protocol: "https",
        hostname: "unrqebwfdfumpjgvavbk.supabase.co",
        pathname: "/storage/v1/object/public/djscovery-media/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      { protocol: "https", hostname: "*.tiktokcdn.com" },
      { protocol: "https", hostname: "*.tiktokcdn-eu.com" },
      { protocol: "https", hostname: "*.tiktokcdn-us.com" },
      { protocol: "https", hostname: "*.tiktokcdn-asia.com" },
      { protocol: "https", hostname: "*.tiktok.com" },
      { protocol: "https", hostname: "*.vimeocdn.com" },
      { protocol: "https", hostname: "*.instagram.com" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default withBundleAnalyzer(
  withSentryConfig(nextConfig, {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  }),
);
