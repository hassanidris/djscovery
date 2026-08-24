"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCitiesForCountry } from "@/lib/actions/locations";
import { createEvent, updateEvent } from "@/lib/actions/event";
import { uploadEventPoster } from "@/lib/actions/event-upload";
import { getGenres } from "@/lib/actions/genre";
import { getTimezoneByCountryCode } from "@/lib/timezones";
import type { EventCategory } from "@/lib/event-categories";

import { BasicInfoSection } from "./event-form/BasicInfoSection";
import { LocationSection } from "./event-form/LocationSection";
import { DateTimeSection } from "./event-form/DateTimeSection";
import { DetailsSection } from "./event-form/DetailsSection";
import { TicketsSection } from "./event-form/TicketsSection";
import { PostEventSection } from "./event-form/PostEventSection";
import { validateEventForm } from "./event-form/validation";
import type {
  CountryOption,
  CityOption,
  EventFormData,
  EventFormErrors,
  GalleryImage,
} from "./event-form/types";
import { FORM_DEFAULTS } from "./event-form/types";

export type {
  CountryOption,
  CityOption,
  EventFormData,
} from "./event-form/types";
export type { GalleryImage } from "./event-form/types";

type EventFormProps =
  | {
      mode: "create";
      countries: CountryOption[];
      djDefaults?: { countryId?: string; cityId?: string };
    }
  | {
      mode: "edit";
      eventId: number;
      eventStatus: string;
      initialData: Partial<EventFormData>;
      countries: CountryOption[];
      initialCities?: CityOption[];
      posterUrl?: string | null;
      galleryImages?: GalleryImage[];
    };

export function EventForm(props: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaults: EventFormData =
    props.mode === "edit"
      ? { ...FORM_DEFAULTS, ...props.initialData }
      : {
          ...FORM_DEFAULTS,
          countryId: props.djDefaults?.countryId ?? "",
          cityId: props.djDefaults?.cityId ?? "",
        };

  const [data, setData] = useState<EventFormData>(defaults);
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [cities, setCities] = useState<CityOption[]>(
    props.mode === "edit" ? (props.initialCities ?? []) : [],
  );

  const isCompleted =
    props.mode === "edit" && props.eventStatus === "COMPLETED";

  const [posterUrl, setPosterUrl] = useState<string | null>(
    props.mode === "edit" ? (props.posterUrl ?? null) : null,
  );
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const pendingPosterFile = useRef<File | null>(null);

  const [gallery, setGallery] = useState<GalleryImage[]>(
    props.mode === "edit" ? (props.galleryImages ?? []) : [],
  );

  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

  // Fetch genres on mount
  useEffect(() => {
    getGenres().then(setAvailableGenres);
  }, []);

  // One-time initial load: fetch cities and set timezone for preselected country
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    if (data.countryId && cities.length === 0) {
      didInit.current = true;
      getCitiesForCountry(Number(data.countryId)).then(setCities);
      const country = props.countries.find(
        (c) => String(c.id) === data.countryId,
      );
      if (country?.code) {
        const tz = getTimezoneByCountryCode(country.code);
        if (tz) set("timezone", tz);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(field: keyof EventFormData, value: unknown) {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleCountryChange(countryId: string) {
    set("countryId", countryId);
    set("cityId", "");
    setCities([]);
    if (countryId) {
      const fetched = await getCitiesForCountry(Number(countryId));
      setCities(fetched);
      const country = props.countries.find((c) => String(c.id) === countryId);
      if (country?.code) {
        const tz = getTimezoneByCountryCode(country.code);
        if (tz) set("timezone", tz);
      }
    } else {
      set("timezone", "");
    }
  }

  async function handlePosterUpload(file: File | undefined) {
    if (!file) return;
    if (props.mode === "create") {
      pendingPosterFile.current = file;
      setPosterUrl(URL.createObjectURL(file));
      toast.success("Poster selected — will upload after event is created.");
      return;
    }
    setIsUploadingPoster(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("eventId", String(props.eventId));
      const res = await uploadEventPoster(fd);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        setPosterUrl(res.url);
        toast.success("Poster uploaded");
      }
    } catch (error) {
      toast.error("Failed to upload poster");
    } finally {
      setIsUploadingPoster(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validateEventForm(data);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    startTransition(async () => {
      try {
        const payload = {
          title: data.title.trim(),
          eventType: data.eventType,
          category: data.category as EventCategory,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          startTime: data.startTime || null,
          endTime: data.endTime || null,
          timezone: data.timezone || null,
          countryId: Number(data.countryId),
          cityId: data.cityId ? Number(data.cityId) : null,
          venue: data.venue.trim() || null,
          description: data.description.trim() || null,
          ticketUrl:
            data.eventType === "PUBLIC" && data.ticketUrl.trim()
              ? data.ticketUrl.trim()
              : null,
          genres: data.genres,
          ...(isCompleted && {
            recap: data.recap.trim() || null,
            audioLink: data.audioLink.trim() || null,
          }),
        };

        if (props.mode === "create") {
          const result = await createEvent(payload);
          if ("error" in result) {
            toast.error(result.error);
            return;
          }
          // Upload pending poster if user selected one during create
          if (pendingPosterFile.current) {
            const fd = new FormData();
            fd.append("file", pendingPosterFile.current);
            fd.append("eventId", String(result.id));
            const posterRes = await uploadEventPoster(fd);
            if ("error" in posterRes) {
              toast.error(`Poster upload failed: ${posterRes.error}`);
            }
            pendingPosterFile.current = null;
          }
          toast.success("Event created! It's saved as a draft.");
          router.push(`/events/${result.slug}/edit`);
        } else {
          const result = await updateEvent(props.eventId, payload);
          if ("error" in result) {
            toast.error(result.error);
            return;
          }
          toast.success("Event updated.");
          router.push("/dj/events");
        }
      } catch (err) {
        console.error("Event save error:", err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <BasicInfoSection
        data={data}
        set={set}
        errors={errors}
        posterUrl={posterUrl}
        isUploadingPoster={isUploadingPoster}
        posterInputRef={posterInputRef}
        onPosterUpload={handlePosterUpload}
        isCreateMode={props.mode === "create"}
      />

      <hr className="border-zinc-800" />

      <LocationSection
        countries={props.countries}
        cities={cities}
        data={data}
        set={set}
        onCountryChange={handleCountryChange}
        errors={errors}
      />

      <hr className="border-zinc-800" />

      <DateTimeSection data={data} set={set} errors={errors} />

      <hr className="border-zinc-800" />

      <DetailsSection
        data={data}
        set={set}
        availableGenres={availableGenres}
        setAvailableGenres={setAvailableGenres}
      />

      {/* ── Ticket URL (PUBLIC only) ── */}
      {data.eventType === "PUBLIC" && (
        <>
          <hr className="border-zinc-800" />
          <TicketsSection data={data} set={set} errors={errors} />
        </>
      )}

      {/* ── Post-Event (COMPLETED events only) ── */}
      {isCompleted && props.mode === "edit" && (
        <>
          <hr className="border-zinc-800" />
          <PostEventSection
            data={data}
            set={set}
            errors={errors}
            eventId={props.eventId}
            gallery={gallery}
            setGallery={setGallery}
          />
        </>
      )}

      {/* ── Submit ── */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
          className="text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-white text-black hover:bg-zinc-200"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {props.mode === "create" ? "Creating…" : "Saving…"}
            </>
          ) : props.mode === "create" ? (
            "Create Event"
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
