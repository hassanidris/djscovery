"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createDjProfile,
  getCitiesByCountry,
  getOrCreateGenre,
} from "@/lib/actions/profile";
import { getGenres } from "@/lib/actions/genre";
import { uploadDjMediaTemp } from "@/lib/actions/dj-upload";
import {
  Camera,
  Plus,
  Trash2,
  Loader2,
  X,
  Check,
  Image as ImageIcon,
  Video,
  Mic,
} from "lucide-react";
import { DJ_TYPES } from "@/config/dj-types";
import { CURRENCIES } from "@/config/currencies";
import {
  CreateDjProfileSchema,
  CreateDjProfileInput,
} from "@/lib/validations/dj-profile";

type Genre = { id: number; name: string };
type Country = { id: number; name: string; code: string };
type City = { id: number; name: string };

const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "spotify", label: "Spotify" },
  { value: "soundcloud", label: "SoundCloud" },
  { value: "mixcloud", label: "Mixcloud" },
  { value: "website", label: "Website" },
];

const COUNTRY_CURRENCIES: Record<string, string> = {
  Sweden: "SEK",
  "United Kingdom": "GBP",
  "United States": "USD",
  Germany: "EUR",
  France: "EUR",
  Spain: "EUR",
  Italy: "EUR",
  Netherlands: "EUR",
  Belgium: "EUR",
  Portugal: "EUR",
  Austria: "EUR",
  Switzerland: "CHF",
  Norway: "NOK",
  Denmark: "DKK",
  Finland: "EUR",
  Poland: "PLN",
  "Czech Republic": "CZK",
  Hungary: "HUF",
  Romania: "RON",
  Turkey: "TRY",
  Russia: "RUB",
  Ukraine: "UAH",
  Australia: "AUD",
  "New Zealand": "NZD",
  Canada: "CAD",
  Mexico: "MXN",
  Brazil: "BRL",
  Argentina: "ARS",
  Colombia: "COP",
  Chile: "CLP",
  "South Africa": "ZAR",
  Nigeria: "NGN",
  Kenya: "KES",
  Ghana: "GHS",
  Egypt: "EGP",
  Morocco: "MAD",
  "Saudi Arabia": "SAR",
  "United Arab Emirates": "AED",
  Qatar: "QAR",
  Kuwait: "KWD",
  Bahrain: "BHD",
  Israel: "ILS",
  India: "INR",
  Pakistan: "PKR",
  Bangladesh: "BDT",
  Japan: "JPY",
  China: "CNY",
  "South Korea": "KRW",
  Singapore: "SGD",
  Malaysia: "MYR",
  Indonesia: "IDR",
  Thailand: "THB",
  Philippines: "PHP",
  Vietnam: "VND",
  Lebanon: "LBP",
  Jordan: "JOD",
  Iraq: "IQD",
  Somalia: "SOS",
};

interface BecomeDjFormProps {
  countries: Country[];
  userId: string;
}

const inputCls =
  "bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red transition-all w-full";
const labelCls = "text-sm text-gray-300 font-medium";
const sectionCls =
  "bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4 w-full";
const sectionTitleCls =
  "text-base font-semibold text-white border-b border-white/10 pb-3 mb-1";

