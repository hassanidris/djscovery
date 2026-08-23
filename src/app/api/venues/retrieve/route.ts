import { NextRequest, NextResponse } from "next/server";
import { retrieveMapbox } from "@/lib/actions/venueAutocomplete";

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  for (const [key, rec] of rateLimit) {
    if (now > rec.resetTime) {
      rateLimit.delete(key);
    }
  }

  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Retrieve full venue details (including coordinates) for a Mapbox suggestion.
 *
 * The Mapbox Search Box /suggest endpoint returns suggestions with a mapbox_id
 * but NO coordinates. The client calls this endpoint with the mapbox_id when a
 * user selects a suggestion, to resolve the actual lat/lng before saving.
 */
export async function GET(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    const { searchParams } = new URL(request.url);
    const mapboxId = searchParams.get("mapbox_id");

    if (!mapboxId) {
      return NextResponse.json(
        { error: "mapbox_id is required" },
        { status: 400 },
      );
    }

    // Validate mapboxId to prevent SSRF attacks
    // Mapbox IDs are typically UUIDs or alphanumeric strings with dots
    if (!/^[a-zA-Z0-9.-]+$/.test(mapboxId)) {
      return NextResponse.json(
        { error: "Invalid mapbox_id format" },
        { status: 400 },
      );
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Mapbox token not configured" },
        { status: 500 },
      );
    }

    const sessionToken = crypto.randomUUID();
    const feature = await retrieveMapbox(mapboxId, token, sessionToken);

    if (!feature) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const coordinates = feature.geometry?.coordinates;
    if (!coordinates) {
      return NextResponse.json(
        { error: "No coordinates available" },
        { status: 404 },
      );
    }

    const [longitude, latitude] = coordinates;

    return NextResponse.json({
      latitude,
      longitude,
      name: feature.properties?.name || "",
      address: feature.properties?.address || null,
      cityName: feature.properties?.context?.place?.name || "",
      countryName: feature.properties?.context?.country?.name || "",
    });
  } catch (error) {
    console.error("Retrieve API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve venue" },
      { status: 500 },
    );
  }
}
