"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Globe,
  MapPin,
  CalendarDays,
  Clock,
  Tag,
  Music,
  Ticket,
  FileText,
  Link2,
  Camera,
  Trash2,
  ImageIcon,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCitiesForCountry } from "@/lib/actions/locations";
import { createEvent, updateEvent } from "@/lib/actions/event";
import {
  uploadEventPoster,
  uploadEventGalleryImage,
  deleteEventGalleryImage,
} from "@/lib/actions/event-upload";
import { createGenre, getGenres } from "@/lib/actions/genre";
import {
  VALID_EVENT_CATEGORIES,
  type EventCategory,
} from "@/lib/event-categories";
import {
  getTimezoneByCountryCode,
  getTimezoneOffsetLabel,
} from "@/lib/timezones";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CountryOption = { id: number; name: string; code?: string };
export type CityOption = { id: number; name: string };

export type EventFormData = {
  title: string;
  eventType: "PUBLIC" | "PRIVATE";
  category: EventCategory | "";
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  countryId: string;
  cityId: string;
  venue: string;
  description: string;
  ticketUrl: string;
  genres: string[];
  recap: string;
  audioLink: string;
  timezone: string;
};

type GalleryImage = { id: number; url: string };

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

// ── Labels ────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<EventCategory, string> = {
  CLUB_NIGHT: "Club Night",
  FESTIVAL: "Festival",
  WEDDING: "Wedding",
  BIRTHDAY: "Birthday",
  CORPORATE: "Corporate",
  BEACH_PARTY: "Beach Party",
  LOUNGE: "Lounge",
  RESTAURANT_SET: "Restaurant Set",
  PRIVATE_PARTY: "Private Party",
  OPEN_AIR: "Open Air",
  LUXURY_EVENT: "Luxury Event",
  OTHER: "Other",
};

// ── Defaults ──────────────────────────────────────────────────────────────────

