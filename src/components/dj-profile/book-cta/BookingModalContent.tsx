"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CountryOption, CityOption } from "@/types/booking";
import {
  BUDGET_OPTIONS,
  CUSTOM_VENUE_VALUE,
  MIN_MESSAGE_LENGTH,
  type FormState,
} from "@/components/dj-profile/book-cta/shared";

interface BookingModalContentProps {
  stageName: string;
  isDemoProfile: boolean;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  countries: CountryOption[];
  cities: CityOption[];
  venues: string[];
  venueSelection: string;
  setVenueSelection: React.Dispatch<React.SetStateAction<string>>;
  isCustomVenue: boolean;
  setIsCustomVenue: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingCities: boolean;
  isLoadingVenues: boolean;
  isSubmitting: boolean;
  messageLength: number;
  messageTooShort: boolean;
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onVenueSelect: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export default function BookingModalContent({
  stageName,
  isDemoProfile,
  form,
  setForm,
  countries,
  cities,
  venues,
  venueSelection,
  setVenueSelection,
  isCustomVenue,
  setIsCustomVenue,
  isLoadingCities,
  isLoadingVenues,
  isSubmitting,
  messageLength,
  messageTooShort,
  onCountryChange,
  onCityChange,
  onVenueSelect,
  onSubmit,
  onClose,
}: BookingModalContentProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Booking details</DialogTitle>
          <DialogDescription>
            Provide key details so {stageName} can evaluate your event quickly.
            Contact info stays hidden until the DJ accepts.
          </DialogDescription>
          {form.packageName && (
            <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
              <p className="text-xs font-medium text-amber-400">
                Enquiring about: {form.packageName}
              </p>
              {form.packagePrice && (
                <p className="mt-1 text-xs text-gray-400">
                  Package price: {form.budgetCurrency || "SEK"}{" "}
                  {form.packagePrice.toLocaleString()}
                  {form.packagePriceTo &&
                    ` – ${form.packagePriceTo.toLocaleString()}`}
                </p>
              )}
              <p className="mt-2 text-[11px] text-gray-400">
                DJ will provide final quote based on your specific requirements
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="eventName">Event name</Label>
            <Input
              id="eventName"
              value={form.eventName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  eventName: event.target.value,
                }))
              }
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="eventDate">Event date</Label>
            <DatePicker
              id="eventDate"
              value={form.eventDate}
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  eventDate: v,
                }))
              }
              placeholder="Select date"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="countryId">Country</Label>
            {form.packageName ? (
              <div className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400">
                {countries.find((c) => c.id === Number(form.countryId))
                  ?.name || "Loading..."}
              </div>
            ) : (
              <Select value={form.countryId} onValueChange={onCountryChange}>
                <SelectTrigger id="countryId">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={String(country.id)}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cityId">City</Label>
            {form.packageName ? (
              <div className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400">
                {cities.find((c) => c.id === Number(form.cityId))?.name ||
                  "Loading..."}
              </div>
            ) : (
              <Select
                value={form.cityId}
                onValueChange={onCityChange}
                disabled={!form.countryId || isLoadingCities}
              >
                <SelectTrigger id="cityId">
                  <SelectValue
                    placeholder={
                      isLoadingCities
                        ? "Loading…"
                        : form.countryId
                          ? "Select city"
                          : "Select country first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {form.packageName && (
          <p className="text-[11px] text-gray-400">
            If you want the DJ to play in another city,{" "}
            <button
              type="button"
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  packageName: undefined,
                  packagePrice: undefined,
                  packagePriceTo: undefined,
                  budgetType: "NEGOTIABLE",
                  budgetMin: "",
                  budgetMax: "",
                  message: "",
                }));
                setIsCustomVenue(false);
                setVenueSelection("");
              }}
              className="text-h_redLight hover:text-h_redLightDark cursor-pointer underline underline-offset-2"
            >
              use the general booking form
            </button>
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="venue">Venue</Label>
          {venues.length > 0 && !isCustomVenue ? (
            <Select value={venueSelection} onValueChange={onVenueSelect}>
              <SelectTrigger id="venue">
                <SelectValue
                  placeholder={
                    isLoadingVenues ? "Loading…" : "Select venue"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {venues.map((venue) => (
                  <SelectItem key={venue} value={venue}>
                    {venue}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_VENUE_VALUE}>
                  Other (enter manually)
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                id="venue"
                placeholder="Club, festival, venue name"
                value={form.venue}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    venue: event.target.value,
                  }))
                }
                required
              />
              {venues.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomVenue(false);
                    setVenueSelection("");
                    setForm((prev) => ({ ...prev, venue: "" }));
                  }}
                  className="text-left text-xs text-gray-400 underline-offset-2 hover:text-gray-300 hover:underline"
                >
                  Choose from known venues instead
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="crowdSize">Expected crowd</Label>
          <Input
            id="crowdSize"
            type="number"
            min={1}
            placeholder="300"
            value={form.crowdSize}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                crowdSize: event.target.value,
              }))
            }
            required
          />
        </div>

        {!form.packageName && (
          <div className="flex flex-col gap-2">
            <Label>Budget</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {BUDGET_OPTIONS.map((opt) => {
                const active = form.budgetType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        budgetType: opt.value,
                        budgetMin:
                          opt.value === "NEGOTIABLE" || opt.value === "TBA"
                            ? ""
                            : prev.budgetMin,
                        budgetMax:
                          opt.value === "RANGE" ? prev.budgetMax : "",
                      }))
                    }
                    className={cn(
                      "flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200",
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-[11px] text-gray-400">
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>

            {(form.budgetType === "FIXED" || form.budgetType === "RANGE") && (
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="budgetMin">
                    {form.budgetType === "FIXED" ? "Amount" : "Min amount"}
                  </Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    min={0}
                    value={form.budgetMin}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        budgetMin: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                {form.budgetType === "RANGE" && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="budgetMax">Max amount</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      min={0}
                      value={form.budgetMax}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          budgetMax: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="budgetCurrency">Currency</Label>
                  <Input
                    id="budgetCurrency"
                    value={form.budgetCurrency}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        budgetCurrency: event.target.value.toUpperCase(),
                      }))
                    }
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            rows={5}
            placeholder="Share the vibe, schedule, and any technical requirements (min. 50 characters)."
            value={form.message}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                message: event.target.value,
              }))
            }
            required
          />
          <p
            className={cn(
              "text-right text-xs",
              messageTooShort ? "text-amber-400" : "text-gray-400",
            )}
          >
            {messageLength}/{MIN_MESSAGE_LENGTH} min characters
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Send request"
            )}
          </Button>
        </DialogFooter>
      </form>

      {isDemoProfile && (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 bg-white/5 p-6 text-sm text-gray-300">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          This booking flow is disabled for demo profiles.
        </div>
      )}
    </>
  );
}
