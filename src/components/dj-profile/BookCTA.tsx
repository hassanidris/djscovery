"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  forwardRef,
  useImperativeHandle,
} from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitBookingInquiry } from "@/lib/actions/booking-inquiry";
import { getCitiesForCountry, getVenuesForCity } from "@/lib/actions/locations";
import type { BookingFormOptions, BookingViewerContext } from "@/types/booking";
import { CalendarCheck2, Rocket } from "lucide-react";
import {
  CUSTOM_VENUE_VALUE,
  MIN_MESSAGE_LENGTH,
  type FormState,
} from "@/components/dj-profile/book-cta/shared";

// Modal contents are dynamically imported so their JS only ships when the
// user opens a modal. The trigger button stays eager for instant interaction.
const AuthModalContent = dynamic(
  () => import("@/components/dj-profile/book-cta/AuthModalContent"),
  { ssr: false, loading: () => null },
);
const UpgradeModalContent = dynamic(
  () => import("@/components/dj-profile/book-cta/UpgradeModalContent"),
  { ssr: false, loading: () => null },
);
const DemoModalContent = dynamic(
  () => import("@/components/dj-profile/book-cta/DemoModalContent"),
  { ssr: false, loading: () => null },
);
const BookingModalContent = dynamic(
  () => import("@/components/dj-profile/book-cta/BookingModalContent"),
  { ssr: false, loading: () => null },
);

type BookCTAVariant = "free" | "premium";
type BookCTALayout = "mobile" | "desktop";
type ModalState = "none" | "auth" | "upgrade" | "booking" | "demo";

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
  packageName?: string;
  packagePrice?: number;
};

export interface BookCTARef {
  openBookingModal: (
    packageName?: string,
    packagePrice?: number,
    packagePriceTo?: number,
  ) => void;
}