const FORM_DEFAULTS: EventFormData = {
  title: "",
  eventType: "PUBLIC",
  category: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  countryId: "",
  cityId: "",
  venue: "",
  description: "",
  ticketUrl: "",
  genres: [],
  recap: "",
  audioLink: "",
  timezone: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

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
  const [errors, setErrors] = useState<
    Partial<Record<keyof EventFormData, string>>
  >({});
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
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

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

  async function handleGalleryUpload(file: File | undefined) {
    if (!file || props.mode !== "edit") return;
    setIsUploadingGallery(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("eventId", String(props.eventId));
      const res = await uploadEventGalleryImage(fd);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        setGallery((prev) => [...prev, { id: res.id, url: res.url }]);
        toast.success("Photo added to gallery");
      }
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploadingGallery(false);
    }
  }

  async function handleGalleryDelete(id: number) {
    const res = await deleteEventGalleryImage(id);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      setGallery((prev) => prev.filter((g) => g.id !== id));
      toast.success("Photo removed");
    }
  }

  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [customGenreInput, setCustomGenreInput] = useState("");
  const [genreSuggestion, setGenreSuggestion] = useState<string | null>(null);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  // Fetch genres on mount
  useEffect(() => {
    getGenres().then(setAvailableGenres);
  }, []);

  // Filter genres for dropdown
  const filteredGenres = availableGenres
    .filter((g) => {
      if (!customGenreInput.trim()) return true;
      const norm = normalizeGenre(g);
      const inputNorm = normalizeGenre(customGenreInput);
      return (
        norm.includes(inputNorm) ||
        g.toLowerCase().includes(customGenreInput.toLowerCase())
      );
    })
    .filter((g) => !data.genres.includes(g))
    .slice(0, 10); // Limit to 10 suggestions

  function normalizeGenre(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function findGenreByNormalized(name: string): string | undefined {
    const norm = normalizeGenre(name);
    return availableGenres.find((g) => normalizeGenre(g) === norm);
  }

  function findSimilarGenre(name: string): string | undefined {
    const norm = normalizeGenre(name);
    // Simple misspelling check: allow 1-2 character differences for short words
    for (const g of availableGenres) {
      const gNorm = normalizeGenre(g);
      if (gNorm.length > 3 && norm.length > 3) {
        // If lengths are close and one contains the other, likely a misspelling
        if (Math.abs(gNorm.length - norm.length) <= 2) {
          if (gNorm.includes(norm) || norm.includes(gNorm)) return g;
        }
      }
    }
    return undefined;
  }

  function toggleGenre(genre: string) {
    if (data.genres.includes(genre)) {
      set(
        "genres",
        data.genres.filter((g) => g !== genre),
      );
    } else if (data.genres.length < 8) {
      set("genres", [...data.genres, genre]);
    }
  }

  async function handleAddCustomGenre() {
    const trimmed = customGenreInput.trim();
    if (!trimmed || data.genres.length >= 8) return;

    // 1. Exact normalized match?
    const exact = findGenreByNormalized(trimmed);
    if (exact) {
      if (!data.genres.includes(exact)) {
        toggleGenre(exact);
      }
      setCustomGenreInput("");
      setGenreSuggestion(null);
      return;
    }

    // 2. Similar (possible misspelling)?
    const similar = findSimilarGenre(trimmed);
    if (similar && !data.genres.includes(similar)) {
      // Show suggestion instead of creating
      setGenreSuggestion(similar);
      return;
    }

    // 3. Create new genre
    const toastId = toast.loading("Adding genre...");
    try {
      const res = await createGenre(trimmed);
      if ("error" in res) {
        toast.error(res.error, { id: toastId });
        return;
      }
      setAvailableGenres((prev) =>
        prev.includes(res.name) ? prev : [...prev, res.name],
      );
      if (!data.genres.includes(res.name) && data.genres.length < 8) {
        set("genres", [...data.genres, res.name]);
      }
      toast.success(`"${res.name}" added`, { id: toastId });
      setCustomGenreInput("");
      setGenreSuggestion(null);
    } catch (error) {
      toast.error("Failed to add genre", { id: toastId });
    }
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};
    if (!data.title.trim()) newErrors.title = "Title is required.";
    if (!data.category) newErrors.category = "Category is required.";
    if (!data.startDate) newErrors.startDate = "Start date is required.";
    if (!data.countryId) newErrors.countryId = "Country is required.";
    if (data.ticketUrl && !/^https?:\/\/.+/.test(data.ticketUrl)) {
      newErrors.ticketUrl = "Ticket URL must be a valid URL.";
    }
    if (data.audioLink && !/^https?:\/\/.+/.test(data.audioLink)) {
      newErrors.audioLink = "Audio link must be a valid URL.";
    }
    if (data.startTime && !/^\d{2}:\d{2}$/.test(data.startTime)) {
      newErrors.startTime = "Use HH:MM format.";
    }
    if (data.endTime && !/^\d{2}:\d{2}$/.test(data.endTime)) {
      newErrors.endTime = "Use HH:MM format.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

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
      {/* ── Basic Info ── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
          <FileText className="h-4 w-4" /> Basic Info
        </h2>

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-zinc-300">
            Event Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Sunset Grooves Lisbon"
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
          />
          {errors.title && (
            <p className="text-xs text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Event Type toggle */}
        <div className="space-y-1.5">
          <Label className="text-zinc-300">
            Event Type <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-3">
            {(["PUBLIC", "PRIVATE"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => set("eventType", type)}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                  data.eventType === type
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {type === "PUBLIC" ? "🌐 Public" : "🔒 Private"}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400">
            {data.eventType === "PUBLIC"
              ? "Visible to everyone. Ticket URL can be added."
              : "Only you can see the full details. Location is hidden."}
          </p>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-zinc-300">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.category}
            onValueChange={(v) => set("category", v)}
          >
            <SelectTrigger
              id="category"
              className="w-full border-zinc-700 bg-zinc-900 text-white focus:border-zinc-500"
            >
              <SelectValue placeholder="Select category…" />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-900">
              {VALID_EVENT_CATEGORIES.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                >
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-red-400">{errors.category}</p>
          )}
        </div>

        {/* Poster */}
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Event Poster</Label>
          {posterUrl && (
            <div className="relative mb-2 h-40 w-full overflow-hidden rounded-lg bg-zinc-900">
              <Image
                src={posterUrl}
                alt="Event poster"
                fill
                className="object-cover"
              />
            </div>
          )}
          <input
            ref={posterInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              handlePosterUpload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploadingPoster}
            onClick={() => posterInputRef.current?.click()}
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            {isUploadingPoster ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="mr-1.5 h-3.5 w-3.5" />
            )}
            {posterUrl ? "Change Poster" : "Upload Poster"}
          </Button>
          {props.mode === "create" && (
            <p className="text-xs text-zinc-400">
              Poster will be uploaded after the event is created.
            </p>
          )}
        </div>
      </section>

      <hr className="border-zinc-800" />

      {/* ── Location ── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
          <MapPin className="h-4 w-4" /> Location
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="countryId"
              className="flex items-center gap-1 text-zinc-300"
            >
              <Globe className="h-3.5 w-3.5" /> Country{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.countryId}
              onValueChange={(v) => handleCountryChange(v)}
            >
              <SelectTrigger
                id="countryId"
                className="w-full border-zinc-700 bg-zinc-900 text-white focus:border-zinc-500"
              >
                <SelectValue placeholder="Select country…" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                {props.countries.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={String(c.id)}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                  >
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.countryId && (
              <p className="text-xs text-red-400">{errors.countryId}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cityId" className="text-zinc-300">
              City
            </Label>
            <Select
              value={data.cityId}
              onValueChange={(v) => set("cityId", v)}
              disabled={cities.length === 0}
            >
              <SelectTrigger
                id="cityId"
                className="w-full border-zinc-700 bg-zinc-900 text-white focus:border-zinc-500 disabled:opacity-40"
              >
                <SelectValue
                  placeholder={
                    cities.length === 0
                      ? "Select country first"
                      : "Select city…"
                  }
                />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                {cities.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={String(c.id)}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                  >
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="venue" className="text-zinc-300">
            Venue Name
          </Label>
          <Input
            id="venue"
            value={data.venue}
            onChange={(e) => set("venue", e.target.value)}
            placeholder="e.g. DC-10, Berghain, Avicii Arena"
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </div>
      </section>

      <hr className="border-zinc-800" />

      {/* ── Date & Time ── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
          <CalendarDays className="h-4 w-4" /> Date &amp; Time
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="startDate" className="text-zinc-300">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              id="startDate"
              value={data.startDate}
              onChange={(v) => set("startDate", v)}
              placeholder="Select start date"
              className="border-zinc-700 bg-zinc-900 focus:border-zinc-500"
            />
            {errors.startDate && (
              <p className="text-xs text-red-400">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endDate" className="text-zinc-300">
              End Date
            </Label>
            <DatePicker
              id="endDate"
              value={data.endDate}
              onChange={(v) => set("endDate", v)}
              placeholder="Select end date"
              className="border-zinc-700 bg-zinc-900 focus:border-zinc-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="startTime"
              className="flex items-center gap-1 text-zinc-300"
            >
              <Clock className="h-3.5 w-3.5" /> Start Time
            </Label>
            <TimePicker
              id="startTime"
              value={data.startTime}
              onChange={(v) => set("startTime", v)}
              placeholder="Select start time"
              className="border-zinc-700 bg-zinc-900 focus:border-zinc-500"
            />
            {errors.startTime && (
              <p className="text-xs text-red-400">{errors.startTime}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="endTime"
              className="flex items-center gap-1 text-zinc-300"
            >
              <Clock className="h-3.5 w-3.5" /> End Time
            </Label>
            <TimePicker
              id="endTime"
              value={data.endTime}
              onChange={(v) => set("endTime", v)}
              placeholder="Select end time"
              className="border-zinc-700 bg-zinc-900 focus:border-zinc-500"
            />
            {errors.endTime && (
              <p className="text-xs text-red-400">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-1.5">
          <Label
            htmlFor="timezone"
            className="flex items-center gap-1 text-zinc-300"
          >
            <Globe className="h-3.5 w-3.5" /> Timezone
          </Label>
          <Input
            id="timezone"
            value={data.timezone}
            onChange={(e) => set("timezone", e.target.value)}
            placeholder="Europe/Stockholm"
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
          />
          <p className="text-xs text-zinc-400">
            {data.timezone
              ? `Auto-detected from country — ${data.timezone} (UTC${getTimezoneOffsetLabel(data.timezone)}). Adjust if needed.`
              : "Auto-detected from country. Adjust if needed."}
          </p>
        </div>
      </section>

      <hr className="border-zinc-800" />

      {/* ── Details ── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
          <Tag className="h-4 w-4" /> Details
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-zinc-300">
            Description
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Tell fans what to expect…"
            rows={4}
            maxLength={1000}
            className="resize-none border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
          />
          <p className="text-right text-xs text-zinc-600">
            {data.description.length}/1000
          </p>
        </div>

        {/* Genres */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1 text-zinc-300">
              <Music className="h-3.5 w-3.5" /> Genres
            </Label>
            <span className="text-xs text-zinc-400">
              {data.genres.length}/8 selected
            </span>
          </div>
          {/* Selected genres */}
          <div className="flex flex-wrap gap-2">
            {data.genres.map((genre) => (
              <span
                key={genre}
                className="border-h_red bg-h_red/15 text-h_redLight inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
              >
                {genre}
                <button
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className="ml-1 hover:text-white"
                  aria-label={`Remove ${genre}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Custom genre input */}
          {data.genres.length < 8 && (
            <div className="flex flex-col gap-2 pt-1">
              {genreSuggestion && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                  <span className="text-xs text-amber-300">
                    Did you mean{" "}
                    <button
                      type="button"
                      onClick={() => {
                        toggleGenre(genreSuggestion);
                        setGenreSuggestion(null);
                        setCustomGenreInput("");
                      }}
                      className="font-semibold text-amber-200 underline hover:text-white"
                    >
                      {genreSuggestion}
                    </button>
                    ?
                  </span>
                  <button
                    type="button"
                    onClick={() => setGenreSuggestion(null)}
                    className="ml-auto text-[10px] text-amber-400/70 hover:text-amber-300"
                  >
                    No, add new
                  </button>
                </div>
              )}
              <div className="relative">
                <Input
                  value={customGenreInput}
                  onChange={(e) => {
                    setCustomGenreInput(e.target.value);
                    if (genreSuggestion) setGenreSuggestion(null);
                    setShowGenreDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() =>
                    setShowGenreDropdown(customGenreInput.length > 0)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowGenreDropdown(false), 200)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomGenre();
                    }
                  }}
                  placeholder="Add a custom genre…"
                  className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
                />
                {showGenreDropdown && filteredGenres.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-zinc-700 bg-zinc-900 shadow-lg">
                    {filteredGenres.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => {
                          toggleGenre(genre);
                          setCustomGenreInput("");
                          setShowGenreDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomGenre}
                disabled={!customGenreInput.trim() || data.genres.length >= 8}
                className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Ticket URL (PUBLIC only) ── */}
      {data.eventType === "PUBLIC" && (
        <>
          <hr className="border-zinc-800" />
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
              <Ticket className="h-4 w-4" /> Tickets
            </h2>
            <div className="space-y-1.5">
              <Label htmlFor="ticketUrl" className="text-zinc-300">
                Ticket URL
              </Label>
              <Input
                id="ticketUrl"
                value={data.ticketUrl}
                onChange={(e) => set("ticketUrl", e.target.value)}
                placeholder="https://ra.co/events/…"
                className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
              />
              {errors.ticketUrl && (
                <p className="text-xs text-red-400">{errors.ticketUrl}</p>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── Post-Event (COMPLETED events only) ── */}
      {isCompleted && (
        <>
          <hr className="border-zinc-800" />
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
              <Link2 className="h-4 w-4" /> Post-Event
            </h2>
            <p className="text-xs text-zinc-400">
              Add a recap and audio link now the event is completed.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="recap" className="text-zinc-300">
                Event Recap
              </Label>
              <Textarea
                id="recap"
                value={data.recap}
                onChange={(e) => set("recap", e.target.value)}
                placeholder="How did the night go? Share a summary…"
                rows={4}
                maxLength={2000}
                className="resize-none border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
              />
              <p className="text-right text-xs text-zinc-600">
                {data.recap.length}/2000
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="audioLink" className="text-zinc-300">
                Audio Link
              </Label>
              <Input
                id="audioLink"
                value={data.audioLink}
                onChange={(e) => set("audioLink", e.target.value)}
                placeholder="SoundCloud or Mixcloud link"
                className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
              />
              {errors.audioLink && (
                <p className="text-xs text-red-400">{errors.audioLink}</p>
              )}
            </div>

            {/* Gallery */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-zinc-300">
                <ImageIcon className="h-3.5 w-3.5" /> Event Photos
              </Label>
              {gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900"
                    >
                      <Image
                        src={img.url}
                        alt="Gallery"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleGalleryDelete(img.id)}
                        className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-900/80 hover:text-red-400"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                id="gallery-upload"
                onChange={(e) => {
                  handleGalleryUpload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingGallery}
                onClick={() =>
                  document.getElementById("gallery-upload")?.click()
                }
                className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                {isUploadingGallery ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="mr-1.5 h-3.5 w-3.5" />
                )}
                Add Photo
              </Button>
            </div>
          </section>
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
