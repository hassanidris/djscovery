"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createDjProfile,
  getCitiesByCountry,
  getOrCreateGenre,
} from "@/lib/actions/profile";
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

interface BecomeDjFormProps {
  countries: Country[];
  initialGenres: Genre[];
  userId: string;
}

const inputCls =
  "bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red transition-all w-full";
const labelCls = "text-sm text-gray-300 font-medium";
const sectionCls =
  "bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4 w-full overflow-hidden";
const sectionTitleCls =
  "text-base font-semibold text-white border-b border-white/10 pb-3 mb-1";

export default function BecomeDjForm({
  countries,
  initialGenres,
  userId,
}: BecomeDjFormProps) {
  const [isPending, startTransition] = useTransition();

  // Basic info
  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Location
  const [countryId, setCountryId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const cityRequestId = useRef(0);

  // Genres
  const [allGenres, setAllGenres] = useState<Genre[]>(initialGenres);
  const [selectedGenreIds, setSelectedGenreIds] = useState<Set<number>>(
    new Set(),
  );
  const [newGenreInput, setNewGenreInput] = useState("");
  const [addingGenre, setAddingGenre] = useState(false);

  // Social links
  const [socialLinks, setSocialLinks] = useState<
    { platform: string; url: string }[]
  >([]);

  // DJ Types
  const [selectedDjTypes, setSelectedDjTypes] = useState<Set<string>>(
    new Set(),
  );

  // Optional media
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [audioLinks, setAudioLinks] = useState<string[]>([]);

  // Form state
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    djTypes?: string;
    country?: string;
    genres?: string;
    social?: string;
  }>({});

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
      setError("Avatar must be a JPG, PNG, or WEBP file.");
      setAvatarFile(null);
      setAvatarPreview(null);
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar must be 5 MB or smaller.");
      setAvatarFile(null);
      setAvatarPreview(null);
      e.target.value = "";
      return;
    }
    setError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleCountryChange(id: number) {
    setCountryId(id || null);
    setFieldErrors((prev) => ({ ...prev, country: undefined }));
    setCityId(null);
    setCities([]);
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

  function toggleGenre(id: number) {
    setFieldErrors((prev) => ({ ...prev, genres: undefined }));
    setSelectedGenreIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  }

  async function handleAddGenre() {
    const name = newGenreInput.trim();
    if (!name) return;
    setAddingGenre(true);
    try {
      const genre = await getOrCreateGenre(name);
      setAllGenres((prev) =>
        prev.some((g) => g.id === genre.id)
          ? prev
          : [...prev, genre].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSelectedGenreIds((prev) =>
        prev.size >= 5 ? prev : new Set([...prev, genre.id]),
      );
      setNewGenreInput("");
    } catch {
      // silently ignore — genre may already exist
    }
    setAddingGenre(false);
  }

  function addSocialLink() {
    setSocialLinks((prev) => [...prev, { platform: "instagram", url: "" }]);
    setFieldErrors((prev) => ({ ...prev, social: undefined }));
  }

  function removeSocialLink(i: number) {
    setSocialLinks((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateSocialLink(i: number, key: "platform" | "url", value: string) {
    setSocialLinks((prev) =>
      prev.map((link, idx) => (idx === i ? { ...link, [key]: value } : link)),
    );
  }

  async function uploadFile(
    file: File,
    type: "avatar" | "gallery",
  ): Promise<{ url: string; path: string; bucket: string }> {
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadDjMediaTemp(fd, type);
    if ("error" in result) throw new Error(result.error);
    return result;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!stageName.trim()) {
      setError("Stage name is required.");
      return;
    }

    const fe: {
      djTypes?: string;
      country?: string;
      genres?: string;
      social?: string;
    } = {};
    if (selectedDjTypes.size === 0) fe.djTypes = "Select at least one DJ type.";
    if (!countryId) fe.country = "Country is required.";
    if (selectedGenreIds.size === 0) fe.genres = "Select at least one genre.";
    if (socialLinks.filter((l) => l.url.trim()).length === 0)
      fe.social = "Add at least one social media link.";
    if (Object.keys(fe).length > 0) {
      setFieldErrors(fe);
      setError("Please fill in all required fields.");
      return;
    }

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
          stageName: stageName.trim(),
          bio: bio.trim() || undefined,
          avatarUrl,
          countryId: countryId ?? undefined,
          cityId: cityId ?? undefined,
          genreIds: Array.from(selectedGenreIds),
          djTypes: Array.from(selectedDjTypes),
          socialLinks: socialLinks.filter((l) => l.url.trim()),
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
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6 overflow-hidden"
    >
      {/* ── Avatar ── */}
      <div className={sectionCls}>
        <h2 className={sectionTitleCls}>Profile Photo</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="hover:border-h_red relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/30 bg-white/10 transition-all"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview.startsWith("blob:") ? avatarPreview : ""}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-8 w-8 text-gray-500" />
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
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

      {/* ── Basic Info ── */}
      <div className={sectionCls}>
        <h2 className={sectionTitleCls}>Basic Info</h2>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            DJ Stage Name <span className="text-h_red">*</span>
          </label>
          <input
            type="text"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            placeholder="e.g. DJ Echo"
            required
            minLength={2}
            maxLength={60}
            className={inputCls}
          />
          {slugPreview && (
            <p className="mt-0.5 text-xs text-gray-500">
              Profile URL:{" "}
              <span className="text-gray-400">
                djscovery.com/djs/{slugPreview}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            Bio <span className="text-h_red">*</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell fans about yourself, your style, your influences..."
            rows={4}
            maxLength={500}
            className={`${inputCls} resize-none`}
          />
          <p className="text-right text-xs text-gray-600">{bio.length}/500</p>
        </div>
      </div>

      {/* ── DJ Type ── */}
      <div
        className={`${sectionCls} ${fieldErrors.djTypes ? "border-red-500/40" : ""}`}
      >
        <h2 className={sectionTitleCls}>
          DJ Type <span className="text-h_red">*</span>
        </h2>
        <p className="-mt-2 text-xs text-gray-400">
          Select all that apply — this will be used for search filters.
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DJ_TYPES.map((t) => {
            const checked = selectedDjTypes.has(t.value);
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setFieldErrors((prev) => ({ ...prev, djTypes: undefined }));
                  setSelectedDjTypes((prev) => {
                    const next = new Set(prev);
                    if (next.has(t.value)) next.delete(t.value);
                    else next.add(t.value);
                    return next;
                  });
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

        {fieldErrors.djTypes && (
          <p className="-mt-1 text-xs text-red-400">{fieldErrors.djTypes}</p>
        )}
      </div>

      {/* ── Location ── */}
      <div
        className={`${sectionCls} ${fieldErrors.country ? "border-red-500/40" : ""}`}
      >
        <h2 className={sectionTitleCls}>Location</h2>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            Country <span className="text-h_red">*</span>
          </label>
          <select
            value={countryId ?? ""}
            onChange={(e) => handleCountryChange(Number(e.target.value))}
            className={`${inputCls} cursor-pointer appearance-none`}
          >
            <option value="">Select a country...</option>
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
          {fieldErrors.country && (
            <p className="mt-1 text-xs text-red-400">{fieldErrors.country}</p>
          )}
        </div>

        {countryId && (
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              City <span className="font-normal text-gray-500">(optional)</span>
            </label>
            {loadingCities ? (
              <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading cities...
              </div>
            ) : (
              <select
                value={cityId ?? ""}
                onChange={(e) =>
                  setCityId(e.target.value ? Number(e.target.value) : null)
                }
                className={`${inputCls} cursor-pointer appearance-none`}
              >
                <option value="">Select a city...</option>
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
          </div>
        )}
      </div>

      {/* ── Genres ── */}
      <div
        className={`${sectionCls} ${fieldErrors.genres ? "border-red-500/40" : ""}`}
      >
        <div className="mb-1 flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base font-semibold text-white">
            Genres <span className="text-h_red">*</span>
          </h2>
          <span
            className={`text-xs font-medium ${selectedGenreIds.size >= 5 ? "text-amber-400" : "text-gray-500"}`}
          >
            {selectedGenreIds.size}/5
          </span>
        </div>
        <p className="-mt-2 text-xs text-gray-400">
          Select up to 5 genres that apply to your style.
        </p>

        <div className="flex flex-wrap gap-2">
          {allGenres.map((genre) => {
            const selected = selectedGenreIds.has(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleGenre(genre.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                  selected
                    ? "bg-h_red/20 border-h_red text-white"
                    : "border-white/20 bg-white/5 text-gray-400 hover:border-white/40 hover:text-gray-200"
                }`}
              >
                {selected && <Check className="h-3 w-3" />}
                {genre.name}
              </button>
            );
          })}
        </div>

        {fieldErrors.genres && (
          <p className="-mt-2 text-xs text-red-400">{fieldErrors.genres}</p>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newGenreInput}
            onChange={(e) => setNewGenreInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddGenre();
              }
            }}
            placeholder={
              selectedGenreIds.size >= 5
                ? "Max 5 genres reached"
                : "Not in the list? Add e.g. Cumbia..."
            }
            maxLength={50}
            disabled={selectedGenreIds.size >= 5}
            className="focus:ring-h_red flex-1 rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 ring-1 ring-white/20 transition-all outline-none disabled:opacity-40"
          />
          <button
            type="button"
            onClick={handleAddGenre}
            disabled={
              !newGenreInput.trim() || addingGenre || selectedGenreIds.size >= 5
            }
            className="bg-h_red hover:bg-h_redDark flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
          >
            {addingGenre ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add
          </button>
        </div>
        <p className="-mt-1 text-xs text-gray-600">
          New genres are saved to the database and will appear for future DJs.
        </p>
      </div>

      {/* ── Social Media ── */}
      <div
        className={`${sectionCls} ${fieldErrors.social ? "border-red-500/40" : ""}`}
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
            <div key={i} className="flex items-center gap-2">
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
                className="focus:ring-h_red flex-1 rounded-lg bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 ring-1 ring-white/20 transition-all outline-none"
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

        {fieldErrors.social && (
          <p className="-mt-2 text-xs text-red-400">{fieldErrors.social}</p>
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

      {/* ── Error ── */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

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

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-gray-500 transition-all hover:border-white/30 hover:text-gray-300"
      >
        <Plus className="h-3.5 w-3.5" />
        Add {label.toLowerCase()}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          if (selected.length > 0) onAdd(selected);
          e.target.value = "";
        }}
      />
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
