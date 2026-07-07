"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { X, Plus, Loader2, Camera, ArrowLeft, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { updateDjProfile, getCitiesByCountry } from "@/lib/actions/profile";
import { getGenres } from "@/lib/actions/genre";
import {
  uploadDjAvatar,
  uploadDjCover,
  uploadDjGalleryImage,
  deleteGalleryImage,
} from "@/lib/actions/dj-upload";
import { getMediaLimit, normalisePlan } from "@/lib/plan-features";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/config/currencies";

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
  PRIVATE_PARTY: "Private Party",
  BIRTHDAY: "Birthday",
  CULTURAL_EVENT: "Cultural Event",
};

type AvailabilityDay = { day: number; status: string };

interface ProfileData {
  stageName: string;
  bio: string;
  experienceYears: number | null;
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
  plan: "FREE" | "PREMIUM";
  // Team
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  agentName: string;
  agentAgency: string;
  agentEmail: string;
  // Spotlight
  featuredMixTitle: string;
  featuredMixAudioUrl: string;
  featuredMixDuration: string;
  featuredMixPlays: number;
  featuredVideoTitle: string;
  featuredVideoUrl: string;
  featuredVideoThumbnail: string;
  featuredVideoDuration: string;
  featuredVideoViews: number;
  // Availability
  availabilityTimezone: string;
  availabilityMonth: string;
  availabilityDays: AvailabilityDay[];
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
    <Card className="bg-h_blackLight/40 gap-0 overflow-visible border-white/8 p-6">
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plan = normalisePlan(profile.plan);
  const galleryLimit = getMediaLimit(plan, "photos");

