import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/venues/autocomplete/route";

// Mock the server actions
vi.mock("@/lib/actions/venueAutocompleteServer", () => ({
  searchVenuesHybrid: vi.fn(),
}));

describe("API: /api/venues/autocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 for missing query parameter", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/venues/autocomplete",
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it("should return 400 for query shorter than 2 characters", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/venues/autocomplete?q=B",
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it("should call searchVenuesHybrid with valid query", async () => {
    const { searchVenuesHybrid } =
      await import("@/lib/actions/venueAutocompleteServer");
    (searchVenuesHybrid as any).mockResolvedValue([
      { name: "Berghain", cityName: "Berlin", countryName: "Germany" },
    ]);

    const request = new NextRequest(
      "http://localhost:3000/api/venues/autocomplete?q=Ber",
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(searchVenuesHybrid).toHaveBeenCalledWith(
      "Ber",
      undefined,
      undefined,
    );
  });

  it("should pass countryId to searchVenuesHybrid", async () => {
    const { searchVenuesHybrid } =
      await import("@/lib/actions/venueAutocompleteServer");
    (searchVenuesHybrid as any).mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost:3000/api/venues/autocomplete?q=Ber&countryId=1",
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(searchVenuesHybrid).toHaveBeenCalledWith("Ber", 1, undefined);
  });

  it("should pass countryName to searchVenuesHybrid", async () => {
    const { searchVenuesHybrid } =
      await import("@/lib/actions/venueAutocompleteServer");
    (searchVenuesHybrid as any).mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost:3000/api/venues/autocomplete?q=Ber&countryName=Germany",
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(searchVenuesHybrid).toHaveBeenCalledWith(
      "Ber",
      undefined,
      "Germany",
    );
  });

  it("should return 500 on error", async () => {
    const { searchVenuesHybrid } =
      await import("@/lib/actions/venueAutocompleteServer");
    (searchVenuesHybrid as any).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest(
      "http://localhost:3000/api/venues/autocomplete?q=Ber",
    );
    const response = await GET(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: "Failed to search venues" });
  });

  it("should enforce rate limiting", async () => {
    const { searchVenuesHybrid } =
      await import("@/lib/actions/venueAutocompleteServer");
    (searchVenuesHybrid as any).mockResolvedValue([]);

    // Make 31 requests (exceeds rate limit of 30)
    const request = new NextRequest(
      "http://localhost:3000/api/venues/autocomplete?q=Ber",
      {
        headers: { "x-forwarded-for": "127.0.0.1" },
      },
    );

    for (let i = 0; i < 31; i++) {
      await GET(request);
    }

    const response = await GET(request);
    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data).toEqual({ error: "Rate limit exceeded" });
  });
});
