"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { submitBookingInquiry } from "@/lib/actions/booking-inquiry";
import { getCitiesForCountry, getVenuesForCity } from "@/lib/actions/locations";
import type { BookingFormOptions, BookingViewerContext } from "@/types/booking";
import { CalendarCheck2, Loader2, Rocket, ShieldAlert } from "lucide-react";

type BookCTAVariant = "free" | "premium";
type BookCTALayout = "mobile" | "desktop";
type ModalState = "none" | "auth" | "upgrade" | "booking" | "demo";

const BUDGET_OPTIONS = [
  { value: "FIXED", label: "Fixed", hint: "Single guaranteed fee" },
  { value: "RANGE", label: "Range", hint: "Provide min & max" },
  { value: "NEGOTIABLE", label: "Negotiable", hint: "Open to offers" },
  { value: "TBA", label: "TBA", hint: "Decide closer to date" },
] as const;

type BudgetChoice = (typeof BUDGET_OPTIONS)[number]["value"];

type FormState = {
  eventName: string;
  eventDate: string;
  countryId: string;
  cityId: string;
  venue: string;
  crowdSize: string;
  budgetType: BudgetChoice;
  budgetMin: string;
  budgetMax: string;
  budgetCurrency: string;
  message: string;
};

const CUSTOM_VENUE_VALUE = "__CUSTOM__";
const MIN_MESSAGE_LENGTH = 50;

const DEFAULT_VIEWER: BookingViewerContext = {
  role: "guest",
  isAuthenticated: false,
};

type Props = {
  stageName: string;
  djProfileId?: number;
  viewer?: BookingViewerContext;
  variant?: BookCTAVariant;
  layout?: BookCTALayout;
  responseRate?: number;
  bookingSuccessRate?: number;
  bookingOptions?: BookingFormOptions;
};

