import prisma from "@/lib/client";
import mapboxSdk from "@mapbox/mapbox-sdk";
import geocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { cacheGet, cacheSet } from "@/lib/cache";

let _geocoder: ReturnType<typeof geocoding> | null = null;

function getGeocoder(): ReturnType<typeof geocoding> | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;
  if (!_geocoder) {
    _geocoder = geocoding(mapboxSdk({ accessToken: token }));
  }
  return _geocoder;
}

const CACHE_TTL_DAYS = 30; // Cache coordinates for 30 days
const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

// Rate limiting for Mapbox API (600 requests per minute for free tier)
const RATE_LIMIT_DELAY_MS = 100; // 100ms between requests = 600 requests/minute
const MAX_RETRIES = 2;

export interface GeocodedVenue {
  id: number;
  venueName: string;
  city: { name: string };
  country: { name: string };
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

/**
 * Geocode a city to get its coordinates
 */
export async function geocodeCity(
  cityName: string,
  countryName: string,
): Promise<{ lat: number; lng: number } | null> {
  const g = getGeocoder();
  if (!g) return null;

  const query = `${cityName}, ${countryName}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await g
        .forwardGeocode({
          query,
          limit: 1,
          types: ["place"],
        })
        .send();

      if (response.body.features.length > 0) {
        const [longitude, latitude] = response.body.features[0].center;
        return { lat: latitude, lng: longitude };
      }
      return null;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error("Geocoding error for city:", cityName, error);
        return null;
      }
      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  return null;
}

/**
 * Geocode a specific venue to get its coordinates
 */
export async function geocodeVenue(
  venueName: string,
  cityName: string,
  countryName: string,
): Promise<{ lat: number; lng: number } | null> {
  const g = getGeocoder();
  if (!g) return null;

  const query = `${venueName}, ${cityName}, ${countryName}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await g
        .forwardGeocode({
          query,
          limit: 1,
          types: ["poi"], // Only search for points of interest (venues, clubs, bars, etc.)
        })
        .send();

      if (response.body.features.length > 0) {
        const [longitude, latitude] = response.body.features[0].center;
        return { lat: latitude, lng: longitude };
      }
      return null;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error("Geocoding error for venue:", venueName, error);
        return null;
      }
      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  return null;
}

/**
 * Batch geocode multiple venues with caching, deduplication, and rate limiting
 */
export async function batchGeocodeVenues(
  venues: Array<{
    id: number;
    venueName: string;
    city: { name: string };
    country: { name: string };
    latitude?: number | null;
    longitude?: number | null;
  }>,
): Promise<Array<GeocodedVenue & { lat: number; lng: number }>> {
  // Deduplicate city geocoding requests
  const cityCache = new Map<string, { lat: number; lng: number } | null>();

  const results = [];
  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i];

    // Check Redis cache first
    const cacheKey = `venue_coords:${venue.id}`;
    const cached = await cacheGet<{ lat: number; lng: number }>(cacheKey);

    if (cached) {
      results.push({
        ...venue,
        lat: cached.lat,
        lng: cached.lng,
      });
      continue;
    }

    // Check if already cached in database and still valid (within TTL)
    if (venue.latitude && venue.longitude) {
      // Cache in Redis for 24 hours
      await cacheSet(
        cacheKey,
        { lat: venue.latitude, lng: venue.longitude },
        86400,
      );
      results.push({
        ...venue,
        lat: venue.latitude,
        lng: venue.longitude,
      });
      continue;
    }

    // Rate limiting: add delay between API calls
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }

    // Geocode the venue first
    const venueCoords = await geocodeVenue(
      venue.venueName,
      venue.city.name,
      venue.country.name,
    );

    if (venueCoords) {
      // Cache venue coordinates in database
      await prisma.djVenue.update({
        where: { id: venue.id },
        data: {
          latitude: venueCoords.lat,
          longitude: venueCoords.lng,
          geocodedAt: new Date(),
        },
      });
      // Cache in Redis for 24 hours
      await cacheSet(cacheKey, venueCoords, 86400);
      results.push({
        ...venue,
        lat: venueCoords.lat,
        lng: venueCoords.lng,
      });
      continue;
    }

    // Fallback to city geocoding with deduplication
    const cityKey = `${venue.city.name},${venue.country.name}`;
    let cityCoords = cityCache.get(cityKey);

    if (cityCoords === undefined) {
      cityCoords = await geocodeCity(venue.city.name, venue.country.name);
      cityCache.set(cityKey, cityCoords);
    }

    if (cityCoords) {
      // Cache city coordinates in database
      await prisma.djVenue.update({
        where: { id: venue.id },
        data: {
          latitude: cityCoords.lat,
          longitude: cityCoords.lng,
          geocodedAt: new Date(),
        },
      });
      // Cache in Redis for 24 hours
      await cacheSet(cacheKey, cityCoords, 86400);
      results.push({
        ...venue,
        lat: cityCoords.lat,
        lng: cityCoords.lng,
      });
      continue;
    }

    // No coordinates found
    results.push({
      ...venue,
      lat: undefined,
      lng: undefined,
    });
  }

  // Filter out venues without coordinates
  return results.filter(
    (v): v is GeocodedVenue & { lat: number; lng: number } =>
      v.lat !== undefined && v.lng !== undefined,
  );
}
