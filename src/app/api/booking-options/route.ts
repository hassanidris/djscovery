import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getCitiesForCountry, getVenuesForCity } from "@/lib/actions/locations";

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizerCountryId = searchParams.get("organizerCountryId");
  const organizerCityId = searchParams.get("organizerCityId");
  const djCountryId = searchParams.get("djCountryId");
  const djCityId = searchParams.get("djCityId");

  try {
    // Fetch countries (static data, can be cached)
    const cacheKey = "booking_options:countries";
    let countries = await cacheGet<Array<{ id: number; name: string }>>(cacheKey);

    if (!countries) {
      countries = await prisma.country.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      await cacheSet(cacheKey, countries, 3600); // Cache for 1 hour
    }

    let initialCities: Array<{ id: number; name: string }> = [];
    let initialVenues: string[] = [];
    let defaultCountryId: number | undefined;
    let defaultCityId: number | undefined;

    // Fetch cities/venues based on organizer location first, then DJ location
    if (organizerCountryId && organizerCityId) {
      const citiesCacheKey = `booking_options:cities:${organizerCountryId}`;
      const venuesCacheKey = `booking_options:venues:${organizerCityId}`;

      const [cachedCities, cachedVenues] = await Promise.all([
        cacheGet<Array<{ id: number; name: string }>>(citiesCacheKey),
        cacheGet<string[]>(venuesCacheKey),
      ]);

      [initialCities, initialVenues] = await Promise.all([
        cachedCities || getCitiesForCountry(parseInt(organizerCountryId)),
        cachedVenues || getVenuesForCity(parseInt(organizerCityId)),
      ]);

      // Cache if not already cached
      if (!cachedCities) await cacheSet(citiesCacheKey, initialCities, 1800); // 30 min
      if (!cachedVenues) await cacheSet(venuesCacheKey, initialVenues, 1800); // 30 min

      defaultCountryId = parseInt(organizerCountryId);
      defaultCityId = parseInt(organizerCityId);
    } else if (djCountryId && djCityId) {
      const citiesCacheKey = `booking_options:cities:${djCountryId}`;
      const venuesCacheKey = `booking_options:venues:${djCityId}`;

      const [cachedCities, cachedVenues] = await Promise.all([
        cacheGet<Array<{ id: number; name: string }>>(citiesCacheKey),
        cacheGet<string[]>(venuesCacheKey),
      ]);

      [initialCities, initialVenues] = await Promise.all([
        cachedCities || getCitiesForCountry(parseInt(djCountryId)),
        cachedVenues || getVenuesForCity(parseInt(djCityId)),
      ]);

      // Cache if not already cached
      if (!cachedCities) await cacheSet(citiesCacheKey, initialCities, 1800); // 30 min
      if (!cachedVenues) await cacheSet(venuesCacheKey, initialVenues, 1800); // 30 min

      defaultCountryId = parseInt(djCountryId);
      defaultCityId = parseInt(djCityId);
    }

    return NextResponse.json({
      countries,
      initialCities,
      initialVenues,
      defaultCountryId,
      defaultCityId,
    });
  } catch (error) {
    console.error("Failed to fetch booking options:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking options" },
      { status: 500 }
    );
  }
}