export const BookCTA = forwardRef<BookCTARef, Props>(
  (
    {
      stageName,
      djProfileId,
      viewer,
      variant = "free",
      layout = "mobile",
      responseRate = 0,
      bookingSuccessRate = 0,
      bookingOptions,
      packageName,
      packagePrice,
    },
    ref,
  ) => {
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
        budgetType: packagePrice ? "FIXED" : "NEGOTIABLE",
        budgetMin: packagePrice ? String(packagePrice) : "",
        budgetMax: "",
        budgetCurrency: defaultCurrency,
        message: packageName
          ? `I'm interested in the ${packageName} package.`
          : "",
      }),
      [
        defaultCountryValue,
        defaultCityValue,
        defaultCurrency,
        packageName,
        packagePrice,
      ],
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

    // Expose openBookingModal function via ref
    useImperativeHandle(ref, () => ({
      openBookingModal: (
        newPackageName?: string,
        newPackagePrice?: number,
        newPackagePriceTo?: number,
      ) => {
        // Update form with package details
        setForm((prev) => ({
          ...prev,
          countryId: prev.countryId || defaultCountryValue,
          cityId: prev.cityId || defaultCityValue,
          budgetType: newPackagePriceTo
            ? "RANGE"
            : newPackagePrice
              ? "FIXED"
              : "NEGOTIABLE",
          budgetMin: newPackagePrice ? String(newPackagePrice) : "",
          budgetMax: newPackagePriceTo ? String(newPackagePriceTo) : "",
          message: newPackageName
            ? `I'm interested in the ${newPackageName} package.`
            : "",
          packageName: newPackageName,
          packagePrice: newPackagePrice,
          packagePriceTo: newPackagePriceTo,
        }));
        // Force custom venue input for package enquiries
        if (newPackageName) {
          setIsCustomVenue(true);
          setVenueSelection(CUSTOM_VENUE_VALUE);
        }
        setModal("booking");
      },
    }));

    const latestCountryRequestIdRef = useRef(0);
    const latestCityRequestIdRef = useRef(0);

    const [prevReset, setPrevReset] = useState<{
      formState: FormState;
      options: typeof bookingOptions;
    }>({ formState: initialFormState, options: bookingOptions });

    if (
      prevReset.formState !== initialFormState ||
      prevReset.options !== bookingOptions
    ) {
      setPrevReset({ formState: initialFormState, options: bookingOptions });
      setForm(initialFormState);
      setCities(bookingOptions?.initialCities ?? []);
      setVenues(bookingOptions?.initialVenues ?? []);
      setVenueSelection("");
      setIsCustomVenue((bookingOptions?.initialVenues ?? []).length === 0);
    }

    useEffect(() => {
      if (!bookingOptions) return;
      if (!form.cityId) return;
      if (venues.length > 0) return;
      const requestId = ++latestCityRequestIdRef.current;
      const cityId = form.cityId;

      startVenueTransition(async () => {
        try {
          const fetched = await getVenuesForCity(Number(cityId));
          if (latestCityRequestIdRef.current !== requestId) {
            return;
          }
          setVenues(fetched);
          if (fetched.length === 0) {
            setVenueSelection(CUSTOM_VENUE_VALUE);
            setIsCustomVenue(true);
          }
        } catch {
          // Ignore fetch errors here; user can still enter manually.
          if (latestCityRequestIdRef.current !== requestId) {
            return;
          }
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

    const isPremium = variant === "premium";
    const isDesktop = layout === "desktop";
    const isOrganizer = ctx.role === "organizer" || ctx.role === "admin";
    const isDemoProfile =
      Number.isNaN(djProfileId) || djProfileId === undefined;

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

      const requestId = ++latestCountryRequestIdRef.current;

      startCityTransition(async () => {
        try {
          const fetchedCities = await getCitiesForCountry(Number(value));
          if (latestCountryRequestIdRef.current !== requestId) {
            return;
          }

          setCities(fetchedCities);

          if (fetchedCities.length === 0) {
            setForm((prev) => {
              if (latestCountryRequestIdRef.current !== requestId) {
                return prev;
              }
              return { ...prev, cityId: "" };
            });
            if (latestCountryRequestIdRef.current !== requestId) {
              return;
            }
            setVenues([]);
            setVenueSelection(CUSTOM_VENUE_VALUE);
            setIsCustomVenue(true);
            return;
          }

          const firstCityId = String(fetchedCities[0].id);
          setForm((prev) => {
            if (latestCountryRequestIdRef.current !== requestId) {
              return prev;
            }
            return { ...prev, cityId: firstCityId };
          });
          if (latestCountryRequestIdRef.current !== requestId) {
            return;
          }
          setVenueSelection("");
          setIsCustomVenue(true);

          const venueRequestId = ++latestCityRequestIdRef.current;
          startVenueTransition(async () => {
            try {
              const fetchedVenues = await getVenuesForCity(Number(firstCityId));
              if (
                latestCountryRequestIdRef.current !== requestId ||
                latestCityRequestIdRef.current !== venueRequestId
              ) {
                return;
              }
              setVenues(fetchedVenues);
              if (fetchedVenues.length === 0) {
                setVenueSelection(CUSTOM_VENUE_VALUE);
                setIsCustomVenue(true);
              } else {
                setForm((prev) => {
                  if (
                    latestCountryRequestIdRef.current !== requestId ||
                    latestCityRequestIdRef.current !== venueRequestId
                  ) {
                    return prev;
                  }
                  return { ...prev, venue: "" };
                });
                setVenueSelection("");
                setIsCustomVenue(false);
              }
            } catch {
              if (
                latestCountryRequestIdRef.current !== requestId ||
                latestCityRequestIdRef.current !== venueRequestId
              ) {
                return;
              }
              setVenues([]);
              setVenueSelection(CUSTOM_VENUE_VALUE);
              setIsCustomVenue(true);
            }
          });
        } catch {
          if (latestCountryRequestIdRef.current !== requestId) {
            return;
          }
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

      const requestId = ++latestCityRequestIdRef.current;

      startVenueTransition(async () => {
        try {
          const fetchedVenues = await getVenuesForCity(Number(value));
          if (latestCityRequestIdRef.current !== requestId) {
            return;
          }
          setVenues(fetchedVenues);
          if (fetchedVenues.length === 0) {
            setVenueSelection(CUSTOM_VENUE_VALUE);
            setIsCustomVenue(true);
          } else {
            setForm((prev) => {
              if (latestCityRequestIdRef.current !== requestId) {
                return prev;
              }
              return { ...prev, venue: "" };
            });
            setVenueSelection("");
            setIsCustomVenue(false);
          }
        } catch {
          if (latestCityRequestIdRef.current !== requestId) {
            return;
          }
          toast.error(
            "Could not load venues for that city. Enter one manually.",
          );
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
        toast.error(
          `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`,
        );
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
          budgetMax:
            form.budgetType === "RANGE" ? Number(form.budgetMax) : null,
          budgetCurrency: form.budgetCurrency || "SEK",
          message: form.message,
          packageName: form.packageName,
          packagePrice: form.packagePrice,
          packagePriceTo: form.packagePriceTo,
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

    const closeModal = () => setModal("none");

    return (
      <div
        className={cn(
          isDesktop && "hidden lg:block",
          !isDesktop && "lg:hidden",
        )}
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
            className="bg-h_red hover:bg-h_redDark w-full font-semibold text-white shadow-lg"
            size="lg"
            onClick={handlePrimaryClick}
          >
            <CalendarCheck2 className="mr-1.5 h-4 w-4" />
            Book / Hire DJ
          </Button>

          {isPremium && isDesktop && (
            <div className="mt-3 flex justify-between border-t border-white/5 pt-3">
              <div className="text-center">
                <p className="text-sm font-bold text-white">{responseRate}%</p>
                <p className="text-[11px] text-gray-400">Response Rate</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">
                  {bookingSuccessRate}%
                </p>
                <p className="text-[11px] text-gray-400">Booking Rate</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">&lt;2h</p>
                <p className="text-[11px] text-gray-400">Reply Time</p>
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
            {modal === "auth" && <AuthModalContent onClose={closeModal} />}

            {modal === "upgrade" && (
              <UpgradeModalContent onClose={closeModal} />
            )}

            {modal === "demo" && <DemoModalContent onClose={closeModal} />}

            {modal === "booking" && (
              <BookingModalContent
                stageName={stageName}
                isDemoProfile={isDemoProfile}
                form={form}
                setForm={setForm}
                countries={countries}
                cities={cities}
                venues={venues}
                venueSelection={venueSelection}
                setVenueSelection={setVenueSelection}
                isCustomVenue={isCustomVenue}
                setIsCustomVenue={setIsCustomVenue}
                isLoadingCities={isLoadingCities}
                isLoadingVenues={isLoadingVenues}
                isSubmitting={isSubmitting}
                messageLength={messageLength}
                messageTooShort={messageTooShort}
                onCountryChange={handleCountryChange}
                onCityChange={handleCityChange}
                onVenueSelect={handleVenueSelect}
                onSubmit={handleSubmit}
                onClose={closeModal}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);

BookCTA.displayName = "BookCTA";

export default BookCTA;
