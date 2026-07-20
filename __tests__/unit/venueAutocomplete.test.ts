import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchMapbox } from "@/lib/actions/venueAutocomplete";

// Mock Mapbox SDK
vi.mock("@mapbox/mapbox-sdk", () => ({
  default: vi.fn(() => ({
    accessToken: "test-token",
  })),
}));

vi.mock("@mapbox/mapbox-sdk/services/geocoding", () => ({
  default: vi.fn(() => ({
    forwardGeocode: vi.fn(() => ({
      send: vi.fn(() => ({
        body: {
          features: [
            {
              id: "poi.123",
              text: "Berghain",
              place_name: "Berghain, Berlin, Germany",
              center: [13.4430, 52.5112],
              context: [
                { id: "place.123", text: "Berlin" },
                { id: "country.123", text: "Germany" },
              ],
            },
          ],
        },
      })),
    })),
  })),
}));

describe("venueAutocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchMapbox", () => {
    it("should return venue suggestions from Mapbox", async () => {
      const result = await searchMapbox("Berghain", "Germany");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: "Berghain",
        cityName: "Berlin",
        countryName: "Germany",
        latitude: 52.5112,
        longitude: 13.4430,
        externalId: "poi.123",
      });
    });

    it("should handle empty results", async () => {
      const { default: geocoding } = await import("@mapbox/mapbox-sdk/services/geocoding");
      (geocoding as any).mockImplementationOnce(() => ({
        forwardGeocode: vi.fn(() => ({
          send: vi.fn(() => ({
            body: { features: [] },
          })),
        })),
      }));

      const result = await searchMapbox("InvalidVenue", "Nowhere");
      expect(result).toEqual([]);
    });

    it("should handle Mapbox API errors", async () => {
      const { default: geocoding } = await import("@mapbox/mapbox-sdk/services/geocoding");
      (geocoding as any).mockImplementationOnce(() => ({
        forwardGeocode: vi.fn(() => ({
          send: vi.fn(() => {
            throw new Error("API Error");
          }),
        })),
      }));

      const result = await searchMapbox("Test", "Germany");
      expect(result).toEqual([]);
    });
  });
});
