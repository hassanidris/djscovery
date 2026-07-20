import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchMapbox } from "@/lib/actions/venueAutocomplete";

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  ...crypto,
  randomUUID: vi.fn(() => "test-session-token"),
});

// Mock fetch for Mapbox Search Box API
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("venueAutocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = "test-token";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  });

  describe("searchMapbox", () => {
    it("should return venue suggestions from Mapbox", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: [
            {
              mapbox_id: "poi.123",
              name: "Berghain",
              address: "Am Wriezener Bahnhof, Berlin",
              context: {
                place: { name: "Berlin" },
                country: { name: "Germany" },
              },
            },
          ],
        }),
      });

      const result = await searchMapbox("Berghain", "Germany");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: "Berghain",
        cityName: "Berlin",
        countryName: "Germany",
        latitude: null,
        longitude: null,
        externalId: "poi.123",
      });
    });

    it("should handle empty results", async () => {
      // POI suggest returns empty, address suggest also returns empty
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: [] }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: [] }),
      });

      const result = await searchMapbox("InvalidVenue", "Nowhere");
      expect(result).toEqual([]);
    });

    it("should handle Mapbox API errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("API Error"));

      const result = await searchMapbox("Test", "Germany");
      expect(result).toEqual([]);
    });
  });
});
