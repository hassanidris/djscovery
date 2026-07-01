"use server";

import prisma from "@/lib/client";

export async function getCountries() {
  return prisma.country.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getCitiesForCountry(countryId: number) {
  return prisma.city.findMany({
    where: { countryId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getVenuesForCity(cityId: number, limit = 40) {
  const fetchLimit = Math.max(limit * 4, limit);

  const [gigs, events] = await Promise.all([
    prisma.gig.findMany({
      where: { cityId, venueName: { not: null } },
      select: { venueName: true },
      take: fetchLimit,
      orderBy: [{ venueName: "asc" }, { createdAt: "desc" }],
    }),
    prisma.event.findMany({
      where: { cityId, venue: { not: null } },
      select: { venue: true },
      take: fetchLimit,
      orderBy: [{ venue: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const names = new Set<string>();
  for (const record of gigs) {
    const name = record.venueName?.trim();
    if (name) names.add(name);
  }
  for (const record of events) {
    const name = record.venue?.trim();
    if (name) names.add(name);
  }

  return Array.from(names)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, limit);
}