export function BookCTA({
  stageName,
  djProfileId,
  viewer,
  variant = "free",
  layout = "mobile",
  responseRate = 0,
  bookingSuccessRate = 0,
  bookingOptions,
}: Props) {
  const resolvedViewer = viewer ?? DEFAULT_VIEWER;

  const ctx: BookingViewerContext = resolvedViewer;

  const countries = bookingOptions?.countries ?? [];
  const defaultCountryValue = bookingOptions?.defaultCountryId
    ? String(bookingOptions.defaultCountryId)
    : "";
  const defaultCityValue = bookingOptions?.defaultCityId
    ? String(bookingOptions.defaultCityId)
    : "";
  const defaultCurrency = bookingOptions?.defaultCurrency ?? "SEK";

  const initialFormState = useMemo<FormState>(
    () => ({
      eventName: "",
      eventDate: "",
      countryId: defaultCountryValue,
      cityId: defaultCityValue,
      venue: "",
      crowdSize: "",
      budgetType: "NEGOTIABLE",
      budgetMin: "",
      budgetMax: "",
      budgetCurrency: defaultCurrency,
      message: "",
    }),
    [defaultCountryValue, defaultCityValue, defaultCurrency],
  );

  const [modal, setModal] = useState<ModalState>("none");
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isLoadingCities, startCityTransition] = useTransition();
  const [isLoadingVenues, startVenueTransition] = useTransition();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [cities, setCities] = useState(bookingOptions?.initialCities ?? []);
  const [venues, setVenues] = useState(bookingOptions?.initialVenues ?? []);
  const [venueSelection, setVenueSelection] = useState<string>("");
  const [isCustomVenue, setIsCustomVenue] = useState(
    (bookingOptions?.initialVenues ?? []).length === 0,
  );

  useEffect(() => {
    setForm(initialFormState);
    setCities(bookingOptions?.initialCities ?? []);
    setVenues(bookingOptions?.initialVenues ?? []);
    setVenueSelection("");
    setIsCustomVenue((bookingOptions?.initialVenues ?? []).length === 0);
  }, [initialFormState, bookingOptions]);

  useEffect(() => {
    if (!bookingOptions) return;
    if (!form.cityId) return;
    if (venues.length > 0) return;
    startVenueTransition(async () => {
      try {
        const fetched = await getVenuesForCity(Number(form.cityId));
        setVenues(fetched);
        if (fetched.length === 0) {
          setVenueSelection(CUSTOM_VENUE_VALUE);
          setIsCustomVenue(true);
        }
      } catch {
        // Ignore fetch errors here; user can still enter manually.
      }
    });
  }, [bookingOptions, form.cityId, venues.length]);

  const resetForm = () => {
    setForm(initialFormState);
    setCities(bookingOptions?.initialCities ?? []);
    setVenues(bookingOptions?.initialVenues ?? []);
    setVenueSelection("");
    setIsCustomVenue((bookingOptions?.initialVenues ?? []).length === 0);
  };

  const returnTo = useMemo(
    () => (typeof window !== "undefined" ? window.location.pathname : "/"),
    [],
  );

  const isPremium = variant === "premium";
  const isDesktop = layout === "desktop";
  const isOrganizer = ctx.role === "organizer" || ctx.role === "admin";
  const isDemoProfile = Number.isNaN(djProfileId) || djProfileId === undefined;

  if (ctx.role === "dj-owner") {
    return null;
  }

  const messageLength = form.message.trim().length;
  const messageTooShort = messageLength < MIN_MESSAGE_LENGTH;

  const handleCountryChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      countryId: value,
      cityId: "",
      venue: "",
    }));
    setCities([]);
    setVenues([]);
    setVenueSelection("");
    setIsCustomVenue(true);

    if (!value) return;

    startCityTransition(async () => {
      try {
        const fetchedCities = await getCitiesForCountry(Number(value));
        setCities(fetchedCities);

        if (fetchedCities.length === 0) {
          setForm((prev) => ({ ...prev, cityId: "" }));
          setVenues([]);
          setVenueSelection(CUSTOM_VENUE_VALUE);
          setIsCustomVenue(true);
          return;
        }

        const firstCityId = String(fetchedCities[0].id);
        setForm((prev) => ({ ...prev, cityId: firstCityId }));
        setVenueSelection("");
        setIsCustomVenue(true);

        startVenueTransition(async () => {
          try {
            const fetchedVenues = await getVenuesForCity(Number(firstCityId));
            setVenues(fetchedVenues);
            if (fetchedVenues.length === 0) {
              setVenueSelection(CUSTOM_VENUE_VALUE);
              setIsCustomVenue(true);
            } else {
              setVenueSelection("");
              setIsCustomVenue(false);
            }
          } catch {
            setVenues([]);
            setVenueSelection(CUSTOM_VENUE_VALUE);
            setIsCustomVenue(true);
          }
        });
      } catch {
        toast.error(
          "Could not load cities for that country. Please try again.",
        );
      }
    });
  };

  const handleCityChange = (value: string) => {
    setForm((prev) => ({ ...prev, cityId: value, venue: "" }));
    setVenues([]);
    setVenueSelection("");
    setIsCustomVenue(true);

    if (!value) return;

    startVenueTransition(async () => {
      try {
        const fetchedVenues = await getVenuesForCity(Number(value));
        setVenues(fetchedVenues);
        if (fetchedVenues.length === 0) {
          setVenueSelection(CUSTOM_VENUE_VALUE);
          setIsCustomVenue(true);
        } else {
          setVenueSelection("");
          setIsCustomVenue(false);
        }
      } catch {
        toast.error("Could not load venues for that city. Enter one manually.");
        setVenues([]);
        setVenueSelection(CUSTOM_VENUE_VALUE);
        setIsCustomVenue(true);
      }
    });
  };

  const handleVenueSelect = (value: string) => {
    if (value === CUSTOM_VENUE_VALUE) {
      setVenueSelection(CUSTOM_VENUE_VALUE);
      setIsCustomVenue(true);
      setForm((prev) => ({ ...prev, venue: "" }));
      return;
    }

    setVenueSelection(value);
    setIsCustomVenue(false);
    setForm((prev) => ({ ...prev, venue: value }));
  };

  const handlePrimaryClick = () => {
    if (isDemoProfile) {
      setModal("demo");
      return;
    }
    if (!ctx.isAuthenticated) {
      setModal("auth");
      return;
    }
    if (!isOrganizer) {
      setModal("upgrade");
      return;
    }
    setModal("booking");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!djProfileId) {
      toast.error("Booking form is unavailable for this profile.");
      return;
    }
    if (!form.countryId || !form.cityId) {
      toast.error("Please select a country and city.");
      return;
    }
    if (!form.venue.trim()) {
      toast.error("Please provide a venue.");
      return;
    }
    if (messageTooShort) {
      toast.error(`Message must be at least ${MIN_MESSAGE_LENGTH} characters.`);
      return;
    }

    const needsAmount =
      form.budgetType === "FIXED" || form.budgetType === "RANGE";
    if (needsAmount && !form.budgetMin) {
      toast.error("Please provide a budget amount.");
      return;
    }
    if (form.budgetType === "RANGE" && !form.budgetMax) {
      toast.error("Please provide a maximum budget amount.");
      return;
    }

    startSubmitTransition(async () => {
      const payload = {
        djProfileId,
        eventName: form.eventName,
        eventDate: form.eventDate,
        venue: form.venue,
        countryId: Number(form.countryId),
        cityId: Number(form.cityId),
        crowdSize: Number(form.crowdSize),
        budgetType: form.budgetType,
        budgetMin:
          form.budgetType === "FIXED" || form.budgetType === "RANGE"
            ? Number(form.budgetMin)
            : null,
        budgetMax: form.budgetType === "RANGE" ? Number(form.budgetMax) : null,
        budgetCurrency: form.budgetCurrency || "SEK",
        message: form.message,
      };

      const result = await submitBookingInquiry(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Booking request sent to the DJ");
      setModal("none");
      resetForm();
    });
  };

  return (
    <div
      className={cn(isDesktop && "hidden lg:block", !isDesktop && "lg:hidden")}
    >
      <Card
        className={cn(
          "gap-0 overflow-hidden p-5",
          isPremium
            ? "to-h_blackLight/30 border-amber-500/25 bg-linear-to-b from-amber-500/8"
            : "from-h_red/10 border-h_red/20 bg-linear-to-b to-transparent",
        )}
      >
        {isPremium && (
          <div className="mb-1 flex items-center gap-2">
            <Rocket className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
              Priority Booking
            </span>
          </div>
        )}

        <h3 className="mb-1 text-sm font-semibold text-white">
          Book {stageName}
        </h3>

        {isPremium && (
          <div className="mb-4 flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">
              Responding within 2 hours
            </span>
          </div>
        )}

        {!isPremium && (
          <p className="mb-4 text-xs text-gray-400">
            For clubs, festivals, events &amp; more
          </p>
        )}

        <Button
          className="bg-h_red hover:bg-h_redDark w-full font-semibold text-white"
          onClick={handlePrimaryClick}
        >
          <CalendarCheck2 className="mr-1.5 h-3.5 w-3.5" />
          Book / Hire DJ
        </Button>

        {isPremium && isDesktop && (
          <div className="mt-3 flex justify-between border-t border-white/5 pt-3">
            <div className="text-center">
              <p className="text-sm font-bold text-white">{responseRate}%</p>
              <p className="text-[11px] text-gray-500">Response Rate</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">
                {bookingSuccessRate}%
              </p>
              <p className="text-[11px] text-gray-500">Booking Rate</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">&lt;2h</p>
              <p className="text-[11px] text-gray-500">Reply Time</p>
            </div>
          </div>
        )}
      </Card>

      <Dialog
        open={modal !== "none"}
        onOpenChange={(open) => {
          if (!open) setModal("none");
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {modal === "auth" && (
            <>
              <DialogHeader>
                <DialogTitle>Sign in to continue</DialogTitle>
                <DialogDescription>
                  You need a DJcovery account to send booking requests. Sign in
                  or create a free organizer account in seconds.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="w-full sm:flex-1"
                  onClick={() => setModal("none")}
                >
                  Cancel
                </Button>
                <Button className="w-full sm:flex-1" asChild>
                  <Link
                    href={`/sign-in?returnTo=${encodeURIComponent(window.location.pathname)}`}
                  >
                    Sign In
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}

          {modal === "upgrade" && (
            <>
              <DialogHeader>
                <DialogTitle>Organizers only</DialogTitle>
                <DialogDescription>
                  Booking requests are reserved for promoters, venues, and event
                  organizers. Upgrade your account to unlock professional tools.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
                <p className="font-medium text-white">Why upgrade?</p>
                <ul className="mt-2 space-y-1 text-gray-400">
                  <li>• Manage booking threads in one inbox</li>
                  <li>• Unlock organizer-only gig publishing tools</li>
                  <li>• Get curated DJ recommendations</li>
                </ul>
              </div>
              <DialogFooter className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="w-full sm:flex-1"
                  onClick={() => setModal("none")}
                >
                  Maybe later
                </Button>
                <Button className="w-full sm:flex-1" asChild>
                  <Link href="/become-organizer">Become an Organizer</Link>
                </Button>
              </DialogFooter>
            </>
          )}

          {modal === "demo" && (
            <>
              <DialogHeader>
                <DialogTitle>Booking is disabled in demo mode</DialogTitle>
                <DialogDescription>
                  This is a preview profile. Sign in to a real DJ profile to
                  send a booking request.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setModal("none")}>Got it</Button>
              </DialogFooter>
            </>
          )}

          {modal === "booking" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Booking details</DialogTitle>
                <DialogDescription>
                  Provide key details so {stageName} can evaluate your event
                  quickly. Contact info stays hidden until the DJ accepts.
                </DialogDescription>
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
                  <Input
                    id="eventDate"
                    type="date"
                    value={form.eventDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        eventDate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="countryId">Country</Label>
                  <Select
                    value={form.countryId}
                    onValueChange={handleCountryChange}
                  >
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
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cityId">City</Label>
                  <Select
                    value={form.cityId}
                    onValueChange={handleCityChange}
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
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="venue">Venue</Label>
                {venues.length > 0 && !isCustomVenue ? (
                  <Select
                    value={venueSelection}
                    onValueChange={handleVenueSelect}
                  >
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
                        className="text-left text-xs text-gray-500 underline-offset-2 hover:text-gray-300 hover:underline"
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
                        <span className="text-[11px] text-gray-500">
                          {opt.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {(form.budgetType === "FIXED" ||
                  form.budgetType === "RANGE") && (
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
                    messageTooShort ? "text-amber-400" : "text-gray-500",
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
                  onClick={() => setModal("none")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
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
          )}

          {modal === "booking" && isDemoProfile && (
            <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 bg-white/5 p-6 text-sm text-gray-300">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              This booking flow is disabled for demo profiles.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