export default function BecomeDjForm({ countries, userId }: BecomeDjFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateDjProfileInput>({
    resolver: zodResolver(CreateDjProfileSchema),
    defaultValues: {
      stageName: "",
      bio: "",
      experienceYears: undefined,
      feeMin: undefined,
      feeMax: undefined,
      feeCurrency: "",
      bookingEmail: "",
      bookingPhone: "",
      countryId: 0,
      cityId: 0,
      djTypes: [],
      genreNames: [],
      socialLinks: [{ platform: "instagram", url: "" }],
      media: [],
    },
  });

  // Watch values for derived state (useWatch is memoizable for React Compiler)
  const stageName = useWatch({ control, name: "stageName" });
  const experienceYears = useWatch({ control, name: "experienceYears" });
  const feeMin = useWatch({ control, name: "feeMin" });
  const feeMax = useWatch({ control, name: "feeMax" });
  const feeCurrency = useWatch({ control, name: "feeCurrency" });
  const bookingEmail = useWatch({ control, name: "bookingEmail" });
  const bookingPhone = useWatch({ control, name: "bookingPhone" });
  const countryId = useWatch({ control, name: "countryId" });
  const cityId = useWatch({ control, name: "cityId" });
  const djTypes = useWatch({ control, name: "djTypes" });
  const genreNames = useWatch({ control, name: "genreNames" });
  const socialLinks = useWatch({ control, name: "socialLinks" });
  const bio = useWatch({ control, name: "bio" });

  // Avatar (file upload - not in form schema)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Cover image (file upload - not in form schema)
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Location cities
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const cityRequestId = useRef(0);

  // Genres
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [newGenreInput, setNewGenreInput] = useState("");
  const [addingGenre, setAddingGenre] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  // Fetch genres on mount
  useEffect(() => {
    getGenres().then(setAvailableGenres);
  }, []);

  // Optional media (not in form schema)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [audioLinks, setAudioLinks] = useState<string[]>([]);

  const slugPreview =
    stageName.length > 0
      ? stageName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .slice(0, 60)
      : "";

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Avatar must be a JPG, PNG, or WEBP file.");
      setAvatarFile(null);
      setAvatarPreview(null);
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar must be 5 MB or smaller.");
      setAvatarFile(null);
      setAvatarPreview(null);
      e.target.value = "";
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Cover image must be a JPG, PNG, or WEBP file.");
      setCoverFile(null);
      setCoverPreview(null);
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image must be 10 MB or smaller.");
      setCoverFile(null);
      setCoverPreview(null);
      e.target.value = "";
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleCountryChange(id: number) {
    setValue("countryId", id || 0);
    setValue("cityId", 0);
    setCities([]);

    // Auto-set currency based on selected country (with USD fallback)
    if (id && countries.length > 0) {
      const selectedCountry = countries.find((c) => c.id === id);
      if (selectedCountry) {
        const mappedCurrency = COUNTRY_CURRENCIES[selectedCountry.name];
        const availableCodes = new Set(CURRENCIES.map((c) => c.code));
        const currency =
          mappedCurrency && availableCodes.has(mappedCurrency)
            ? mappedCurrency
            : "USD";
        setValue("feeCurrency", currency);
      }
    }

    if (!id) return;
    const requestId = ++cityRequestId.current;
    setLoadingCities(true);
    try {
      const result = await getCitiesByCountry(id);
      if (requestId === cityRequestId.current) {
        setCities(result);
      }
    } finally {
      if (requestId === cityRequestId.current) {
        setLoadingCities(false);
      }
    }
  }

  // Filter genres for dropdown
  const filteredGenres = availableGenres
    .filter((g) => {
      if (!newGenreInput.trim()) return true;
      const norm = g.toLowerCase().replace(/[^a-z0-9]/g, "");
      const inputNorm = newGenreInput.toLowerCase().replace(/[^a-z0-9]/g, "");
      return (
        norm.includes(inputNorm) ||
        g.toLowerCase().includes(newGenreInput.toLowerCase())
      );
    })
    .filter((g) => !genreNames.includes(g))
    .slice(0, 10);

  function toggleGenre(name: string) {
    const current = genreNames;
    if (current.includes(name)) {
      setValue(
        "genreNames",
        current.filter((g) => g !== name),
      );
    } else if (current.length < 5) {
      setValue("genreNames", [...current, name]);
    }
  }

  async function handleAddGenre() {
    const name = newGenreInput.trim();
    if (!name) return;
    setAddingGenre(true);
    try {
      const genre = await getOrCreateGenre(name);
      setAvailableGenres((prev) =>
        prev.includes(genre.name)
          ? prev
          : [...prev, genre.name].sort((a, b) => a.localeCompare(b)),
      );
      if (genreNames.length < 5 && !genreNames.includes(genre.name)) {
        setValue("genreNames", [...genreNames, genre.name]);
      }
      setNewGenreInput("");
    } catch {
      // silently ignore — genre may already exist
    }
    setAddingGenre(false);
  }

  function addSocialLink() {
    setValue("socialLinks", [
      ...socialLinks,
      { platform: "instagram", url: "" },
    ]);
  }

  function removeSocialLink(i: number) {
    setValue(
      "socialLinks",
      socialLinks.filter((_, idx) => idx !== i),
    );
  }

  function updateSocialLink(i: number, key: "platform" | "url", value: string) {
    setValue(
      "socialLinks",
      socialLinks.map((link, idx) =>
        idx === i ? { ...link, [key]: value } : link,
      ),
    );
  }

  async function uploadFile(
    file: File,
    type: "avatar" | "gallery" | "cover",
  ): Promise<{ url: string; path: string; bucket: string }> {
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadDjMediaTemp(fd, type);
    if ("error" in result) throw new Error(result.error);
    return result;
  }

  async function onSubmit(data: CreateDjProfileInput) {
    startTransition(async () => {
      const toastId = toast.loading("Preparing your profile...");
      const uploadedPaths: { path: string; bucket: string }[] = [];

      async function cleanupUploads() {
        if (uploadedPaths.length === 0) return;
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const byBucket = uploadedPaths.reduce<Record<string, string[]>>(
          (acc, { path, bucket }) => {
            (acc[bucket] ??= []).push(path);
            return acc;
          },
          {},
        );
        await Promise.all(
          Object.entries(byBucket).map(([bucket, paths]) =>
            supabase.storage.from(bucket).remove(paths),
          ),
        );
      }

      try {
        let avatarUrl: string | undefined;
        if (avatarFile) {
          toast.loading("Uploading avatar...", { id: toastId });
          const uploaded = await uploadFile(avatarFile, "avatar");
          uploadedPaths.push({ path: uploaded.path, bucket: uploaded.bucket });
          avatarUrl = uploaded.url;
        }

        let coverImageUrl: string | undefined;
        if (coverFile) {
          toast.loading("Uploading cover image...", { id: toastId });
          const uploaded = await uploadFile(coverFile, "cover");
          uploadedPaths.push({ path: uploaded.path, bucket: uploaded.bucket });
          coverImageUrl = uploaded.url;
        }

        const media: {
          type: "IMAGE" | "VIDEO" | "AUDIO";
          url: string;
          path: string;
          bucket: string;
        }[] = [];

        for (let i = 0; i < galleryFiles.length; i++) {
          toast.loading(
            `Uploading image ${i + 1} of ${galleryFiles.length}...`,
            { id: toastId },
          );
          const m = await uploadFile(galleryFiles[i], "gallery");
          uploadedPaths.push({ path: m.path, bucket: m.bucket });
          media.push({ type: "IMAGE", ...m });
        }

        for (const url of videoLinks.filter((u) => u.trim())) {
          media.push({ type: "VIDEO", url, path: url, bucket: "external" });
        }

        for (const url of audioLinks.filter((u) => u.trim())) {
          media.push({ type: "AUDIO", url, path: url, bucket: "external" });
        }

        toast.loading("Saving your profile...", { id: toastId });

        const result = await createDjProfile({
          stageName: data.stageName.trim(),
          bio: data.bio?.trim() || undefined,
          avatarUrl,
          coverImageUrl,
          bookingEmail: data.bookingEmail?.trim() || undefined,
          bookingPhone: data.bookingPhone?.trim() || undefined,
          countryId: data.countryId,
          cityId: data.cityId,
          genreNames: data.genreNames,
          djTypes: data.djTypes,
          socialLinks: data.socialLinks.filter((l) => l.url.trim()),
          media,
        });

        if (result && "error" in result) {
          await cleanupUploads();
          toast.error(result.error, { id: toastId });
          return;
        }

        if (result && "success" in result) {
          toast.success("Profile created! Pending admin review. 🎛️", {
            id: toastId,
          });
          router.push("/");
        }
      } catch (error) {
        await cleanupUploads();
        toast.error(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
          { id: toastId },
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-6"
    >
      {/* ── Avatar ── */}
      <div className={sectionCls}>
        <h2 className={sectionTitleCls}>Profile Photo</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <label className="hover:border-h_red relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/30 bg-white/10 transition-all">
            {avatarPreview ? (
              <img
                src={avatarPreview.startsWith("blob:") ? avatarPreview : ""}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-8 w-8 text-gray-500" />
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </label>
          <div>
            <p className="text-sm text-gray-300">Upload your DJ photo</p>
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG or WEBP · Max 5 MB
            </p>
            {avatarFile && (
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="text-h_red mt-2 flex items-center gap-1 text-xs hover:underline"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Cover Image ── */}
      <div className={sectionCls}>
        <h2 className={sectionTitleCls}>
          Cover Image{" "}
          <span className="text-sm font-normal text-gray-500">(optional)</span>
        </h2>
        <p className="-mt-2 text-xs text-gray-400">
          A banner image for your profile header.
        </p>

        <div className="flex flex-col items-start gap-4">
          <label className="hover:border-h_red relative flex h-32 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-white/30 bg-white/10 transition-all">
            {coverPreview ? (
              <img
                src={coverPreview.startsWith("blob:") ? coverPreview : ""}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-8 w-8 text-gray-500" />
                <span className="text-xs text-gray-500">
                  16:9 ratio recommended
                </span>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleCoverChange}
            />
          </label>
          <div>
            <p className="text-sm text-gray-300">Upload cover image</p>
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG or WEBP · Max 10 MB
            </p>
            {coverFile && (
              <button
                type="button"
                onClick={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                }}
                className="text-h_red mt-2 flex items-center gap-1 text-xs hover:underline"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Basic Info ── */}
      <div className={sectionCls}>
        <h2 className={sectionTitleCls}>Basic Info</h2>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            DJ Stage Name <span className="text-h_red">*</span>
          </label>
          <input
            {...register("stageName")}
            type="text"
            placeholder="e.g. DJ Echo"
            className={inputCls}
          />
          {errors.stageName && (
            <p className="text-xs text-red-400">{errors.stageName.message}</p>
          )}
          {slugPreview && (
            <p className="mt-0.5 text-xs text-gray-500">
              Profile URL:{" "}
              <span className="text-gray-400">
                DJcovery.com/djs/{slugPreview}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Bio</label>
          <textarea
            {...register("bio")}
            placeholder="Tell fans about yourself, your style, your influences..."
            rows={4}
            className={`${inputCls} resize-none`}
          />
          <p className="text-right text-xs text-gray-600">
            {bio?.length || 0}/500
          </p>
        </div>
      </div>

      {/* ── DJ Type ── */}
      <div
        className={`${sectionCls} ${errors.djTypes ? "border-red-500/40" : ""}`}
      >
        <h2 className={sectionTitleCls}>
          DJ Type <span className="text-h_red">*</span>
        </h2>
        <p className="-mt-2 text-xs text-gray-400">
          Select all that apply — this will be used for search filters.
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DJ_TYPES.map((t) => {
            const checked = djTypes.includes(t.value);
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  const current = djTypes;
                  if (current.includes(t.value)) {
                    setValue(
                      "djTypes",
                      current.filter((type) => type !== t.value),
                    );
                  } else {
                    setValue("djTypes", [...current, t.value]);
                  }
                }}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                  checked
                    ? "bg-h_red/15 border-h_red text-white"
                    : "border-white/15 bg-white/5 text-gray-400 hover:border-white/30 hover:text-gray-200"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                    checked ? "bg-h_red border-h_red" : "border-white/30"
                  }`}
                >
                  {checked && <Check className="h-3 w-3 text-white" />}
                </span>
                <span>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {errors.djTypes && (
          <p className="-mt-1 text-xs text-red-400">{errors.djTypes.message}</p>
        )}
      </div>

      {/* ── Genres ── */}
      <div
        className={`${sectionCls} ${errors.genreNames ? "border-red-500/40" : ""}`}
      >
        <div className="mb-1 flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base font-semibold text-white">
            Genres <span className="text-h_red">*</span>
          </h2>
          <span
            className={`text-xs font-medium ${genreNames.length >= 5 ? "text-amber-400" : "text-gray-500"}`}
          >
            {genreNames.length}/5
          </span>
        </div>
        <p className="-mt-2 text-xs text-gray-400">
          Select up to 5 genres that apply to your style.
        </p>

        {/* Selected genres */}
        <div className="flex flex-wrap gap-2">
          {genreNames.map((genre) => (
            <span
              key={genre}
              className="border-h_red bg-h_red/20 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium text-white"
            >
              {genre}
              <button
                type="button"
                onClick={() => toggleGenre(genre)}
                className="ml-1 hover:text-gray-300"
                aria-label={`Remove ${genre}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {errors.genreNames && (
          <p className="-mt-2 text-xs text-red-400">
            {errors.genreNames.message}
          </p>
        )}

        <div className="relative">
          <input
            type="text"
            value={newGenreInput}
            onChange={(e) => {
              setNewGenreInput(e.target.value);
              setShowGenreDropdown(e.target.value.length > 0);
            }}
            onFocus={() => setShowGenreDropdown(newGenreInput.length > 0)}
            onBlur={() => setTimeout(() => setShowGenreDropdown(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddGenre();
              }
            }}
            placeholder={
              genreNames.length >= 5 ? "Max 5 genres reached" : "Add a genre..."
            }
            maxLength={50}
            disabled={genreNames.length >= 5}
            className="focus:ring-h_red w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 ring-1 ring-white/20 transition-all outline-none disabled:opacity-40"
          />
          {showGenreDropdown && filteredGenres.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-white/20 bg-[#1a1a1a] shadow-lg">
              {filteredGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    toggleGenre(genre);
                    setNewGenreInput("");
                    setShowGenreDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="-mt-1 text-xs text-gray-600">
          New genres are saved to the database and will appear for future DJs.
        </p>
      </div>

      {/* ── Location ── */}
      <div
        className={`${sectionCls} ${errors.countryId || errors.cityId ? "border-red-500/40" : ""}`}
      >
        <h2 className={sectionTitleCls}>Location</h2>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            Country <span className="text-h_red">*</span>
          </label>
          <select
            {...register("countryId", { valueAsNumber: true })}
            onChange={(e) => handleCountryChange(Number(e.target.value))}
            className={`${inputCls} cursor-pointer appearance-none`}
          >
            <option value="0">Select a country...</option>
            {countries.map((c) => (
              <option
                key={c.id}
                value={c.id}
                className="bg-[#1a1a1a] text-white"
              >
                {c.name}
              </option>
            ))}
          </select>
          {errors.countryId && (
            <p className="mt-1 text-xs text-red-400">
              {errors.countryId.message}
            </p>
          )}
        </div>

        {countryId > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              City <span className="text-h_red">*</span>
            </label>
            {loadingCities ? (
              <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading cities...
              </div>
            ) : (
              <select
                {...register("cityId", { valueAsNumber: true })}
                className={`${inputCls} cursor-pointer appearance-none ${errors.cityId ? "ring-red-500/50" : ""}`}
              >
                <option value="0">Select a city...</option>
                {cities.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    className="bg-[#1a1a1a] text-white"
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            {errors.cityId && (
              <p className="mt-1 text-xs text-red-400">
                {errors.cityId.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Social Media ── */}
      <div
        className={`${sectionCls} ${errors.socialLinks ? "border-red-500/40" : ""}`}
      >
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleCls}>
            Social Media <span className="text-h_red">*</span>
          </h2>
        </div>

        {socialLinks.length === 0 && (
          <p className="-mt-2 text-xs text-gray-500">
            Add at least one link so fans can find you.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {socialLinks.map((link, i) => (
            <div key={i} className="flex min-w-0 items-center gap-2">
              <select
                value={link.platform}
                onChange={(e) =>
                  updateSocialLink(i, "platform", e.target.value)
                }
                className="focus:ring-h_red w-36 shrink-0 cursor-pointer appearance-none rounded-lg bg-white/10 px-3 py-3 text-sm text-white ring-1 ring-white/20 transition-all outline-none"
              >
                {SOCIAL_PLATFORMS.map((p) => (
                  <option
                    key={p.value}
                    value={p.value}
                    className="bg-[#1a1a1a]"
                  >
                    {p.label}
                  </option>
                ))}
              </select>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                placeholder="https://..."
                className="focus:ring-h_red min-w-0 flex-1 rounded-lg bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 ring-1 ring-white/20 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => removeSocialLink(i)}
                className="shrink-0 rounded-lg bg-white/5 p-3 text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {errors.socialLinks && (
          <p className="-mt-2 text-xs text-red-400">
            {errors.socialLinks.message}
          </p>
        )}

        <button
          type="button"
          onClick={addSocialLink}
          className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-2.5 text-sm text-gray-400 transition-all hover:border-white/40 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Add social link
        </button>
      </div>

      {/* ── Experience ── */}
      <div className={sectionCls}>
        <h2 className={sectionTitleCls}>
          Experience{" "}
          <span className="text-sm font-normal text-gray-500">(optional)</span>
        </h2>
        <p className="-mt-2 text-xs text-gray-400">
          Help organizers understand your background and skill level.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Years of Experience</label>
            <input
              {...register("experienceYears", {
                setValueAs: (v) =>
                  v === "" || isNaN(Number(v)) ? undefined : Number(v),
              })}
              type="number"
              min="0"
              max="50"
              placeholder="e.g. 5"
              className={inputCls}
            />
            {errors.experienceYears && (
              <p className="text-xs text-red-400">
                {errors.experienceYears.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Fee/Pricing ── */}
      <div className={sectionCls}>
        <h2 className={sectionTitleCls}>
          Fee/Pricing{" "}
          <span className="text-sm font-normal text-gray-500">(optional)</span>
        </h2>
        <p className="-mt-2 text-xs text-gray-400">
          Set your booking fee range. Currency auto-detected from your country.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Minimum Fee</label>
            <input
              {...register("feeMin", {
                setValueAs: (v) =>
                  v === "" || isNaN(Number(v)) ? undefined : Number(v),
              })}
              type="number"
              min="0"
              placeholder="e.g. 500"
              className={inputCls}
            />
            {errors.feeMin && (
              <p className="text-xs text-red-400">{errors.feeMin.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Maximum Fee</label>
            <input
              {...register("feeMax", {
                setValueAs: (v) =>
                  v === "" || isNaN(Number(v)) ? undefined : Number(v),
              })}
              type="number"
              min="0"
              placeholder="e.g. 2000"
              className={inputCls}
            />
            {errors.feeMax && (
              <p className="text-xs text-red-400">{errors.feeMax.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Currency</label>
            <select
              {...register("feeCurrency")}
              className={`${inputCls} cursor-pointer appearance-none`}
            >
              <option value="">Select currency...</option>
              {CURRENCIES.map((currency) => (
                <option
                  key={currency.code}
                  value={currency.code}
                  className="bg-[#1a1a1a] text-white"
                >
                  {currency.code} ({currency.symbol})
                </option>
              ))}
            </select>
            {errors.feeCurrency && (
              <p className="text-xs text-red-400">
                {errors.feeCurrency.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Contact Information ── */}
      <div className={sectionCls}>
        <h2 className={sectionTitleCls}>
          Contact Information{" "}
          <span className="text-sm font-normal text-gray-500">(optional)</span>
        </h2>
        <p className="-mt-2 text-xs text-gray-400">
          How organizers can reach you for bookings.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Booking Email</label>
            <input
              {...register("bookingEmail", {
                setValueAs: (v) => (v?.trim() ? v.trim() : undefined),
              })}
              type="email"
              placeholder="bookings@yourname.com"
              className={inputCls}
            />
            {errors.bookingEmail && (
              <p className="text-xs text-red-400">
                {errors.bookingEmail.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Booking Phone</label>
            <input
              {...register("bookingPhone")}
              type="tel"

              placeholder="+44 7700 900123"
              className={inputCls}
            />
            {errors.bookingPhone && (
              <p className="text-xs text-red-400">
                {errors.bookingPhone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Optional Media ── */}
      <div className={sectionCls}>
        <h2 className={sectionTitleCls}>
          Media{" "}
          <span className="text-sm font-normal text-gray-500">(optional)</span>
        </h2>
        <p className="-mt-2 text-xs text-gray-400">
          Showcase your work — photos, video sets, and audio samples.
        </p>

        <MediaUploadSection
          label="Gallery Images"
          icon={<ImageIcon className="h-4 w-4" />}
          accept="image/*"
          hint="JPG, PNG, WEBP"
          files={galleryFiles}
          onAdd={(files) => setGalleryFiles((prev) => [...prev, ...files])}
          onRemove={(i) =>
            setGalleryFiles((prev) => prev.filter((_, idx) => idx !== i))
          }
        />

        <div className="border-t border-white/5 pt-4">
          <LinkInputSection
            label="Video Links"
            icon={<Video className="h-4 w-4" />}
            placeholder="https://youtube.com/watch?v=..."
            hint="YouTube, Vimeo, TikTok, Instagram, Facebook"
            links={videoLinks}
            onChange={setVideoLinks}
          />
        </div>

        <div className="border-t border-white/5 pt-4">
          <LinkInputSection
            label="Audio Sample Links"
            icon={<Mic className="h-4 w-4" />}
            placeholder="https://soundcloud.com/..."
            hint="SoundCloud, Mixcloud, Spotify..."
            links={audioLinks}
            onChange={setAudioLinks}
          />
        </div>
      </div>

      {/* ── Approval notice ── */}
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
        <p className="text-xs leading-relaxed text-yellow-400">
          ⏳ Your profile will be <strong>pending admin approval</strong> before
          it appears publicly. You can still update your profile while waiting.
        </p>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isPending}
        className="bg-h_red hover:bg-h_redDark flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white transition-colors disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {"Creating profile..."}
          </>
        ) : (
          "Create DJ Profile"
        )}
      </button>
    </form>
  );
}

function MediaUploadSection({
  label,
  icon,
  accept,
  hint,
  files,
  onAdd,
  onRemove,
}: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  hint: string;
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-xs text-gray-600">· {hint}</span>
      </div>

      {files.length > 0 && (
        <div className="mb-1 flex flex-col gap-1.5">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-400"
            >
              <span className="max-w-xs truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="ml-3 shrink-0 text-gray-500 transition-colors hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-gray-500 transition-all hover:border-white/30 hover:text-gray-300">
        <Plus className="h-3.5 w-3.5" />
        Add {label.toLowerCase()}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          onChange={(e) => {
            const selected = Array.from(e.target.files ?? []);
            if (selected.length > 0) onAdd(selected);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function LinkInputSection({
  label,
  icon,
  placeholder,
  hint,
  links,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  hint: string;
  links: string[];
  onChange: (links: string[]) => void;
}) {
  function addLink() {
    onChange([...links, ""]);
  }

  function updateLink(i: number, value: string) {
    onChange(links.map((l, idx) => (idx === i ? value : l)));
  }

  function removeLink(i: number) {
    onChange(links.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-xs text-gray-600">· {hint}</span>
      </div>

      {links.length > 0 && (
        <div className="mb-1 flex flex-col gap-2">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
                placeholder={placeholder}
                className="focus:ring-h_red flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs text-white placeholder-gray-500 ring-1 ring-white/20 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="shrink-0 text-gray-500 transition-colors hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addLink}
        className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-gray-500 transition-all hover:border-white/30 hover:text-gray-300"
      >
        <Plus className="h-3.5 w-3.5" />
        Add link
      </button>
    </div>
  );
}
