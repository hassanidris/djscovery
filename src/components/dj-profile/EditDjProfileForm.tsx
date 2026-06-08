"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { X, Plus, Loader2, Camera, ArrowLeft } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { updateDjProfile } from "@/lib/actions/profile";
import { getCitiesByCountry } from "@/lib/actions/profile";
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
    <Card className="bg-h_blackLight/40 border-white/8 p-6 gap-0">
      <div className="mb-5">
        <h2 className="text-white font-semibold text-sm">{title}</h2>
        {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <Separator className="bg-white/8 mb-5" />
      {children}
    </Card>
  );
}

export default function EditDjProfileForm({
  profile,
  countries,
  initialCities,
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
      JSON.stringify([...profile.djTypes].sort());

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
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
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={handleBack}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-2xl font-bold">Edit Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Update your DJ profile information
          </p>
        </div>
        {isDirty && (
          <span className="text-amber-400 text-xs font-medium">
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
              <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10 bg-white/5">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-6 w-6 text-gray-600" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-white text-xs font-medium mb-0.5">
                  Profile Photo
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  Shown on your profile and directory card
                </p>
                <CldUploadWidget
                  uploadPreset="djscovery"
                  onSuccess={(result, { widget }) => {
                    if (
                      result.info &&
                      typeof result.info === "object" &&
                      "secure_url" in result.info
                    ) {
                      setAvatarUrl(result.info.secure_url as string);
                      toast.success("Avatar updated");
                    }
                    widget.close();
                  }}
                  options={{
                    maxFiles: 1,
                    cropping: true,
                    croppingAspectRatio: 1,
                  }}
                >
                  {({ open }) => (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => open()}
                      className="border-white/15 text-gray-300 hover:bg-white/5"
                    >
                      <Camera className="h-3.5 w-3.5 mr-1.5" />
                      {avatarUrl ? "Change Avatar" : "Upload Avatar"}
                    </Button>
                  )}
                </CldUploadWidget>
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Cover Image */}
            <div>
              <p className="text-white text-xs font-medium mb-0.5">
                Cover Image
              </p>
              <p className="text-gray-500 text-xs mb-3">
                The banner shown at the top of your profile
              </p>
              {coverImageUrl && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden mb-3 bg-white/5">
                  <Image
                    src={coverImageUrl}
                    alt="cover"
                    fill
                    className="object-cover opacity-70"
                  />
                </div>
              )}
              <CldUploadWidget
                uploadPreset="djscovery"
                onSuccess={(result, { widget }) => {
                  if (
                    result.info &&
                    typeof result.info === "object" &&
                    "secure_url" in result.info
                  ) {
                    setCoverImageUrl(result.info.secure_url as string);
                    toast.success("Cover image updated");
                  }
                  widget.close();
                }}
                options={{ maxFiles: 1 }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => open()}
                    className="border-white/15 text-gray-300 hover:bg-white/5"
                  >
                    <Camera className="h-3.5 w-3.5 mr-1.5" />
                    {coverImageUrl ? "Change Cover" : "Upload Cover"}
                  </Button>
                )}
              </CldUploadWidget>
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
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-gray-300 text-xs">
                  Stage Name <span className="text-h_red">*</span>
                </Label>
                <span className="text-gray-600 text-[11px]">
                  Displays as{" "}
                  <span className="text-gray-400 font-medium">
                    Dj {stageName.trim() || "Your Name"}
                  </span>{" "}
                  — no &ldquo;DJ&rdquo; needed
                </span>
              </div>
              <Input
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="e.g. Hassan, Tiësto, Carl Cox"
                className={`bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-h_red/50 ${
                  submitted && stageNameError ? "border-red-500/60" : ""
                }`}
                maxLength={60}
              />
              {submitted && stageNameError && (
                <p className="text-red-400 text-[11px] mt-1">
                  Stage name is required (min 2 characters)
                </p>
              )}
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">
                Biography
              </Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell bookers and fans about your sound and story..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-h_red/50 min-h-28 resize-none"
                maxLength={800}
              />
              <div className="flex items-center justify-between mt-1">
                {bio.trim().length === 0 ? (
                  <p className="text-amber-400/70 text-[11px]">
                    ⚠ A bio increases your booking chances
                  </p>
                ) : bio.trim().length < 50 ? (
                  <p className="text-amber-400/70 text-[11px]">
                    ⚠ Short bio — aim for 50+ characters
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-gray-600 text-[11px]">{bio.length}/800</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Location */}
        <SectionCard title="Location" subtitle="Where you are based">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-gray-300 text-xs">
                  Country <span className="text-h_red">*</span>
                </Label>
                {submitted && countryError && (
                  <span className="text-red-400 text-[11px]">
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
                className={`w-full bg-white/5 border rounded-md text-white text-sm px-3 py-2 focus:outline-none focus:border-h_red/50 ${
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
              <Label className="text-gray-300 text-xs mb-1.5 block">City</Label>
              <select
                value={cityId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setCityId(val ? Number(val) : null);
                }}
                disabled={!countryId || cities.length === 0}
                className="w-full bg-white/5 border border-white/10 rounded-md text-white text-sm px-3 py-2 focus:outline-none focus:border-h_red/50 disabled:opacity-40"
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
              <p className="text-gray-600 text-[11px] mt-1">
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
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-gray-300 text-xs">
                  Genres <span className="text-h_red">*</span>
                </Label>
                {submitted && genresError && (
                  <span className="text-red-400 text-[11px]">
                    Add at least one genre
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {genreNames.map((g) => (
                  <span
                    key={g}
                    className="flex items-center gap-1 text-xs bg-h_redDark/50 text-red-200 px-2 py-0.5 rounded-full"
                  >
                    {g}
                    <button
                      type="button"
                      onClick={() => removeGenre(g)}
                      className="text-red-400 hover:text-red-200 ml-0.5"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-h_red/50"
                  maxLength={50}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addGenre}
                  className="border-white/15 text-gray-300 hover:bg-white/5 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-gray-300 text-xs">
                  DJ Type <span className="text-h_red">*</span>
                </Label>
                {submitted && djTypesError && (
                  <span className="text-red-400 text-[11px]">
                    Select at least one
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(DJ_TYPE_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-white/3 transition-colors"
                  >
                    <Checkbox
                      checked={djTypes.includes(value)}
                      onCheckedChange={() => toggleDjType(value)}
                      className="border-white/20 data-[state=checked]:bg-h_red data-[state=checked]:border-h_red"
                    />
                    <span className="text-gray-300 text-xs">{label}</span>
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
                  className="bg-white/5 border border-white/10 rounded-md text-white text-xs px-2 py-2 focus:outline-none focus:border-h_red/50 w-32 shrink-0"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-h_red/50 flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSocialLink(i)}
                  className="text-gray-600 hover:text-red-400 shrink-0"
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
              className="border-white/15 text-gray-400 hover:bg-white/5 w-fit"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-xs mb-1.5 block">
                  Booking Email
                </Label>
                <Input
                  type="email"
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  placeholder="bookings@yourname.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-h_red/50"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1.5 block">
                  Booking Phone
                </Label>
                <Input
                  type="tel"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  placeholder="+44 7700 900123"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-h_red/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-gray-300 text-xs mb-1.5 block">
                  Min Fee
                </Label>
                <Input
                  type="number"
                  value={feeMin}
                  onChange={(e) => setFeeMin(e.target.value)}
                  placeholder="500"
                  min={0}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-h_red/50"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1.5 block">
                  Max Fee
                </Label>
                <Input
                  type="number"
                  value={feeMax}
                  onChange={(e) => setFeeMax(e.target.value)}
                  placeholder="5000"
                  min={0}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-h_red/50"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-gray-300 text-xs">Currency</Label>
                  {currencyAutoSet && (
                    <span className="text-gray-600 text-[10px]">auto</span>
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-h_red/50 uppercase"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-gray-600 text-xs">
            <span className="text-h_red">*</span> Required fields
          </p>
          <Button
            type="submit"
            disabled={isPending || (submitted && !canSave)}
            className="bg-h_red hover:bg-h_redDark text-white font-semibold px-8 min-w-32 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      <AlertDialog open={showLeaveAlert} onOpenChange={setShowLeaveAlert}>
        <AlertDialogContent className="bg-zinc-900 border-white/10">
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
            <AlertDialogCancel className="border-white/15 text-gray-300 bg-transparent hover:bg-white/5">
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
