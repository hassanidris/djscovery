export interface VenueSuggestion {
  id?: number;
  name: string;
  address?: string | null;
  cityId: number;
  cityName: string;
  countryId: number;
  countryName: string;
  latitude?: number | null;
  longitude?: number | null;
  externalId?: string | null;
}

function mapSuggestionToVenue(s: any): VenueSuggestion {
  return {
    name: s.name || "",
    address: s.address || s.full_address || null,
    cityId: 0, // Will be resolved when selected
    cityName: s.context?.place?.name || "",
    countryId: 0, // Will be resolved when selected
    countryName: s.context?.country?.name || "",
    latitude: null,
    longitude: null,
    externalId: s.mapbox_id,
  };
}

async function suggestMapbox(
  query: string,
  token: string,
  sessionToken: string,
  types: string,
): Promise<any[]> {
  const params = new URLSearchParams({
    q: query,
    access_token: token,
    session_token: sessionToken,
    types,
    limit: "5",
  });

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`,
    { signal: AbortSignal.timeout(5000) },
  );

  if (!response.ok) {
    console.error("Mapbox suggest error:", await response.text());
    return [];
  }

  const data = await response.json();
  return data.suggestions || [];
}

export async function retrieveMapbox(
  mapboxId: string,
  token: string,
  sessionToken: string,
): Promise<any | null> {
  // Validate mapboxId to prevent SSRF attacks
  // Mapbox IDs are typically UUIDs or alphanumeric strings with dots
  // Reject any input that could be used for path traversal or URL manipulation
  if (!/^[a-zA-Z0-9.-]+$/.test(mapboxId)) {
    console.error("Invalid mapboxId format:", mapboxId);
    return null;
  }

  const params = new URLSearchParams({
    access_token: token,
    session_token: sessionToken,
  });

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?${params.toString()}`,
  );

  if (!response.ok) {
    console.error("Mapbox retrieve error:", await response.text());
    return null;
  }

  const data = await response.json();
  return data.features?.[0] || null;
}

async function reverseGeocodePois(
  longitude: number,
  latitude: number,
  token: string,
): Promise<any[]> {
  const params = new URLSearchParams({
    longitude: String(longitude),
    latitude: String(latitude),
    access_token: token,
    types: "poi",
  });

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/reverse?${params.toString()}`,
  );

  if (!response.ok) {
    console.error("Mapbox reverse geocode error:", await response.text());
    return [];
  }

  const data = await response.json();
  return (data.features || []).filter(
    (f: any) => f.properties?.feature_type === "poi",
  );
}

/**
 * Search Mapbox for venue suggestions (server-side only)
 *
 * Uses the Mapbox Search Box API (/search/searchbox/v1/suggest) rather than
 * the legacy Geocoding v5 API. Mapbox retired POI category access on the
 * legacy Geocoding API for most accounts, so `types: ["poi"]` there always
 * returns zero results. The Search Box API still returns POI/venue data.
 *
 * If the query looks like a venue name, a direct POI suggest search is
 * used. If no POI matches (e.g. the user typed a street address instead of
 * a venue name), the address is geocoded and then reverse-geocoded to find
 * the actual named venue(s) located at that address.
 */
export async function searchMapbox(
  query: string,
  countryName?: string,
): Promise<VenueSuggestion[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return [];

  const sessionToken = crypto.randomUUID();
  const searchQuery = countryName ? `${query}, ${countryName}` : query;

  try {
    const poiSuggestions = await suggestMapbox(
      searchQuery,
      token,
      sessionToken,
      "poi",
    );

    if (poiSuggestions.length > 0) {
      return poiSuggestions.map(mapSuggestionToVenue);
    }

    // No POI matched the query directly - the user may have typed an
    // address. Resolve the address to coordinates, then look up the
    // named venue(s) located there.
    const addressSuggestions = await suggestMapbox(
      searchQuery,
      token,
      sessionToken,
      "address",
    );
    const topAddress = addressSuggestions[0];
    if (!topAddress) return [];

    const feature = await retrieveMapbox(
      topAddress.mapbox_id,
      token,
      sessionToken,
    );
    const coordinates = feature?.geometry?.coordinates;
    if (!coordinates) return [];

    const [longitude, latitude] = coordinates;
    const nearbyPois = await reverseGeocodePois(longitude, latitude, token);

    return nearbyPois.map((f: any) => ({
      name: f.properties?.name || "",
      address: f.properties?.address || f.properties?.full_address || null,
      cityId: 0,
      cityName: f.properties?.context?.place?.name || "",
      countryId: 0,
      countryName: f.properties?.context?.country?.name || "",
      latitude: f.geometry?.coordinates?.[1] ?? null,
      longitude: f.geometry?.coordinates?.[0] ?? null,
      externalId: f.properties?.mapbox_id,
    }));
  } catch (error) {
    console.error("Mapbox search error:", error);
    return [];
  }
}
