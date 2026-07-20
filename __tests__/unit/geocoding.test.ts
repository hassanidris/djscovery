import { describe, it, expect, vi, beforeEach } from "vitest";
import { geocodeCity, geocodeVenue, batchGeocodeVenues } from "@/lib/actions/geocoding";

// Mock Prisma
vi.mock("@/lib/client", () => ({
  default: {
    djVenue: {
      update: vi.fn(),
    },
  },
}));

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
              center: [13.4050, 52.5200], // [lng, lat]
            },
          ],
        },
      })),
    })),
  })),
}));

describe("geocoding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("geocodeCity", () => {
    it("should return coordinates for a valid city", async () => {
      const result = await geocodeCity("Berlin", "Germany");
      expect(result).toEqual({ lat: 52.5200, lng: 13.4050 });
    });

    it("should return null for invalid city", async () => {
      const { default: geocoding } = await import("@mapbox/mapbox-sdk/services/geocoding");
      (geocoding as any).mockImplementationOnce(() => ({
        forwardGeocode: vi.fn(() => ({
          send: vi.fn(() => ({
            body: { features: [] },
          })),
        })),
      }));

      const result = await geocodeCity("InvalidCity", "Nowhere");
      expect(result).toBeNull();
    });
  });

  describe("geocodeVenue", () => {
    it("should return coordinates for a valid venue", async () => {
      const result = await geocodeVenue("Berghain", "Berlin", "Germany");
      expect(result).toEqual({ lat: 52.5200, lng: 13.4050 });
    });

    it("should return null for invalid venue", async () => {
      const { default: geocoding } = await import("@mapbox/mapbox-sdk/services/geocoding");
      (geocoding as any).mockImplementationOnce(() => ({
        forwardGeocode: vi.fn(() => ({
          send: vi.fn(() => ({
            body: { features: [] },
          })),
        })),
      }));

      const result = await geocodeVenue("InvalidVenue", "Nowhere", "Nowhere");
      expect(result).toBeNull();
    });
  });

  describe("batchGeocodeVenues", () => {
    it("should return cached coordinates if already present", async () => {
      const venues = [
        {
          id: 1,
          venueName: "Test Venue",
          city: { name: "Berlin" },
          country: { name: "Germany" },
          latitude: 52.5200,
          longitude: 13.4050,
        },
      ];

      const result = await batchGeocodeVenues(venues);
      expect(result[0]).toEqual({
        ...venues[0],
        lat: 52.5200,
        lng: 13.4050,
      });
    });

    it("should geocode venues without coordinates", async () => {
      const venues = [
        {
          id: 1,
          venueName: "Test Venue",
          city: { name: "Berlin" },
          country: { name: "Germany" },
          latitude: null,
          longitude: null,
        },
      ];

      const result = await batchGeocodeVenues(venues);
      expect(result[0].lat).toBe(52.5200);
      expect(result[0].lng).toBe(13.4050);
    });
  });
});
