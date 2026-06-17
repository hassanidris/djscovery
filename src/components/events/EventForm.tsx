"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
} from "lucide-react";
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
import { getCitiesForCountry } from "@/lib/actions/locations";
import { createEvent, updateEvent, VALID_EVENT_CATEGORIES } from "@/lib/actions/event";
import type { EventCategory } from "@/lib/actions/event";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CountryOption = { id: number; name: string };
export type CityOption = { id: number; name: string };

type EventFormData = {
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
};

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
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});
  const [genreInput, setGenreInput] = useState("");
  const [cities, setCities] = useState<CityOption[]>(
    props.mode === "edit" ? (props.initialCities ?? []) : [],
  );

  const isCompleted =
    props.mode === "edit" && props.eventStatus === "COMPLETED";

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
    }
  }

  function addGenre() {
    const trimmed = genreInput.trim();
    if (!trimmed || data.genres.length >= 8) return;
    if (!data.genres.includes(trimmed)) {
      set("genres", [...data.genres, trimmed]);
    }
    setGenreInput("");
  }

  function removeGenre(genre: string) {
    set(
      "genres",
      data.genres.filter((g) => g !== genre),
    );
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
      const payload = {
        title: data.title.trim(),
        eventType: data.eventType,
        category: data.category as EventCategory,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        countryId: Number(data.countryId),
        cityId: data.cityId ? Number(data.cityId) : null,
        venue: data.venue.trim() || null,
        description: data.description.trim() || null,
        ticketUrl: data.eventType === "PUBLIC" && data.ticketUrl.trim() ? data.ticketUrl.trim() : null,
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
        toast.success("Event created! It's saved as a draft.");
        router.push("/dashboard/dj/events");
        router.refresh();
      } else {
        const result = await updateEvent(props.eventId, payload);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        toast.success("Event updated.");
        router.push("/dashboard/dj/events");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Basic Info ── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
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
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-zinc-500"
          />
          {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
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
          <p className="text-xs text-zinc-500">
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
              className="border-zinc-700 bg-zinc-900 text-white focus:border-zinc-500"
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
          {errors.category && <p className="text-xs text-red-400">{errors.category}</p>}
        </div>
      </section>

      <hr className="border-zinc-800" />

      {/* ── Date & Time ── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          <CalendarDays className="h-4 w-4" /> Date &amp; Time
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="startDate" className="text-zinc-300">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={data.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className="border-zinc-700 bg-zinc-900 text-white [color-scheme:dark] focus:border-zinc-500"
            />
            {errors.startDate && <p className="text-xs text-red-400">{errors.startDate}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endDate" className="text-zinc-300">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={data.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              className="border-zinc-700 bg-zinc-900 text-white [color-scheme:dark] focus:border-zinc-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="startTime" className="flex items-center gap-1 text-zinc-300">
              <Clock className="h-3.5 w-3.5" /> Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={data.startTime}
              onChange={(e) => set("startTime", e.target.value)}
              className="border-zinc-700 bg-zinc-900 text-white [color-scheme:dark] focus:border-zinc-500"
            />
            {errors.startTime && <p className="text-xs text-red-400">{errors.startTime}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endTime" className="flex items-center gap-1 text-zinc-300">
              <Clock className="h-3.5 w-3.5" /> End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={data.endTime}
              onChange={(e) => set("endTime", e.target.value)}
              className="border-zinc-700 bg-zinc-900 text-white [color-scheme:dark] focus:border-zinc-500"
            />
            {errors.endTime && <p className="text-xs text-red-400">{errors.endTime}</p>}
          </div>
        </div>
      </section>

      <hr className="border-zinc-800" />

      {/* ── Location ── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          <MapPin className="h-4 w-4" /> Location
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="countryId" className="flex items-center gap-1 text-zinc-300">
              <Globe className="h-3.5 w-3.5" /> Country <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.countryId}
              onValueChange={(v) => handleCountryChange(v)}
            >
              <SelectTrigger
                id="countryId"
                className="border-zinc-700 bg-zinc-900 text-white focus:border-zinc-500"
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
            {errors.countryId && <p className="text-xs text-red-400">{errors.countryId}</p>}
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
                className="border-zinc-700 bg-zinc-900 text-white focus:border-zinc-500 disabled:opacity-40"
              >
                <SelectValue placeholder={cities.length === 0 ? "Select country first" : "Select city…"} />
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
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-zinc-500"
          />
        </div>
      </section>

      <hr className="border-zinc-800" />

      {/* ── Details ── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
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
            className="resize-none border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-zinc-500"
          />
          <p className="text-right text-xs text-zinc-600">
            {data.description.length}/1000
          </p>
        </div>

        {/* Genres */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-zinc-300">
            <Music className="h-3.5 w-3.5" /> Genres
            <span className="ml-1 text-xs text-zinc-500">(max 8)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGenre();
                }
              }}
              placeholder="e.g. Afro House, Melodic Techno"
              disabled={data.genres.length >= 8}
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-zinc-500"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addGenre}
              disabled={!genreInput.trim() || data.genres.length >= 8}
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Add
            </Button>
          </div>
          {data.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {data.genres.map((genre) => (
                <span
                  key={genre}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => removeGenre(genre)}
                    className="text-zinc-500 hover:text-red-400"
                    aria-label={`Remove ${genre}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Ticket URL (PUBLIC only) ── */}
      {data.eventType === "PUBLIC" && (
        <>
          <hr className="border-zinc-800" />
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
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
                className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-zinc-500"
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
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
              <Link2 className="h-4 w-4" /> Post-Event
            </h2>
            <p className="text-xs text-zinc-500">
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
                className="resize-none border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-zinc-500"
              />
              <p className="text-right text-xs text-zinc-600">{data.recap.length}/2000</p>
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
                className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-zinc-500"
              />
              {errors.audioLink && (
                <p className="text-xs text-red-400">{errors.audioLink}</p>
              )}
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
