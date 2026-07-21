import prisma from "@/lib/client";
import { searchMapbox, type VenueSuggestion } from "./venueAutocomplete";

/**
 * Search local Venue database (server-side only)
 */
export async function searchVenues(
  query: string,
  countryId?: number,
): Promise<VenueSuggestion[]> {
  if (!query || query.length < 2) return [];

  const venues = await prisma.venue.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
      ...(countryId && { countryId }),
    },
    include: {
      city: true,
      country: true,
    },
    take: 5,
    orderBy: {
      popularity: "desc",
    },
  });

  return venues.map((v) => ({
    id: v.id,
    name: v.name,
    address: v.address,
    cityId: v.cityId,
    cityName: v.city.name,
    countryId: v.countryId,
    countryName: v.country.name,
    latitude: v.latitude,
    longitude: v.longitude,
    externalId: v.externalId,
  }));
}

/**
 * Cache external venue result in local database (server-side only)
 */
export async function cacheExternalVenue(
  venueData: VenueSuggestion,
): Promise<VenueSuggestion | null> {
  try {
    // Find or create city
    let city = await prisma.city.findFirst({
      where: {
        name: { equals: venueData.cityName, mode: "insensitive" },
        countryId: venueData.countryId,
      },
    });

    if (!city && venueData.countryId) {
      city = await prisma.city.create({
        data: {
          name: venueData.cityName,
          countryId: venueData.countryId,
        },
      });
    }

    if (!city) {
      return null;
    }

    // Upsert venue using [name, cityId] unique constraint
    const venue = await prisma.venue.upsert({
      where: {
        name_cityId: { name: venueData.name, cityId: city.id },
      },
      update: {
        popularity: { increment: 1 },
        latitude: venueData.latitude ?? undefined,
        longitude: venueData.longitude ?? undefined,
        externalId: venueData.externalId ?? undefined,
      },
      create: {
        name: venueData.name,
        address: venueData.address,
        cityId: city.id,
        countryId: venueData.countryId,
        latitude: venueData.latitude,
        longitude: venueData.longitude,
        source: "mapbox",
        externalId: venueData.externalId,
        popularity: 1,
      },
    });

    return {
      ...venueData,
      id: venue.id,
      cityId: city.id,
    };
  } catch (error) {
    console.error("Error caching venue:", error);
    return null;
  }
}

/**
 * Hybrid search: local first, Mapbox fallback (server-side only)
 */
export async function searchVenuesHybrid(
  query: string,
  countryId?: number,
  countryName?: string,
): Promise<VenueSuggestion[]> {
  // Search local database first
  const localResults = await searchVenues(query, countryId);

  // If we have enough local results, return them
  if (localResults.length >= 3) {
    return localResults;
  }

  // Otherwise, search Mapbox
  const mapboxResults = await searchMapbox(query, countryName);

  // Combine results, removing duplicates
  const combined = [...localResults];
  const localNames = new Set(localResults.map((v) => v.name.toLowerCase()));

  for (const mapboxVenue of mapboxResults) {
    if (!localNames.has(mapboxVenue.name.toLowerCase())) {
      combined.push(mapboxVenue);
    }
  }

  // Cache Mapbox results fire-and-forget so future searches hit local DB first
  for (const venue of mapboxResults) {
    if (venue.name && venue.cityName && venue.countryId) {
      cacheExternalVenue(venue).catch(() => {});
    }
  }

  return combined.slice(0, 5);
}
