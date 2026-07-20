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
): Promise<VenueSuggestion> {
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
      return venueData;
    }

    // Check if venue already exists
    const existing = await prisma.venue.findFirst({
      where: {
        name: { equals: venueData.name, mode: "insensitive" },
        cityId: city.id,
      },
    });

    if (existing) {
      // Increment popularity
      await prisma.venue.update({
        where: { id: existing.id },
        data: { popularity: { increment: 1 } },
      });
      return {
        ...venueData,
        id: existing.id,
        cityId: city.id,
      };
    }

    // Create new venue
    const newVenue = await prisma.venue.create({
      data: {
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
      id: newVenue.id,
      cityId: city.id,
    };
  } catch (error) {
    console.error("Error caching venue:", error);
    return venueData;
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

  return combined.slice(0, 5);
}