  const [stageName, setStageName] = useState(profile.stageName);
  const [bio, setBio] = useState(profile.bio);
  const [experienceYears, setExperienceYears] = useState(
    profile.experienceYears !== null ? String(profile.experienceYears) : "",
  );
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar);
  const [coverImageUrl, setCoverImageUrl] = useState(profile.coverImage);
  const [countryId, setCountryId] = useState<number | null>(profile.countryId);
  const [cityId, setCityId] = useState<number | null>(profile.cityId);
  const [cities, setCities] = useState<City[]>(initialCities);
  const [genreNames, setGenreNames] = useState<string[]>(profile.genres);
  const [genreInput, setGenreInput] = useState("");
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  // Fetch genres on mount
  useEffect(() => {
    getGenres().then(setAvailableGenres);
  }, []);

  // Filter genres for dropdown
  const filteredGenres = availableGenres
    .filter((g) => {
      if (!genreInput.trim()) return true;
      const norm = g.toLowerCase().replace(/[^a-z0-9]/g, "");
      const inputNorm = genreInput.toLowerCase().replace(/[^a-z0-9]/g, "");
      return (
        norm.includes(inputNorm) ||
        g.toLowerCase().includes(genreInput.toLowerCase())
      );
    })
    .filter((g) => !genreNames.includes(g))
    .slice(0, 10);
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

  // Team
  const [managerName, setManagerName] = useState(profile.managerName);
  const [managerEmail, setManagerEmail] = useState(profile.managerEmail);
  const [managerPhone, setManagerPhone] = useState(profile.managerPhone);
  const [agentName, setAgentName] = useState(profile.agentName);
  const [agentAgency, setAgentAgency] = useState(profile.agentAgency);
  const [agentEmail, setAgentEmail] = useState(profile.agentEmail);

  // Spotlight
  const [featuredMixTitle, setFeaturedMixTitle] = useState(
    profile.featuredMixTitle,
  );

  const [featuredMixAudioUrl, setFeaturedMixAudioUrl] = useState(
    profile.featuredMixAudioUrl,
  );
  const [featuredMixDuration, setFeaturedMixDuration] = useState(
    profile.featuredMixDuration,
  );
  const [featuredMixPlays, setFeaturedMixPlays] = useState(
    String(profile.featuredMixPlays),
  );
  const [featuredVideoTitle, setFeaturedVideoTitle] = useState(
    profile.featuredVideoTitle,
  );
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState(
    profile.featuredVideoUrl,
  );
  const [featuredVideoThumbnail, setFeaturedVideoThumbnail] = useState(
    profile.featuredVideoThumbnail,
  );
  const [featuredVideoDuration, setFeaturedVideoDuration] = useState(
    profile.featuredVideoDuration,
  );
  const [featuredVideoViews, setFeaturedVideoViews] = useState(
    String(profile.featuredVideoViews),
  );

  // Availability
  const [availabilityTimezone, setAvailabilityTimezone] = useState(
    profile.availabilityTimezone,
  );
  const [availabilityMonth, setAvailabilityMonth] = useState(
    profile.availabilityMonth,
  );
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>(
    profile.availabilityDays,
  );

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const isDirty =
    stageName !== profile.stageName ||
    bio !== profile.bio ||
    experienceYears !==
      (profile.experienceYears !== null
        ? String(profile.experienceYears)
        : "") ||
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
    JSON.stringify(socialLinks) !== JSON.stringify(profile.socialLinks) ||
    managerName !== profile.managerName ||
    managerEmail !== profile.managerEmail ||
    managerPhone !== profile.managerPhone ||
    agentName !== profile.agentName ||
    agentAgency !== profile.agentAgency ||
    agentEmail !== profile.agentEmail ||
    featuredMixTitle !== profile.featuredMixTitle ||
    featuredMixAudioUrl !== profile.featuredMixAudioUrl ||
    featuredMixDuration !== profile.featuredMixDuration ||
    featuredMixPlays !== String(profile.featuredMixPlays) ||
    featuredVideoTitle !== profile.featuredVideoTitle ||
    featuredVideoUrl !== profile.featuredVideoUrl ||
    featuredVideoThumbnail !== profile.featuredVideoThumbnail ||
    featuredVideoDuration !== profile.featuredVideoDuration ||
    featuredVideoViews !== String(profile.featuredVideoViews) ||
    availabilityTimezone !== profile.availabilityTimezone ||
    availabilityMonth !== profile.availabilityMonth ||
    JSON.stringify(availabilityDays) !==
      JSON.stringify(profile.availabilityDays);

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

  const [prevCountryId, setPrevCountryId] = useState(countryId);
  const cityRequestId = useRef(0);

  if (prevCountryId !== countryId) {
    setPrevCountryId(countryId);
    if (!countryId) {
      setCities([]);
      setCityId(null);
    }
  }

  useEffect(() => {
    if (!countryId) return;
    const selectedCountry = countries.find((c) => c.id === countryId);
    const requestId = ++cityRequestId.current;
    getCitiesByCountry(countryId).then((result) => {
      if (requestId === cityRequestId.current) {
        setCities(result ?? []);
        if (selectedCountry && currencyAutoSet) {
          const mapped = COUNTRY_CURRENCIES[selectedCountry.name];
          if (mapped) setFeeCurrency(mapped);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId]);

  function addGenre() {
    const trimmed = genreInput.trim();
    if (genreNames.length >= 5) return;
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

  function isValidMonthFormat(monthStr: string): boolean {
    if (!monthStr || !monthStr.includes("-")) return false;
    const [y, m] = monthStr.split("-").map(Number);
    if (!y || !m || Number.isNaN(y) || Number.isNaN(m)) return false;
    return m >= 1 && m <= 12 && y >= 2000 && y <= 2100;
  }

  function daysInMonth(monthStr: string): number | null {
    if (!isValidMonthFormat(monthStr)) return null;
    const [y, m] = monthStr.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  }

  function firstDayOffset(monthStr: string): number | null {
    if (!isValidMonthFormat(monthStr)) return null;
    const [y, m] = monthStr.split("-").map(Number);
    const dow = new Date(y, m - 1, 1).getDay(); // 0=Sun, 1=Mon
    return dow === 0 ? 6 : dow - 1; // shift so Mon=0
  }

  function getDayStatus(day: number): string {
    const found = availabilityDays.find((d) => d.day === day);
    return found?.status ?? "free";
  }

  function cycleDayStatus(day: number) {
    const order = ["free", "available", "booked", "tentative"];
    const current = getDayStatus(day);
    const next = order[(order.indexOf(current) + 1) % order.length];
    setAvailabilityDays((prev) => {
      const filtered = prev.filter((d) => d.day !== day);
      if (next === "free") return filtered;
      return [...filtered, { day, status: next }];
    });
  }

  const isPremium = profile.plan === "PREMIUM";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (isUploadingAvatar || isUploadingCover || isUploadingGallery) return;
    if (!canSave) return;
    const toastId = toast.loading("Saving profile...");
    setIsSubmitting(true);

    try {
      const validLinks = socialLinks.filter((l) => l.platform && l.url.trim());
      const result = await updateDjProfile({
        stageName: stageName.trim() || undefined,
        bio: bio.trim() || null,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
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
          | "PRIVATE_PARTY"
          | "BIRTHDAY"
          | "CULTURAL_EVENT"
        )[],
        socialLinks: validLinks,
        bookingEmail: bookingEmail.trim() || null,
        bookingPhone: bookingPhone.trim() || null,
        feeMin: feeMin ? parseInt(feeMin, 10) : null,
        feeMax: feeMax ? parseInt(feeMax, 10) : null,
        feeCurrency: feeCurrency || null,
        // Team
        managerName: managerName.trim() || null,
        managerEmail: managerEmail.trim() || null,
        managerPhone: managerPhone.trim() || null,
        agentName: agentName.trim() || null,
        agentAgency: agentAgency.trim() || null,
        agentEmail: agentEmail.trim() || null,
        // Spotlight
        featuredMixTitle: featuredMixTitle.trim() || null,
        featuredMixAudioUrl: featuredMixAudioUrl.trim() || null,
        featuredMixDuration: featuredMixDuration.trim() || null,
        featuredMixPlays: featuredMixPlays ? parseInt(featuredMixPlays, 10) : 0,
        featuredVideoTitle: featuredVideoTitle.trim() || null,
        featuredVideoUrl: featuredVideoUrl.trim() || null,
        featuredVideoThumbnail: featuredVideoThumbnail.trim() || null,
        featuredVideoDuration: featuredVideoDuration.trim() || null,
        featuredVideoViews: featuredVideoViews
          ? parseInt(featuredVideoViews, 10)
          : 0,
        // Availability
        availabilityTimezone: availabilityTimezone.trim() || null,
        availabilityMonth: availabilityMonth.trim() || null,
        availabilityDays: availabilityDays,
      });

      if ("error" in result) {
        toast.error(result.error, { id: toastId });
      } else {
        toast.success("Profile updated!", { id: toastId });
        const targetSlug = result.newSlug ?? profile.slug;
        // Clear dirty state before redirect
        setSubmitted(false);
        // Redirect to profile view
        router.push(`/djs/${targetSlug}`);
      }
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Experience */}
        <SectionCard
          title="Experience"
          subtitle="Your background and skill level"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-gray-300">
                Years of Experience
              </Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 5"
                className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
              />
              <p className="mt-1 text-[11px] text-gray-600">
                Total years as a DJ
              </p>
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
                <span
                  className={`text-[11px] ${genreNames.length >= 5 ? "text-amber-400" : "text-gray-600"}`}
                >
                  {submitted && genresError ? (
                    <span className="text-red-400">Add at least one genre</span>
                  ) : (
                    `${genreNames.length}/5`
                  )}
                </span>
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
              <div className="relative">
                <Input
                  value={genreInput}
                  onChange={(e) => {
                    setGenreInput(e.target.value);
                    setShowGenreDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowGenreDropdown(genreInput.length > 0)}
                  onBlur={() =>
                    setTimeout(() => setShowGenreDropdown(false), 200)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGenre();
                    }
                  }}
                  placeholder={
                    genreNames.length >= 5
                      ? "Max 5 genres reached"
                      : "Add a genre..."
                  }
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600 disabled:opacity-40"
                  maxLength={50}
                  disabled={genreNames.length >= 5}
                />
                {showGenreDropdown && filteredGenres.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-white/10 bg-[#1a1a1a] shadow-lg">
                    {filteredGenres.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => {
                          setGenreNames((prev) => [...prev, genre]);
                          setGenreInput("");
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
                <Select
                  value={feeCurrency}
                  onValueChange={(value) => {
                    setFeeCurrency(value);
                    setCurrencyAutoSet(false);
                  }}
                >
                  <SelectTrigger className="focus:border-h_red/50 border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-black text-white">
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Photo Gallery */}
        <SectionCard
          title="Photo Gallery"
          subtitle={
            galleryLimit === Infinity
              ? "Showcase your work — unlimited photos"
              : `Showcase your work — up to ${galleryLimit} photos`
          }
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
              {gallery.length < galleryLimit && (
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
              {galleryLimit === Infinity
                ? `${gallery.length} photos`
                : `${gallery.length}/${galleryLimit} photos`}
            </p>
          </div>
        </SectionCard>

        {/* Team Contacts */}
        {isPremium ? (
          <SectionCard
            title="Professional Team"
            subtitle="Manager and booking agent details"
          >
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Manager
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Name
                    </Label>
                    <Input
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="Marcus Osei"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      placeholder="manager@email.com"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Phone
                    </Label>
                    <Input
                      type="tel"
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(e.target.value)}
                      placeholder="+44 7700 900123"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>
              <Separator className="bg-white/8" />
              <div>
                <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Booking Agent
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Name
                    </Label>
                    <Input
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="Sophie Laurent"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Agency
                    </Label>
                    <Input
                      value={agentAgency}
                      onChange={(e) => setAgentAgency(e.target.value)}
                      placeholder="Rhythm Agency"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={agentEmail}
                      onChange={(e) => setAgentEmail(e.target.value)}
                      placeholder="agent@email.com"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Professional Team"
            subtitle="Manager and booking agent details — Premium only"
          >
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Crown className="h-6 w-6 text-amber-500" />
              <p className="text-sm text-gray-400">
                Upgrade to Premium to add your manager and booking agent
                details.
              </p>
            </div>
          </SectionCard>
        )}

        {/* Spotlight */}
        {isPremium ? (
          <SectionCard
            title="Spotlight"
            subtitle="Featured mix and video at the top of your profile"
          >
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Featured Mix
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Title
                    </Label>
                    <Input
                      value={featuredMixTitle}
                      onChange={(e) => setFeaturedMixTitle(e.target.value)}
                      placeholder="Afrobeats & Amapiano Fusion Vol.3"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Audio URL
                    </Label>
                    <Input
                      value={featuredMixAudioUrl}
                      onChange={(e) => setFeaturedMixAudioUrl(e.target.value)}
                      placeholder="https://soundcloud.com/..."
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Duration
                    </Label>
                    <Input
                      value={featuredMixDuration}
                      onChange={(e) => setFeaturedMixDuration(e.target.value)}
                      placeholder="1h 24m"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Plays
                    </Label>
                    <Input
                      type="number"
                      value={featuredMixPlays}
                      onChange={(e) => setFeaturedMixPlays(e.target.value)}
                      placeholder="82400"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>
              <Separator className="bg-white/8" />
              <div>
                <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Featured Video
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Title
                    </Label>
                    <Input
                      value={featuredVideoTitle}
                      onChange={(e) => setFeaturedVideoTitle(e.target.value)}
                      placeholder="Summer Closing Set — Full Recording"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Video URL
                    </Label>
                    <Input
                      value={featuredVideoUrl}
                      onChange={(e) => setFeaturedVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Thumbnail URL
                    </Label>
                    <Input
                      value={featuredVideoThumbnail}
                      onChange={(e) =>
                        setFeaturedVideoThumbnail(e.target.value)
                      }
                      placeholder="https://..."
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Duration
                    </Label>
                    <Input
                      value={featuredVideoDuration}
                      onChange={(e) => setFeaturedVideoDuration(e.target.value)}
                      placeholder="45 min"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-300">
                      Views
                    </Label>
                    <Input
                      type="number"
                      value={featuredVideoViews}
                      onChange={(e) => setFeaturedVideoViews(e.target.value)}
                      placeholder="211000"
                      className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Spotlight"
            subtitle="Featured mix and video — Premium only"
          >
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Crown className="h-6 w-6 text-amber-500" />
              <p className="text-sm text-gray-400">
                Upgrade to Premium to feature a mix and video at the top of your
                profile.
              </p>
            </div>
          </SectionCard>
        )}

        {/* Availability Calendar */}
        {isPremium ? (
          <SectionCard
            title="Availability Calendar"
            subtitle="Click days to set your schedule"
          >
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    Month (YYYY-MM)
                  </Label>
                  <Input
                    value={availabilityMonth}
                    onChange={(e) => setAvailabilityMonth(e.target.value)}
                    placeholder="2025-09"
                    maxLength={7}
                    className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    Timezone
                  </Label>
                  <Input
                    value={availabilityTimezone}
                    onChange={(e) => setAvailabilityTimezone(e.target.value)}
                    placeholder="Europe/London"
                    className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              {availabilityMonth && isValidMonthFormat(availabilityMonth) && (
                <div>
                  <div className="mb-2 flex items-center gap-4">
                    {[
                      { color: "bg-emerald-500", label: "Available" },
                      { color: "bg-h_red", label: "Booked" },
                      { color: "bg-amber-500", label: "Tentative" },
                      { color: "bg-white/10", label: "Free" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`size-2.5 rounded-full ${l.color}`} />
                        <span className="text-xs text-gray-400">{l.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (d) => (
                        <div
                          key={d}
                          className="pb-1 text-center text-[11px] font-semibold text-gray-600"
                        >
                          {d}
                        </div>
                      ),
                    )}
                    {Array.from({
                      length: firstDayOffset(availabilityMonth) ?? 0,
                    }).map((_, i) => (
                      <div key={`e${i}`} />
                    ))}
                    {Array.from({
                      length: daysInMonth(availabilityMonth) ?? 0,
                    }).map((_, i) => {
                      const day = i + 1;
                      const status = getDayStatus(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => cycleDayStatus(day)}
                          className={`flex h-9 items-center justify-center rounded-md text-xs font-medium transition-all ${
                            status === "booked"
                              ? "bg-h_red/20 text-h_red border-h_red/30 border"
                              : status === "tentative"
                                ? "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                                : status === "available"
                                  ? "border border-emerald-500/25 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                  : "text-gray-600 hover:bg-white/5"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Availability Calendar"
            subtitle="Click days to set your schedule — Premium only"
          >
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Crown className="h-6 w-6 text-amber-500" />
              <p className="text-sm text-gray-400">
                Upgrade to Premium to set your availability calendar and let
                organizers know when you are free.
              </p>
            </div>
          </SectionCard>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-600">
            <span className="text-h_red">*</span> Required fields
          </p>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isUploadingAvatar ||
              isUploadingCover ||
              isUploadingGallery ||
              (submitted && !canSave)
            }
            className="bg-h_red hover:bg-h_redDark min-w-32 px-8 font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? (
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
