import { NextRequest, NextResponse } from "next/server";
import { searchVenuesHybrid } from "@/lib/actions/venueAutocompleteServer";

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
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

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const countryId = searchParams.get("countryId");
    const countryName = searchParams.get("countryName");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const results = await searchVenuesHybrid(
      query,
      countryId ? Number(countryId) : undefined,
      countryName || undefined,
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Autocomplete API error:", error);
    return NextResponse.json(
      { error: "Failed to search venues" },
      { status: 500 },
    );
  }
}
