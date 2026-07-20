import prisma from "@/lib/client";
import mapboxSdk from "@mapbox/mapbox-sdk";
import geocoding from "@mapbox/mapbox-sdk/services/geocoding";

const mapboxClient = mapboxSdk({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
});

const geocoder = geocoding(mapboxClient);

const CACHE_TTL_DAYS = 30; // Cache coordinates for 30 days
const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

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
  try {
    const query = `${cityName}, ${countryName}`;
    const response = await geocoder
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
    console.error("Geocoding error for city:", cityName, error);
    return null;
  }
}

/**
 * Geocode a specific venue to get its coordinates
 */
export async function geocodeVenue(
  venueName: string,
  cityName: string,
  countryName: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = `${venueName}, ${cityName}, ${countryName}`;
    const response = await geocoder
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
    console.error("Geocoding error for venue:", venueName, error);
    return null;
  }
}

/**
 * Batch geocode multiple venues with caching
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
  const results = await Promise.all(
    venues.map(async (venue) => {
      // Check if already cached and still valid (within TTL)
      if (venue.latitude && venue.longitude) {
        // For now, we assume cached coordinates are valid
        // In a future enhancement, we could check geocodedAt timestamp
        return {
          ...venue,
          lat: venue.latitude,
          lng: venue.longitude,
        };
      }

      // Geocode the venue first
      const venueCoords = await geocodeVenue(
        venue.venueName,
        venue.city.name,
        venue.country.name,
      );

      if (venueCoords) {
        // Cache venue coordinates
        await prisma.djVenue.update({
          where: { id: venue.id },
          data: {
            latitude: venueCoords.lat,
            longitude: venueCoords.lng,
            geocodedAt: new Date(),
          },
        });
        return {
          ...venue,
          lat: venueCoords.lat,
          lng: venueCoords.lng,
        };
      }

      // Fallback to city geocoding
      const cityCoords = await geocodeCity(venue.city.name, venue.country.name);
      if (cityCoords) {
        // Cache city coordinates
        await prisma.djVenue.update({
          where: { id: venue.id },
          data: {
            latitude: cityCoords.lat,
            longitude: cityCoords.lng,
            geocodedAt: new Date(),
          },
        });
        return {
          ...venue,
          lat: cityCoords.lat,
          lng: cityCoords.lng,
        };
      }

      // No coordinates found
      return {
        ...venue,
        lat: undefined,
        lng: undefined,
      };
    }),
  );

  // Filter out venues without coordinates
  return results.filter(
    (v): v is GeocodedVenue & { lat: number; lng: number } =>
      v.lat !== undefined && v.lng !== undefined,
  );
}
