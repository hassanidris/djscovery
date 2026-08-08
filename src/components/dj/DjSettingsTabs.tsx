"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Loader2,
  Camera,
  Trash2,
  Plus,
  User,
  Music,
  Banknote,
  BriefcaseBusiness,
  Crown,
  Trophy,
  Pencil,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDjProfile, getCitiesByCountry } from "@/lib/actions/profile";
import { uploadDjAvatar, uploadDjCover } from "@/lib/actions/dj-upload";
import {
  getDjHighlights,
  createDjHighlight,
  updateDjHighlight,
  deleteDjHighlight,
} from "@/lib/actions/dj-highlights";
import { CURRENCIES } from "@/config/currencies";

type SocialLink = { platform: string; url: string };

type ProfileData = {
  id: number;
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
  socialLinks: SocialLink[];
  bookingEmail: string;
  bookingPhone: string;
  feeMin: number | null;
  feeMax: number | null;
  feeCurrency: string;
  slug: string;
  plan: "FREE" | "PREMIUM";
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  agentName: string;
  agentAgency: string;
  agentEmail: string;
};

type Country = { id: number; name: string };
type City = { id: number; name: string };

const TABS = [
  { value: "profile", label: "Profile", icon: User },
  { value: "music", label: "Music & Social", icon: Music },
  { value: "pricing", label: "Pricing", icon: Banknote },
  { value: "highlights", label: "Career Highlights", icon: Trophy },
  { value: "team", label: "Professional Team", icon: BriefcaseBusiness },
] as const;

const DJ_TYPES = [
  { value: "CLUB", label: "Club Night" },
  { value: "WEDDING", label: "Wedding" },
  { value: "FESTIVAL", label: "Festival" },
  { value: "CORPORATE", label: "Corporate Event" },
  { value: "BAR_LOUNGE", label: "Bar / Lounge" },
  { value: "PRIVATE_PARTY", label: "Private Party" },
  { value: "BIRTHDAY", label: "Birthday" },
  { value: "CULTURAL_EVENT", label: "Cultural Event" },
] as const;

const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "spotify", label: "Spotify" },
  { value: "soundcloud", label: "SoundCloud" },
  { value: "mixcloud", label: "Mixcloud" },
  { value: "website", label: "Website" },
] as const;

