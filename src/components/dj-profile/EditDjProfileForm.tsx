"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { X, Plus, Loader2, Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { updateDjProfile, getCitiesByCountry } from "@/lib/actions/profile";
import {
  uploadDjAvatar,
  uploadDjCover,
  uploadDjGalleryImage,
  deleteGalleryImage,
} from "@/lib/actions/dj-upload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Country = { id: number; name: string };
type City = { id: number; name: string };
type GalleryImage = { id: number; url: string; path: string; bucket: string };

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

const SOCIAL_PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "soundcloud",
  "spotify",
  "apple",
  "website",
  "anghami",
] as const;

const DJ_TYPE_LABELS: Record<string, string> = {
  CLUB: "Club Night",
  WEDDING: "Wedding",
  FESTIVAL: "Festival",
  CORPORATE: "Corporate Event",
  BAR_LOUNGE: "Bar / Lounge",
};

interface ProfileData {
  stageName: string;
  bio: string;
  avatar: string;
  coverImage: string;
  countryId: number | null;
  cityId: number | null;
  countryName: string;
  cityName: string;
  genres: string[];
  djTypes: string[];
  socialLinks: { platform: string; url: string }[];
  bookingEmail: string;
  bookingPhone: string;
  feeMin: number | null;
  feeMax: number | null;
  feeCurrency: string;
  slug: string;
}

interface Props {
  profile: ProfileData;
  countries: Country[];
  initialCities: City[];
  userId: string;
  galleryImages: GalleryImage[];
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-h_blackLight/40 gap-0 border-white/8 p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
      <Separator className="mb-5 bg-white/8" />
      {children}
    </Card>
  );
}

