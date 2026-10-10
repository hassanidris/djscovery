import { MetadataRoute } from "next";
import { indexingEnabled } from "@/lib/seo/indexing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://djcovery.com";

export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
      sitemap: `${SITE_URL}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard/",
          "/dj/",
          "/organizer/",
          "/fan/",
          "/account/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
