import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  geocodeCity,
  geocodeVenue,
  batchGeocodeVenues,
} from "@/lib/actions/geocoding";

// Mock Prisma
vi.mock("@/lib/client", () => ({
  default: {
    djVenue: {
      update: vi.fn(),
    },
  },
}));

// Mock Mapbox SDK with controllable mock functions (hoisted for vi.mock)
const { mockSend, mockForwardGeocode } = vi.hoisted(() => {
  const mockSend = vi.fn(() => ({
    body: {
      features: [
        {
          center: [13.405, 52.52], // [lng, lat]
        },
      ],
    },
  }));
  const mockForwardGeocode = vi.fn(() => ({ send: mockSend }));
  return { mockSend, mockForwardGeocode };
});

vi.mock("@mapbox/mapbox-sdk", () => ({
  default: vi.fn(() => ({
    accessToken: "test-token",
  })),
}));

vi.mock("@mapbox/mapbox-sdk/services/geocoding", () => ({
  default: vi.fn(() => ({
    forwardGeocode: mockForwardGeocode,
  })),
}));

describe("geocoding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("geocodeCity", () => {
    it("should return coordinates for a valid city", async () => {
      const result = await geocodeCity("Berlin", "Germany");
      expect(result).toEqual({ lat: 52.52, lng: 13.405 });
    });

    it("should return null for invalid city", async () => {
      mockSend.mockImplementationOnce(() => ({ body: { features: [] } }));

      const result = await geocodeCity("InvalidCity", "Nowhere");
      expect(result).toBeNull();
    });
  });

  describe("geocodeVenue", () => {
    it("should return coordinates for a valid venue", async () => {
      const result = await geocodeVenue("Berghain", "Berlin", "Germany");
      expect(result).toEqual({ lat: 52.52, lng: 13.405 });
    });

    it("should return null for invalid venue", async () => {
      mockSend.mockImplementationOnce(() => ({ body: { features: [] } }));

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
          latitude: 52.52,
          longitude: 13.405,
        },
      ];

      const result = await batchGeocodeVenues(venues);
      expect(result[0]).toEqual({
        ...venues[0],
        lat: 52.52,
        lng: 13.405,
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
      expect(result[0].lat).toBe(52.52);
      expect(result[0].lng).toBe(13.405);
    });
  });
});
