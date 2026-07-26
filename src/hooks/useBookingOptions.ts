import { useState, useEffect } from "react";

export interface BookingOptions {
  countries: Array<{ id: number; name: string }>;
  initialCities?: Array<{ id: number; name: string }>;
  initialVenues?: string[];
  defaultCountryId?: number;
  defaultCityId?: number;
}

export function useBookingOptions(
  organizerCountryId?: number,
  organizerCityId?: number,
  djCountryId?: number,
  djCityId?: number,
) {
  const [options, setOptions] = useState<BookingOptions>({
    countries: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        if (organizerCountryId)
          params.append("organizerCountryId", organizerCountryId.toString());
        if (organizerCityId)
          params.append("organizerCityId", organizerCityId.toString());
        if (djCountryId) params.append("djCountryId", djCountryId.toString());
        if (djCityId) params.append("djCityId", djCityId.toString());

        const response = await fetch(
          `/api/booking-options?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch booking options");
        }

        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.error("Failed to fetch booking options:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOptions();
  }, [organizerCountryId, organizerCityId, djCountryId, djCityId]);

  return { options, isLoading };
}
