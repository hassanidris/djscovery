"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCitiesByCountry } from "@/lib/actions/profile";

type City = { id: number; name: string };

interface Venue {
  id: number;
  venueName: string;
  eventDate: string;
  description: string;
  countryId: number;
  cityId: number;
  countryName: string;
  cityName: string;
}

interface VenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  onSave: (venues: Venue[]) => void;
  countries: Array<{ id: number; name: string }>;
  djProfileId: number;
}

export default function VenueModal({
  isOpen,
  onClose,
  venues: initialVenues,
  onSave,
  countries,
  djProfileId,
}: VenueModalProps) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [venueCities, setVenueCities] = useState<Record<number, City[]>>({});
  const [loadingVenueCities, setLoadingVenueCities] = useState<
    Record<number, boolean>
  >({});
  const venueCityRequestId = useRef<Record<number, number>>({});

  useEffect(() => {
    if (initialVenues.length === 0) {
      setVenues([
        {
          id: 0,
          venueName: "",
          eventDate: "",
          description: "",
          countryId: 0,
          cityId: 0,
          countryName: "",
          cityName: "",
        },
      ]);
    } else {
      setVenues(initialVenues);
      // Pre-load cities for venues that already have a country selected
      initialVenues.forEach((venue) => {
        if (venue.countryId && !venueCities[venue.countryId]) {
          getCitiesByCountry(venue.countryId).then((result) => {
            setVenueCities((prev) => ({ ...prev, [venue.countryId]: result }));
          });
        }
      });
    }
  }, [initialVenues]);

  async function handleVenueCountryChange(
    venueIndex: number,
    countryId: number,
  ) {
    setVenues((prev) =>
      prev.map((v, idx) =>
        idx === venueIndex ? { ...v, countryId, cityId: 0, cityName: "" } : v,
      ),
    );
    if (!countryId) return;

    const currentRequestId = (venueCityRequestId.current[countryId] || 0) + 1;
    venueCityRequestId.current[countryId] = currentRequestId;
    setLoadingVenueCities((prev) => ({ ...prev, [countryId]: true }));
    try {
      const result = await getCitiesByCountry(countryId);
      if (currentRequestId === venueCityRequestId.current[countryId]) {
        setVenueCities((prev) => ({ ...prev, [countryId]: result }));
      }
    } finally {
      if (currentRequestId === venueCityRequestId.current[countryId]) {
        setLoadingVenueCities((prev) => ({ ...prev, [countryId]: false }));
      }
    }
  }

  function addVenue() {
    setVenues((prev) => [
      ...prev,
      {
        id: 0,
        venueName: "",
        eventDate: "",
        description: "",
        countryId: 0,
        cityId: 0,
        countryName: "",
        cityName: "",
      },
    ]);
  }

  function removeVenue(index: number) {
    setVenues((prev) => prev.filter((_, idx) => idx !== index));
  }

  function updateVenue(index: number, field: string, value: any) {
    setVenues((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: value } : v)),
    );
  }

  function handleSave() {
    const validVenues = venues.filter((v) => v.venueName.trim() !== "");
    onSave(validVenues);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-black p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Edit Venues</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {venues.map((venue, index) => (
            <div
              key={venue.id || index}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Venue #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeVenue(index)}
                  className="text-gray-500 transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Venue Name
                </Label>
                <Input
                  value={venue.venueName}
                  onChange={(e) =>
                    updateVenue(index, "venueName", e.target.value)
                  }
                  placeholder="e.g., Berghain"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Event Date (optional)
                </Label>
                <Input
                  type="date"
                  value={venue.eventDate}
                  onChange={(e) =>
                    updateVenue(index, "eventDate", e.target.value)
                  }
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white scheme-dark placeholder:text-gray-600 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:transition-opacity [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Description (optional)
                </Label>
                <Textarea
                  value={venue.description}
                  onChange={(e) =>
                    updateVenue(index, "description", e.target.value)
                  }
                  placeholder="Brief description of the performance..."
                  className="focus:border-h_red/50 min-h-16 resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    Country
                  </Label>
                  <select
                    value={venue.countryId}
                    onChange={(e) =>
                      handleVenueCountryChange(index, Number(e.target.value))
                    }
                    className="focus:border-h_red/50 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600"
                  >
                    <option value={0} className="bg-zinc-900">
                      Select country...
                    </option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id} className="bg-zinc-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    City
                  </Label>
                  <select
                    value={venue.cityId}
                    onChange={(e) => {
                      const cityId = Number(e.target.value);
                      const selectedCity = venueCities[venue.countryId]?.find(
                        (c) => c.id === cityId,
                      );
                      updateVenue(index, "cityId", cityId);
                      updateVenue(index, "cityName", selectedCity?.name || "");
                    }}
                    disabled={
                      !venue.countryId || loadingVenueCities[venue.countryId]
                    }
                    className="focus:border-h_red/50 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 disabled:opacity-50"
                  >
                    <option value={0} className="bg-zinc-900">
                      Select city...
                    </option>
                    {loadingVenueCities[venue.countryId] ? (
                      <option disabled className="bg-zinc-900">
                        Loading...
                      </option>
                    ) : (
                      venue.countryId &&
                      venueCities[venue.countryId]?.map((city) => (
                        <option
                          key={city.id}
                          value={city.id}
                          className="bg-zinc-900"
                        >
                          {city.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            onClick={addVenue}
            variant="outline"
            className="border-dashed border-white/20 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {venues.length === 0 ? "Add Venue" : "Add More Venues"}
          </Button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Venues
          </Button>
        </div>
      </div>
    </div>
  );
}
