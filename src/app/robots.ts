// app/robots.ts
import { indexingEnabled } from "@/lib/seo/indexing";
import type { MetadataRoute } from "next";

export const revalidate = 86400; // Cache for 24 hours

export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
