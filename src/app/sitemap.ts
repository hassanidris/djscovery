import { MetadataRoute } from "next";
import { indexingEnabled } from "@/lib/seo/indexing";
import prisma from "@/lib/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://djcovery.com";

export const revalidate = 3600; // Cache for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexingEnabled) {
    return [];
  }

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/directory`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Fetch approved DJ profiles
  const djProfiles = await prisma.djProfile.findMany({
    where: {
      status: "APPROVED",
      deletedAt: null,
      hidden: false,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const djUrls: MetadataRoute.Sitemap = djProfiles.map((dj) => ({
    url: `${SITE_URL}/djs/${dj.slug}`,
    lastModified: dj.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Fetch published events
  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      startDate: { gte: new Date() },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const eventUrls: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Fetch approved organizer profiles
  const organizerProfiles = await prisma.organizerProfile.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const organizerUrls: MetadataRoute.Sitemap = organizerProfiles.map((org) => ({
    url: `${SITE_URL}/organizers/${org.slug}`,
    lastModified: org.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...djUrls, ...eventUrls, ...organizerUrls];
}