export default function EditDjProfileForm({
  profile,
  countries,
  initialCities,
  userId,
  galleryImages,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [stageName, setStageName] = useState(profile.stageName);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar);
  const [coverImageUrl, setCoverImageUrl] = useState(profile.coverImage);
  const [countryId, setCountryId] = useState<number | null>(profile.countryId);
  const [cityId, setCityId] = useState<number | null>(profile.cityId);
  const [cities, setCities] = useState<City[]>(initialCities);
  const [genreNames, setGenreNames] = useState<string[]>(profile.genres);
  const [genreInput, setGenreInput] = useState("");
  const [djTypes, setDjTypes] = useState<string[]>(profile.djTypes);
  const [socialLinks, setSocialLinks] = useState<
    { platform: string; url: string }[]
  >(
    profile.socialLinks.length > 0
      ? profile.socialLinks
      : [{ platform: "instagram", url: "" }],
  );
  const [bookingEmail, setBookingEmail] = useState(profile.bookingEmail);
  const [bookingPhone, setBookingPhone] = useState(profile.bookingPhone);
  const [feeMin, setFeeMin] = useState(
    profile.feeMin !== null ? String(profile.feeMin) : "",
  );
  const [feeMax, setFeeMax] = useState(
    profile.feeMax !== null ? String(profile.feeMax) : "",
  );
  const [feeCurrency, setFeeCurrency] = useState(profile.feeCurrency || "USD");
  const [currencyAutoSet, setCurrencyAutoSet] = useState(
    !profile.feeCurrency || profile.feeCurrency === "USD",
  );
  const [submitted, setSubmitted] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [gallery, setGallery] = useState<GalleryImage[]>(galleryImages);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const isDirty =
    stageName !== profile.stageName ||
    bio !== profile.bio ||
    avatarUrl !== profile.avatar ||
    coverImageUrl !== profile.coverImage ||
    countryId !== profile.countryId ||
    cityId !== profile.cityId ||
    bookingEmail !== profile.bookingEmail ||
    bookingPhone !== profile.bookingPhone ||
    feeMin !== (profile.feeMin !== null ? String(profile.feeMin) : "") ||
    feeMax !== (profile.feeMax !== null ? String(profile.feeMax) : "") ||
    feeCurrency !== (profile.feeCurrency || "USD") ||
    JSON.stringify([...genreNames].sort()) !==
      JSON.stringify([...profile.genres].sort()) ||
    JSON.stringify([...djTypes].sort()) !==
      JSON.stringify([...profile.djTypes].sort()) ||
    JSON.stringify(socialLinks) !== JSON.stringify(profile.socialLinks);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function handleBack() {
    if (isDirty) {
      setShowLeaveAlert(true);
    } else {
      router.push(`/djs/${profile.slug}`);
    }
  }

  const stageNameError = stageName.trim().length < 2;
  const genresError = genreNames.length === 0;
  const djTypesError = djTypes.length === 0;
  const countryError = !countryId;
  const canSave =
    !stageNameError && !genresError && !djTypesError && !countryError;

  useEffect(() => {
    if (!countryId) {
      setCities([]);
      setCityId(null);
      return;
    }
    getCitiesByCountry(countryId).then((result) => {
      setCities(result ?? []);
    });
    const selectedCountry = countries.find((c) => c.id === countryId);
    if (selectedCountry && currencyAutoSet) {
      const mapped = COUNTRY_CURRENCIES[selectedCountry.name];
      if (mapped) setFeeCurrency(mapped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId]);

  function addGenre() {
    const trimmed = genreInput.trim();
    if (trimmed && !genreNames.includes(trimmed)) {
      setGenreNames((prev) => [...prev, trimmed]);
    }
    setGenreInput("");
  }

  function removeGenre(name: string) {
    setGenreNames((prev) => prev.filter((g) => g !== name));
  }

  function toggleDjType(type: string) {
    setDjTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  function addSocialLink() {
    setSocialLinks((prev) => [...prev, { platform: "instagram", url: "" }]);
  }

  function removeSocialLink(index: number) {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSocialLink(
    index: number,
    field: "platform" | "url",
    value: string,
  ) {
    setSocialLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  }

  async function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadDjAvatar(fd);
      if ("error" in result) throw new Error(result.error);
      setAvatarUrl(result.url);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleCoverChange(file: File | undefined) {
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadDjCover(fd);
      if ("error" in result) throw new Error(result.error);
      setCoverImageUrl(result.url);
      toast.success("Cover image updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handleGalleryUpload(file: File | undefined) {
    if (!file) return;
    setIsUploadingGallery(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadDjGalleryImage(fd);
      if ("error" in result) throw new Error(result.error);
      setGallery((prev) => [result, ...prev]);
      toast.success("Photo added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingGallery(false);
    }
  }

  async function handleGalleryDelete(item: GalleryImage) {
    const toastId = toast.loading("Removing photo...");
    const result = await deleteGalleryImage(item.id);
    if ("error" in result) {
      toast.error(result.error, { id: toastId });
      return;
    }
    setGallery((prev) => prev.filter((g) => g.id !== item.id));
    toast.success("Photo removed", { id: toastId });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (isUploadingAvatar || isUploadingCover || isUploadingGallery) return;
    if (!canSave) return;
    const toastId = toast.loading("Saving profile...");

    startTransition(async () => {
      const validLinks = socialLinks.filter((l) => l.platform && l.url.trim());
      const result = await updateDjProfile({
        stageName: stageName.trim() || undefined,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl || null,
        coverImageUrl: coverImageUrl || null,
        countryId,
        cityId,
        genreNames: genreNames.filter(Boolean),
        djTypes: djTypes as (
          | "CLUB"
          | "WEDDING"
          | "FESTIVAL"
          | "CORPORATE"
          | "BAR_LOUNGE"
        )[],
        socialLinks: validLinks,
        bookingEmail: bookingEmail.trim() || null,
        bookingPhone: bookingPhone.trim() || null,
        feeMin: feeMin ? parseInt(feeMin, 10) : null,
        feeMax: feeMax ? parseInt(feeMax, 10) : null,
        feeCurrency: feeCurrency || null,
      });

      if ("error" in result) {
        toast.error(result.error, { id: toastId });
      } else {
        toast.success("Profile updated!", { id: toastId });
        const targetSlug = result.newSlug ?? profile.slug;
        router.push(`/djs/${targetSlug}`);
        router.refresh();
      }
    });
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="text-gray-400 transition-colors hover:text-white"
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Update your DJ profile information
          </p>
        </div>
        {isDirty && (
          <span className="text-xs font-medium text-amber-400">
            Unsaved changes
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Profile Images */}
        <SectionCard
          title="Profile Images"
          subtitle="Your avatar and cover photo"
        >
          <div className="flex flex-col gap-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white/5 ring-2 ring-white/10">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Camera className="h-6 w-6 text-gray-600" />
                  </div>
                )}
              </div>
              <div>
                <p className="mb-0.5 text-xs font-medium text-white">
                  Profile Photo
                </p>
                <p className="mb-2 text-xs text-gray-500">
                  Shown on your profile and directory card
                </p>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleAvatarChange(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="border-white/15 text-gray-300 hover:bg-white/5"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {avatarUrl ? "Change Avatar" : "Upload Avatar"}
                </Button>
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Cover Image */}
            <div>
              <p className="mb-0.5 text-xs font-medium text-white">
                Cover Image
              </p>
              <p className="mb-3 text-xs text-gray-500">
                The banner shown at the top of your profile
              </p>
              {coverImageUrl && (
                <div className="relative mb-3 h-24 w-full overflow-hidden rounded-lg bg-white/5">
                  <Image
                    src={coverImageUrl}
                    alt="cover"
                    fill
                    className="object-cover opacity-70"
                  />
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleCoverChange(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingCover}
                onClick={() => coverInputRef.current?.click()}
                className="border-white/15 text-gray-300 hover:bg-white/5"
              >
                {isUploadingCover ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="mr-1.5 h-3.5 w-3.5" />
                )}
                {coverImageUrl ? "Change Cover" : "Upload Cover"}
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* Basic Info */}
        <SectionCard
          title="Basic Information"
          subtitle="Your stage name and biography"
        >
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-xs text-gray-300">
                  Stage Name <span className="text-h_red">*</span>
                </Label>
                <span className="text-[11px] text-gray-600">
                  Displays as{" "}
                  <span className="font-medium text-gray-400">
                    Dj {stageName.trim() || "Your Name"}
                  </span>{" "}
                  — no &ldquo;DJ&rdquo; needed
                </span>
              </div>
              <Input
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="e.g. Hassan, Tiësto, Carl Cox"
                className={`focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600 ${
                  submitted && stageNameError ? "border-red-500/60" : ""
                }`}
                maxLength={60}
              />
              {submitted && stageNameError && (
                <p className="mt-1 text-[11px] text-red-400">
                  Stage name is required (min 2 characters)
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-gray-300">
                Biography
              </Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell bookers and fans about your sound and story..."
                className="focus:border-h_red/50 min-h-28 resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                maxLength={800}
              />
              <div className="mt-1 flex items-center justify-between">
                {bio.trim().length === 0 ? (
                  <p className="text-[11px] text-amber-400/70">
                    ⚠ A bio increases your booking chances
                  </p>
                ) : bio.trim().length < 50 ? (
                  <p className="text-[11px] text-amber-400/70">
                    ⚠ Short bio — aim for 50+ characters
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-[11px] text-gray-600">{bio.length}/800</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Location */}
        <SectionCard title="Location" subtitle="Where you are based">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-xs text-gray-300">
                  Country <span className="text-h_red">*</span>
                </Label>
                {submitted && countryError && (
                  <span className="text-[11px] text-red-400">
                    Country is required
                  </span>
                )}
              </div>
              <select
                value={countryId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setCountryId(val ? Number(val) : null);
                  setCityId(null);
                }}
                className={`focus:border-h_red/50 w-full rounded-md border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none ${
                  submitted && countryError
                    ? "border-red-500/60"
                    : "border-white/10"
                }`}
              >
                <option value="" className="bg-zinc-900">
                  Select country
                </option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id} className="bg-zinc-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-gray-300">City</Label>
              <select
                value={cityId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setCityId(val ? Number(val) : null);
                }}
                disabled={!countryId || cities.length === 0}
                className="focus:border-h_red/50 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-40"
              >
                <option value="" className="bg-zinc-900">
                  {cities.length === 0 ? "Select country first" : "Select city"}
                </option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id} className="bg-zinc-900">
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-600">
                Helps bookers find local DJs
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Genres & DJ Types */}
        <SectionCard
          title="Genres & Specialties"
          subtitle="What you play and where you perform"
        >
          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-xs text-gray-300">
                  Genres <span className="text-h_red">*</span>
                </Label>
                {submitted && genresError && (
                  <span className="text-[11px] text-red-400">
                    Add at least one genre
                  </span>
                )}
              </div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {genreNames.map((g) => (
                  <span
                    key={g}
                    className="bg-h_redDark/50 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-red-200"
                  >
                    {g}
                    <button
                      type="button"
                      onClick={() => removeGenre(g)}
                      className="ml-0.5 text-red-400 hover:text-red-200"
                      aria-label={`Remove ${g}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
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
                  placeholder="Type a genre and press Enter"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                  maxLength={50}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addGenre}
                  className="shrink-0 border-white/15 text-gray-300 hover:bg-white/5"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-xs text-gray-300">
                  DJ Type <span className="text-h_red">*</span>
                </Label>
                {submitted && djTypesError && (
                  <span className="text-[11px] text-red-400">
                    Select at least one
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(DJ_TYPE_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-white/3"
                  >
                    <Checkbox
                      checked={djTypes.includes(value)}
                      onCheckedChange={() => toggleDjType(value)}
                      className="data-[state=checked]:bg-h_red data-[state=checked]:border-h_red border-white/20"
                    />
                    <span className="text-xs text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Social Links */}
        <SectionCard
          title="Social & Music Links"
          subtitle="Connect your platforms to boost discovery"
        >
          <div className="flex flex-col gap-3">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={link.platform}
                  onChange={(e) =>
                    updateSocialLink(i, "platform", e.target.value)
                  }
                  className="focus:border-h_red/50 w-32 shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-2 text-xs text-white focus:outline-none"
                >
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option
                      key={p}
                      value={p}
                      className="bg-zinc-900 capitalize"
                    >
                      {p}
                    </option>
                  ))}
                </select>
                <Input
                  value={link.url}
                  onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                  placeholder="https://..."
                  type="url"
                  className="focus:border-h_red/50 flex-1 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSocialLink(i)}
                  className="shrink-0 text-gray-600 hover:text-red-400"
                  aria-label="Remove link"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSocialLink}
              className="w-fit border-white/15 text-gray-400 hover:bg-white/5"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Link
            </Button>
          </div>
        </SectionCard>

        {/* Booking & Fees */}
        <SectionCard
          title="Booking Contact & Fees"
          subtitle="How bookers can reach you and your rate range"
        >
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Booking Email
                </Label>
                <Input
                  type="email"
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  placeholder="bookings@yourname.com"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Booking Phone
                </Label>
                <Input
                  type="tel"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  placeholder="+44 7700 900123"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Min Fee
                </Label>
                <Input
                  type="number"
                  value={feeMin}
                  onChange={(e) => setFeeMin(e.target.value)}
                  placeholder="500"
                  min={0}
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Max Fee
                </Label>
                <Input
                  type="number"
                  value={feeMax}
                  onChange={(e) => setFeeMax(e.target.value)}
                  placeholder="5000"
                  min={0}
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label className="text-xs text-gray-300">Currency</Label>
                  {currencyAutoSet && (
                    <span className="text-[11px] text-gray-600">auto</span>
                  )}
                </div>
                <Input
                  value={feeCurrency}
                  onChange={(e) => {
                    setFeeCurrency(e.target.value.toUpperCase().slice(0, 3));
                    setCurrencyAutoSet(false);
                  }}
                  placeholder="USD"
                  maxLength={3}
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white uppercase placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Photo Gallery */}
        <SectionCard
          title="Photo Gallery"
          subtitle="Showcase your work — up to 12 photos"
        >
          <div>
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-white/5"
                >
                  <Image
                    src={img.url}
                    alt="Gallery photo"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleGalleryDelete(img)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-900/80"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              {gallery.length < 12 && (
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isUploadingGallery}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/15 bg-white/3 transition-colors hover:border-white/30 hover:bg-white/5 disabled:opacity-50"
                >
                  {isUploadingGallery ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  ) : (
                    <>
                      <Plus className="h-5 w-5 text-gray-500" />
                      <span className="text-[10px] text-gray-600">
                        Add Photo
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleGalleryUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <p className="text-[11px] text-gray-600">
              {gallery.length}/12 photos
            </p>
          </div>
        </SectionCard>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-600">
            <span className="text-h_red">*</span> Required fields
          </p>
          <Button
            type="submit"
            disabled={
              isPending ||
              isUploadingAvatar ||
              isUploadingCover ||
              isUploadingGallery ||
              (submitted && !canSave)
            }
            className="bg-h_red hover:bg-h_redDark min-w-32 px-8 font-semibold text-white disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      <AlertDialog open={showLeaveAlert} onOpenChange={setShowLeaveAlert}>
        <AlertDialogContent className="border-white/10 bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              You have unsaved changes. If you leave now, all your edits will be
              lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/15 bg-transparent text-gray-300 hover:bg-white/5">
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-h_red hover:bg-h_redDark text-white"
              onClick={() => router.push(`/djs/${profile.slug}`)}
            >
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
