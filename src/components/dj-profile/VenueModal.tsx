"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Pencil, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCitiesByCountry, findOrCreateCity } from "@/lib/actions/profile";
import { type VenueSuggestion } from "@/lib/actions/venueAutocomplete";

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
  const [venues, setVenues] = useState<Venue[]>(() =>
    initialVenues.length === 0
      ? [
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
        ]
      : initialVenues,
  );
  const [venueCities, setVenueCities] = useState<Record<number, City[]>>({});
  const [loadingVenueCities, setLoadingVenueCities] = useState<
    Record<number, boolean>
  >({});
  const venueCityRequestId = useRef<Record<number, number>>({});
  const loadedCountryIds = useRef<Set<number>>(new Set());

  // Only one venue card is expanded/editable at a time; the rest are
  // collapsed into a compact summary row to keep long lists manageable.
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    initialVenues.length === 0 ? 0 : null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  // Autocomplete state
  const [venueSuggestions, setVenueSuggestions] = useState<
    Record<number, VenueSuggestion[]>
  >({});
  const [showSuggestions, setShowSuggestions] = useState<
    Record<number, boolean>
  >({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<
    Record<number, boolean>
  >({});
  const searchTimeoutRef = useRef<Record<number, NodeJS.Timeout>>({});

  useEffect(() => {
    // Pre-load cities for venues that already have a country selected
    initialVenues.forEach((venue) => {
      if (venue.countryId && !loadedCountryIds.current.has(venue.countryId)) {
        loadedCountryIds.current.add(venue.countryId);
        getCitiesByCountry(venue.countryId).then((result) => {
          setVenueCities((prev) => ({ ...prev, [venue.countryId]: result }));
        });
      }
    });
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
    setVenues((prev) => {
      const next = [
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
      ];
      setExpandedIndex(next.length - 1);
      return next;
    });
    setSaveError(null);
  }

  function removeVenue(index: number) {
    setVenues((prev) => prev.filter((_, idx) => idx !== index));
    setExpandedIndex((prev) => {
      if (prev === null) return prev;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
  }

  function updateVenue(index: number, field: string, value: any) {
    setVenues((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: value } : v)),
    );
  }

  async function handleVenueNameChange(value: string, index: number) {
    updateVenue(index, "venueName", value);

    // Clear previous timeout
    if (searchTimeoutRef.current[index]) {
      clearTimeout(searchTimeoutRef.current[index]);
    }

    if (value.length < 2) {
      setVenueSuggestions((prev) => ({ ...prev, [index]: [] }));
      setShowSuggestions((prev) => ({ ...prev, [index]: false }));
      return;
    }

    setLoadingSuggestions((prev) => ({ ...prev, [index]: true }));

    // Debounce search
    searchTimeoutRef.current[index] = setTimeout(async () => {
      try {
        const countryId = venues[index].countryId || undefined;
        const countryName = venues[index].countryName || undefined;
        const response = await fetch(
          `/api/venues/autocomplete?q=${encodeURIComponent(value)}${countryId ? `&countryId=${countryId}` : ""}${countryName ? `&countryName=${encodeURIComponent(countryName)}` : ""}`,
        );
        const suggestions = await response.json();
        setVenueSuggestions((prev) => ({ ...prev, [index]: suggestions }));
        setShowSuggestions((prev) => ({ ...prev, [index]: true }));
      } catch (error) {
        console.error("Autocomplete error:", error);
      } finally {
        setLoadingSuggestions((prev) => ({ ...prev, [index]: false }));
      }
    }, 300);
  }

  async function selectVenue(suggestion: VenueSuggestion, index: number) {
    // Resolve country ID from country name (case-insensitive)
    const country = countries.find(
      (c) => c.name.toLowerCase() === suggestion.countryName.toLowerCase(),
    );
    const countryId = country?.id || 0;

    // Update venue with selected data
    updateVenue(index, "venueName", suggestion.name);
    updateVenue(index, "countryId", countryId);
    updateVenue(index, "countryName", country?.name || suggestion.countryName);

    if (!countryId) {
      updateVenue(index, "cityId", 0);
      updateVenue(index, "cityName", suggestion.cityName);
      setShowSuggestions((prev) => ({ ...prev, [index]: false }));
      return;
    }

    // Load cities for the selected country (if not already loaded)
    let cities = venueCities[countryId];
    if (!loadedCountryIds.current.has(countryId)) {
      loadedCountryIds.current.add(countryId);
      cities = await getCitiesByCountry(countryId);
      setVenueCities((prev) => ({
        ...prev,
        [countryId]: cities,
      }));
    }

    // Resolve city ID from city name (case-insensitive)
    let matchedCity = cities?.find(
      (c) => c.name.toLowerCase() === suggestion.cityName.toLowerCase(),
    );

    // The city may not exist in our database yet (e.g. a smaller town) -
    // create it so country + city can always be auto-filled.
    if (!matchedCity && suggestion.cityName) {
      const created = await findOrCreateCity(suggestion.cityName, countryId);
      if (created) {
        matchedCity = created;
        setVenueCities((prev) => ({
          ...prev,
          [countryId]: [...(prev[countryId] || []), created].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        }));
      }
    }

    updateVenue(index, "cityId", matchedCity?.id || 0);
    updateVenue(index, "cityName", matchedCity?.name || suggestion.cityName);

    setShowSuggestions((prev) => ({ ...prev, [index]: false }));
  }

  function handleSave() {
    setSaveError(null);

    const cleaned = venues.map((v) => ({
      ...v,
      venueName: v.venueName.trim(),
    }));

    const incompleteIndex = cleaned.findIndex(
      (v) => v.venueName !== "" && (!v.countryId || !v.cityId),
    );

    if (incompleteIndex !== -1) {
      setExpandedIndex(incompleteIndex);
      setSaveError(
        "Please select a country and city for this venue before saving.",
      );
      return;
    }

    const validVenues = cleaned.filter((v) => v.venueName !== "");
    onSave(validVenues);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 p-4">
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

        {saveError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {venues.map((venue, index) => {
            const isExpanded = expandedIndex === index;
            const summaryLocation = [venue.cityName, venue.countryName]
              .filter(Boolean)
              .join(", ");

            if (!isExpanded) {
              return (
                <div
                  key={`venue-${venue.id}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">
                      {venue.venueName || `Venue #${index + 1}`}
                    </div>
                    <div className="truncate text-xs text-gray-400">
                      {summaryLocation || "No location set"}
                      {venue.eventDate && ` • ${venue.eventDate}`}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(index)}
                      className="text-gray-400 transition-colors hover:text-white"
                      aria-label="Edit venue"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVenue(index)}
                      className="text-gray-500 transition-colors hover:text-red-400"
                      aria-label="Remove venue"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`venue-${venue.id}-${index}`}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">
                    Venue #{index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(null)}
                      className="text-gray-400 transition-colors hover:text-white"
                      aria-label="Collapse venue"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVenue(index)}
                      className="text-gray-500 transition-colors hover:text-red-400"
                      aria-label="Remove venue"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    Venue Name
                  </Label>
                  <Input
                    value={venue.venueName}
                    onChange={(e) =>
                      handleVenueNameChange(e.target.value, index)
                    }
                    placeholder="e.g., Berghain"
                    className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                  />
                  {showSuggestions[index] &&
                    venueSuggestions[index]?.length > 0 && (
                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/10 bg-black shadow-lg">
                        {venueSuggestions[index].map((suggestion, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => selectVenue(suggestion, index)}
                            className="w-full px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10"
                          >
                            <div className="font-medium">{suggestion.name}</div>
                            <div className="text-xs text-gray-400">
                              {suggestion.cityName}, {suggestion.countryName}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  {loadingSuggestions[index] && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-gray-400">
                      Searching...
                    </div>
                  )}
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
                        updateVenue(
                          index,
                          "cityName",
                          selectedCity?.name || "",
                        );
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
            );
          })}
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