export default function DjSettingsTabs({
  profile,
  countries,
  initialCities,
  allGenres,
}: {
  profile: ProfileData;
  countries: Country[];
  initialCities: City[];
  allGenres: string[];
}) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6 w-full flex-wrap justify-start gap-1 bg-white/5 sm:w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-active:bg-h_redDark flex-1 gap-1 px-3 py-1.5 data-active:text-white sm:flex-initial"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab
          profile={profile}
          countries={countries}
          initialCities={initialCities}
        />
      </TabsContent>
      <TabsContent value="music">
        <MusicTab profile={profile} allGenres={allGenres} />
      </TabsContent>
      <TabsContent value="pricing">
        <PricingTab profile={profile} />
      </TabsContent>
      <TabsContent value="highlights">
        <HighlightsTab profile={profile} />
      </TabsContent>
      <TabsContent value="team">
        <TeamTab profile={profile} />
      </TabsContent>
    </Tabs>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({
  profile,
  countries,
  initialCities,
}: {
  profile: ProfileData;
  countries: Country[];
  initialCities: City[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [stageName, setStageName] = useState(profile.stageName);
  const [bio, setBio] = useState(profile.bio);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [coverPreview, setCoverPreview] = useState(profile.coverImage);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar);
  const [coverImageUrl, setCoverImageUrl] = useState(profile.coverImage);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [countryId, setCountryId] = useState<number | null>(profile.countryId);
  const [cityId, setCityId] = useState<number | null>(profile.cityId);
  const [cities, setCities] = useState<City[]>(initialCities);
  const [loadingCities, setLoadingCities] = useState(false);

  const [email, setEmail] = useState(profile.bookingEmail);
  const [phone, setPhone] = useState(profile.bookingPhone);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadDjAvatar(fd);
    if ("error" in result) {
      toast.error(result.error);
      setAvatarPreview(profile.avatar);
    } else {
      setAvatarPreview(result.url);
      setAvatarUrl(result.url);
      toast.success("Avatar updated.");
    }
    setUploadingAvatar(false);
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setUploadingCover(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadDjCover(fd);
    if ("error" in result) {
      toast.error(result.error);
      setCoverPreview(profile.coverImage);
    } else {
      setCoverPreview(result.url);
      setCoverImageUrl(result.url);
      toast.success("Cover image updated.");
    }
    setUploadingCover(false);
  }

  async function handleCountryChange(value: string) {
    const id = value ? Number(value) : null;
    setCountryId(id);
    setCityId(null);
    setCities([]);
    if (!id) return;
    setLoadingCities(true);
    try {
      const result = await getCitiesByCountry(id);
      setCities(result);
    } finally {
      setLoadingCities(false);
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateDjProfile({
        stageName: stageName.trim(),
        bio: bio.trim() || null,
        countryId: countryId ?? undefined,
        cityId: cityId ?? undefined,
        bookingEmail: email.trim() || null,
        bookingPhone: phone.trim() || null,
        avatarUrl: avatarUrl || null,
        coverImageUrl: coverImageUrl || null,
      });
      if ("error" in result) toast.error(result.error);
      else {
        toast.success("Profile updated.");
        if (result.newSlug) router.push("/dj/settings");
        else router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Basic Info */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Basic Info</h3>
          <p className="text-xs text-gray-400">Your public DJ identity.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Cover Image</Label>
          <div className="relative h-40 w-full overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
            {coverPreview ? (
              <Image
                src={coverPreview}
                alt="Cover"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No cover image
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
              >
                {uploadingCover ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {coverPreview ? "Change" : "Upload"}
              </Button>
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleCoverChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Avatar</Label>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white/5 ring-2 ring-white/10">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <Camera className="h-6 w-6" />
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {avatarPreview ? "Change Avatar" : "Upload Avatar"}
            </Button>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="stageName">
            Stage Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="stageName"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            placeholder="Your DJ name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={800}
            placeholder="Tell fans and organizers about your style..."
            className="resize-none"
          />
          <p className="text-right text-xs text-gray-400">{bio.length}/800</p>
        </div>
      </section>

      {/* Location */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Location</h3>
          <p className="text-xs text-gray-400">Where you&apos;re based.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Country</Label>
            <Select
              value={countryId ? String(countryId) : ""}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country..." />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>City</Label>
            {loadingCities ? (
              <div className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading cities...
              </div>
            ) : (
              <Select
                value={cityId ? String(cityId) : ""}
                onValueChange={(v) => setCityId(v ? Number(v) : null)}
                disabled={!countryId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select city..." />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Contact</h3>
          <p className="text-xs text-gray-400">How organizers can reach you.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bookingEmail">Booking Email</Label>
            <Input
              id="bookingEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bookings@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bookingPhone">Booking Phone</Label>
            <Input
              id="bookingPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+46 70 000 0000"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending || !stageName.trim()}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}

// ─── Music & Social Tab ──────────────────────────────────────────────────────

function MusicTab({
  profile,
  allGenres,
}: {
  profile: ProfileData;
  allGenres: string[];
}) {
  const [isPending, startTransition] = useTransition();

  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    profile.genres,
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(profile.djTypes);
  const [customGenre, setCustomGenre] = useState("");

  const [links, setLinks] = useState<SocialLink[]>(
    profile.socialLinks.length > 0
      ? profile.socialLinks
      : [{ platform: "instagram", url: "" }],
  );

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre].slice(0, 5),
    );
  }

  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  async function handleAddCustomGenre() {
    const trimmed = customGenre.trim();
    if (!trimmed) return;
    if (selectedGenres.includes(trimmed)) {
      setCustomGenre("");
      return;
    }
    const { createGenre } = await import("@/lib/actions/genre");
    const result = await createGenre(trimmed);
    if ("error" in result) toast.error(result.error);
    else {
      setSelectedGenres((prev) => [...prev, result.name].slice(0, 5));
      setCustomGenre("");
    }
  }

  function addLink() {
    if (links.length >= 7) return;
    const used = new Set(links.map((l) => l.platform));
    const next = SOCIAL_PLATFORMS.find((p) => !used.has(p.value));
    setLinks((prev) => [
      ...prev,
      { platform: next?.value ?? "website", url: "" },
    ]);
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: "platform" | "url", value: string) {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  }

  function handleSave() {
    const valid = links.filter((l) => l.url.trim());
    startTransition(async () => {
      const result = await updateDjProfile({
        genreNames: selectedGenres,
        djTypes: selectedTypes as any,
        socialLinks: valid as any,
      });
      if ("error" in result) toast.error(result.error);
      else toast.success("Music & social links updated.");
    });
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Genres */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Genres</h3>
          <p className="text-xs text-gray-400">
            Select up to 5 genres that describe your sound.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {allGenres.map((genre) => (
            <label
              key={genre}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selectedGenres.includes(genre)
                  ? "border-h_red bg-h_redDark text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedGenres.includes(genre)}
                onChange={() => toggleGenre(genre)}
              />
              {genre}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            placeholder="Add a custom genre"
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomGenre}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* DJ Types */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white">DJ Types</h3>
          <p className="text-xs text-gray-400">
            What kind of events do you play?
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DJ_TYPES.map((type) => (
            <label
              key={type.value}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selectedTypes.includes(type.value)
                  ? "border-h_red bg-h_redDark text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedTypes.includes(type.value)}
                onChange={() => toggleType(type.value)}
              />
              {type.label}
            </label>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Social Links</h3>
            <p className="text-xs text-gray-400">
              Links shown on your public profile.
            </p>
          </div>
          {links.length < 7 && (
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              <Plus className="h-4 w-4" /> Add Link
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={link.platform}
                onValueChange={(v) => updateLink(i, "platform", v)}
              >
                <SelectTrigger className="w-36 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLink(i)}
                className="text-gray-400 hover:text-red-500"
                aria-label="Remove link"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={
            isPending ||
            selectedGenres.length === 0 ||
            selectedTypes.length === 0
          }
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Music & Social"}
        </Button>
      </div>
    </div>
  );
}

// ─── Pricing Tab ─────────────────────────────────────────────────────────────

function PricingTab({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [feeMin, setFeeMin] = useState(profile.feeMin?.toString() ?? "");
  const [feeMax, setFeeMax] = useState(profile.feeMax?.toString() ?? "");
  const [currency, setCurrency] = useState(profile.feeCurrency || "USD");

  function handleSave() {
    startTransition(async () => {
      const minNum = feeMin ? Number(feeMin) : null;
      const maxNum = feeMax ? Number(feeMax) : null;
      const result = await updateDjProfile({
        feeMin: minNum,
        feeMax: maxNum,
        feeCurrency: currency,
      });
      if ("error" in result) toast.error(result.error);
      else toast.success("Pricing updated.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="feeMin">Minimum Fee</Label>
          <Input
            id="feeMin"
            type="number"
            min={0}
            value={feeMin}
            onChange={(e) => setFeeMin(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="feeMax">Maximum Fee</Label>
          <Input
            id="feeMax"
            type="number"
            min={0}
            value={feeMax}
            onChange={(e) => setFeeMax(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Pricing"}
        </Button>
      </div>
    </div>
  );
}

// ─── Career Highlights Tab ─────────────────────────────────────────────────────

type Highlight = {
  id: number;
  year: string;
  title: string;
  description: string | null;
};

function HighlightsTab({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const highlightsRequest = useRef(0);

  const isPremium = profile.plan === "PREMIUM";

  useEffect(() => {
    async function loadHighlights() {
      if (!isPremium) {
        setLoading(false);
        return;
      }
      const requestId = ++highlightsRequest.current;
      const result = await getDjHighlights(profile.id);
      if (requestId !== highlightsRequest.current) return;
      setHighlights(result);
      setLoading(false);
    }
    loadHighlights();
  }, [profile.id, isPremium]);

  function addHighlight() {
    const tempId = -Date.now();
    setHighlights((prev) => [
      ...prev,
      { id: tempId, year: "", title: "", description: "" },
    ]);
    setEditId(tempId);
  }

  async function removeHighlight(id: number) {
    const result = await deleteDjHighlight(id);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    const requestId = ++highlightsRequest.current;
    const updated = await getDjHighlights(profile.id);
    if (requestId === highlightsRequest.current) {
      setHighlights(updated);
    }
    toast.success("Highlight deleted.");
  }

  function updateHighlight(id: number, field: keyof Highlight, value: string) {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    );
  }

  function handleSave() {
    startTransition(async () => {
      const requestId = ++highlightsRequest.current;
      const toAdd = highlights.filter((h) => h.id < 0);
      const toUpdate = highlights.filter((h) => h.id > 0);
      const toDelete = highlights.filter(
        (h) => h.id < 0 && h.year === "" && h.title === "",
      );

      // Add new highlights
      for (const h of toAdd) {
        if (!h.year.trim() || !h.title.trim()) continue;
        const formData = new FormData();
        formData.append("year", h.year.trim());
        formData.append("title", h.title.trim());
        if (h.description?.trim())
          formData.append("description", h.description.trim());
        const result = await createDjHighlight(formData);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
      }

      // Update existing highlights
      for (const h of toUpdate) {
        const formData = new FormData();
        formData.append("year", h.year.trim());
        formData.append("title", h.title.trim());
        formData.append("description", h.description?.trim() ?? "");
        const result = await updateDjHighlight(h.id, formData);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
      }

      // Reload highlights
      const result = await getDjHighlights(profile.id);
      if (requestId === highlightsRequest.current) {
        setHighlights(result);
      }
      setEditId(null);
      toast.success("Career highlights updated.");
    });
  }

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10">
          <Crown className="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Premium Feature</h3>
          <p className="mt-2 text-sm text-gray-400">
            Showcase your career milestones and achievements with a Premium
            plan.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Career Highlights
          </h3>
          <p className="text-xs text-gray-400">
            Showcase your key milestones and achievements.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addHighlight}
        >
          <Plus className="h-4 w-4" /> Add Highlight
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {highlights.map((h) => (
          <div
            key={h.id}
            data-testid="highlight-item"
            className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
          >
            {editId === h.id ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`highlight-year-${h.id}`}>Year</Label>
                    <Input
                      id={`highlight-year-${h.id}`}
                      value={h.year}
                      onChange={(e) =>
                        updateHighlight(h.id, "year", e.target.value)
                      }
                      placeholder="2024"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`highlight-title-${h.id}`}>Title</Label>
                  <Input
                    id={`highlight-title-${h.id}`}
                    value={h.title}
                    onChange={(e) =>
                      updateHighlight(h.id, "title", e.target.value)
                    }
                    placeholder="Headlined Afro Nation Portugal"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`highlight-description-${h.id}`}>
                    Description (optional)
                  </Label>
                  <Textarea
                    id={`highlight-description-${h.id}`}
                    value={h.description ?? ""}
                    onChange={(e) =>
                      updateHighlight(h.id, "description", e.target.value)
                    }
                    placeholder="Additional details..."
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isPending}
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{h.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{h.year}</p>
                  {h.description && (
                    <p className="mt-1 text-xs text-gray-400">
                      {h.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditId(h.id)}
                    className="text-gray-400 hover:text-white"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHighlight(h.id)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {highlights.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/2 py-12 text-center">
          <Trophy className="h-8 w-8 text-gray-400" />
          <p className="mt-3 text-sm font-medium text-white">
            No career highlights yet
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Add your key milestones and achievements to build credibility.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Professional Team Tab ─────────────────────────────────────────────────────

function TeamTab({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [managerName, setManagerName] = useState(profile.managerName);
  const [managerEmail, setManagerEmail] = useState(profile.managerEmail);
  const [managerPhone, setManagerPhone] = useState(profile.managerPhone);
  const [agentName, setAgentName] = useState(profile.agentName);
  const [agentAgency, setAgentAgency] = useState(profile.agentAgency);
  const [agentEmail, setAgentEmail] = useState(profile.agentEmail);

  const isPremium = profile.plan === "PREMIUM";

  function handleSave() {
    startTransition(async () => {
      const result = await updateDjProfile({
        managerName: managerName.trim() || null,
        managerEmail: managerEmail.trim() || null,
        managerPhone: managerPhone.trim() || null,
        agentName: agentName.trim() || null,
        agentAgency: agentAgency.trim() || null,
        agentEmail: agentEmail.trim() || null,
      });
      if ("error" in result) toast.error(result.error);
      else toast.success("Professional Team updated.");
    });
  }

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10">
          <Crown className="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Premium Feature</h3>
          <p className="mt-2 text-sm text-gray-400">
            Add your manager and booking agent details to your profile with a
            Premium plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-white">Professional Team</h3>
        <p className="text-xs text-gray-400">
          Add your manager and booking agent details.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Manager */}
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Manager
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="managerName">Name</Label>
                <Input
                  id="managerName"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Marcus Osei"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="managerEmail">Email</Label>
                <Input
                  id="managerEmail"
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="manager@email.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="managerPhone">Phone</Label>
                <Input
                  id="managerPhone"
                  type="tel"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="+44 7700 900123"
                />
              </div>
            </div>
          </div>

          {/* Booking Agent */}
          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Booking Agent
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="agentName">Name</Label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Sophie Laurent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="agentAgency">Agency</Label>
                <Input
                  id="agentAgency"
                  value={agentAgency}
                  onChange={(e) => setAgentAgency(e.target.value)}
                  placeholder="Rhythm Agency"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="agentEmail">Email</Label>
                <Input
                  id="agentEmail"
                  type="email"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  placeholder="agent@email.com"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Professional Team"}
        </Button>
      </div>
    </div>
  );
}
