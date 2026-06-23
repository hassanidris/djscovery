"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  Loader2,
  Camera,
  Plus,
  Trash2,
  Globe,
  Lock,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  updateOrganizerProfile,
  getCitiesByCountry,
} from "@/lib/actions/profile";
import {
  uploadOrganizerLogo,
  uploadOrganizerCover,
  deleteOrganizerImage,
} from "@/lib/actions/organizer-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ───────────────────────────────────────────────────────────────────

type SocialLink = { platform: string; url: string };

interface ProfileData {
  displayName: string;
  organizerType: string;
  bio: string;
  logoUrl: string;
  coverImageUrl: string;
  website: string;
  contactEmail: string;
  phone: string;
  countryId: number | null;
  cityId: number | null;
  countryName: string;
  cityName: string;
  socialLinks: SocialLink[];
  slug: string;
}

interface Country {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface Props {
  profile: ProfileData;
  countries: Country[];
  initialCities: City[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ORGANIZER_TYPES = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "COMPANY", label: "Company" },
  { value: "VENUE", label: "Venue" },
  { value: "AGENCY", label: "Agency" },
  { value: "FESTIVAL", label: "Festival" },
] as const;

const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "website", label: "Website" },
] as const;

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrganizerSettingsTabs({
  profile,
  countries,
  initialCities,
}: Props) {
  return (
    <Tabs defaultValue="profile">
      {/* Info banner — distinguishes organizer profile from personal account */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
        <p className="text-xs text-blue-300">
          This is your <strong>public organizer profile</strong> — what DJs see
          when you post a gig. For security settings (password), visit{" "}
          <a
            href="/account/settings"
            className="underline underline-offset-2 hover:text-blue-200"
          >
            Account Settings
          </a>
          .
        </p>
      </div>

      <TabsList variant="line" className="mb-8 w-full justify-start">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="social">Social Links</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab
          profile={profile}
          countries={countries}
          initialCities={initialCities}
        />
      </TabsContent>

      <TabsContent value="contact">
        <ContactTab profile={profile} />
      </TabsContent>

      <TabsContent value="social">
        <SocialTab profile={profile} />
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

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [organizerType, setOrganizerType] = useState(profile.organizerType);
  const [bio, setBio] = useState(profile.bio);
  const [countryId, setCountryId] = useState<number | null>(profile.countryId);
  const [cityId, setCityId] = useState<number | null>(profile.cityId);
  const [cities, setCities] = useState<City[]>(initialCities);
  const [loadingCities, setLoadingCities] = useState(false);
  const cityRequestId = useRef(0);

  const [logoPreview, setLogoPreview] = useState(profile.logoUrl);
  const [coverPreview, setCoverPreview] = useState(profile.coverImageUrl);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function handleCountryChange(value: string) {
    const id = value ? Number(value) : null;
    setCountryId(id);
    setCityId(null);
    setCities([]);
    if (!id) return;
    const reqId = ++cityRequestId.current;
    setLoadingCities(true);
    try {
      const result = await getCitiesByCountry(id);
      if (reqId === cityRequestId.current) setCities(result);
    } finally {
      if (reqId === cityRequestId.current) setLoadingCities(false);
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadOrganizerLogo(fd);
      if ("error" in result) {
        toast.error(result.error);
        setLogoPreview(profile.logoUrl);
      } else {
        setLogoPreview(result.url);
        toast.success("Avatar updated.");
      }
    } catch (err) {
      console.error("[uploadOrganizerLogo] unexpected error:", err);
      toast.error("Unexpected error uploading avatar. Check the console.");
      setLogoPreview(profile.logoUrl);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadOrganizerCover(fd);
      if ("error" in result) {
        toast.error(result.error);
        setCoverPreview(profile.coverImageUrl);
      } else {
        setCoverPreview(result.url);
        toast.success("Cover image updated.");
      }
    } catch (err) {
      console.error("[uploadOrganizerCover] unexpected error:", err);
      toast.error("Unexpected error uploading cover. Check the console.");
      setCoverPreview(profile.coverImageUrl);
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleRemoveLogo() {
    setUploadingLogo(true);
    try {
      const result = await deleteOrganizerImage("logoUrl");
      if ("error" in result) toast.error(result.error);
      else {
        setLogoPreview("");
        toast.success("Avatar removed.");
      }
    } catch (err) {
      console.error("[deleteOrganizerImage logo] unexpected error:", err);
      toast.error("Unexpected error removing avatar.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleRemoveCover() {
    setUploadingCover(true);
    try {
      const result = await deleteOrganizerImage("coverImageUrl");
      if ("error" in result) toast.error(result.error);
      else {
        setCoverPreview("");
        toast.success("Cover image removed.");
      }
    } catch (err) {
      console.error("[deleteOrganizerImage cover] unexpected error:", err);
      toast.error("Unexpected error removing cover.");
    } finally {
      setUploadingCover(false);
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateOrganizerProfile({
        displayName,
        organizerType: organizerType as
          | "INDIVIDUAL"
          | "COMPANY"
          | "VENUE"
          | "AGENCY"
          | "FESTIVAL",
        bio: bio || null,
        countryId,
        cityId,
      });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated.");
        if (result.newSlug) router.push("/organizer/settings");
      }
    });
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Cover image */}
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
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">No cover image</p>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            <Button
              type="button"
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
            {coverPreview && !uploadingCover && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemoveCover}
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          JPEG, PNG or WebP · max 10 MB
        </p>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleCoverChange}
        />
      </div>

      {/* Organizer Avatar / Logo */}
      <div className="flex flex-col gap-2">
        <div>
          <Label>Profile Avatar / Logo</Label>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Upload your logo or avatar — shown on gig listings and your public
            profile. JPEG, PNG or WebP · max 5 MB.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white/5 ring-2 ring-white/10">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                <Camera className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
            >
              {uploadingLogo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {logoPreview ? "Change Avatar / Logo" : "Upload Avatar / Logo"}
            </Button>
            {logoPreview && !uploadingLogo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleRemoveLogo}
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleLogoChange}
        />
      </div>

      {/* Business / Brand Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">
          Business / Brand Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={80}
        />
        <p className="text-muted-foreground text-xs">
          Shown publicly on gig listings and your organizer profile. Changing
          this regenerates your profile URL.
        </p>
      </div>

      {/* Organizer type */}
      <div className="flex flex-col gap-2">
        <Label>Organizer Type</Label>
        <Select value={organizerType} onValueChange={setOrganizerType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            {ORGANIZER_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={600}
          placeholder="Describe who you are and what kind of events you organise..."
          className="resize-none"
        />
        <p className="text-muted-foreground text-right text-xs">
          {bio.length}/600
        </p>
      </div>

      {/* Business Location */}
      <div>
        <p className="mb-3 text-sm font-medium text-white">Business Location</p>
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
              <div className="border-input text-muted-foreground flex items-center gap-2 rounded-md border bg-transparent px-3 py-2 text-sm">
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
      </div>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending || !displayName.trim()}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}

// ─── Contact Tab ─────────────────────────────────────────────────────────────

function ContactTab({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [website, setWebsite] = useState(profile.website);
  const [contactEmail, setContactEmail] = useState(profile.contactEmail);
  const [phone, setPhone] = useState(profile.phone);

  function handleSave() {
    startTransition(async () => {
      const result = await updateOrganizerProfile({
        website: website || null,
        contactEmail: contactEmail || null,
        phone: phone || null,
      });
      if ("error" in result) toast.error(result.error);
      else toast.success("Contact details updated.");
    });
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Website — public */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="website">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Website
            </span>
          </Label>
          <Badge
            variant="outline"
            className="border-green-500/40 text-[10px] text-green-400"
          >
            Public
          </Badge>
        </div>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourvenue.com"
          maxLength={200}
        />
        <p className="text-muted-foreground text-xs">
          Shown publicly as the primary way DJs can contact you.
        </p>
      </div>

      {/* Contact email — private */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="contactEmail">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Contact Email
            </span>
          </Label>
          <Badge variant="secondary" className="text-[10px]">
            Private
          </Badge>
        </div>
        <Input
          id="contactEmail"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="bookings@yourvenue.com"
          maxLength={100}
        />
        <p className="text-muted-foreground text-xs">
          Never shown publicly. Reserved for future direct booking features.
        </p>
      </div>

      {/* Phone — private */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="phone">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Phone
            </span>
          </Label>
          <Badge variant="secondary" className="text-[10px]">
            Private
          </Badge>
        </div>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+46 70 000 0000"
          maxLength={30}
        />
        <p className="text-muted-foreground text-xs">
          Never shown publicly. Reserved for future verified-contact features.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Contact"}
        </Button>
      </div>
    </div>
  );
}

// ─── Social Links Tab ─────────────────────────────────────────────────────────

function SocialTab({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [links, setLinks] = useState<SocialLink[]>(
    profile.socialLinks.length > 0
      ? profile.socialLinks
      : [{ platform: "instagram", url: "" }],
  );

  function addLink() {
    if (links.length >= 6) return;
    const usedPlatforms = new Set(links.map((l) => l.platform));
    const next = SOCIAL_PLATFORMS.find((p) => !usedPlatforms.has(p.value));
    setLinks((prev) => [
      ...prev,
      { platform: next?.value ?? "instagram", url: "" },
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
    const validLinks = links.filter((l) => l.url.trim());
    startTransition(async () => {
      const result = await updateOrganizerProfile({
        socialLinks: validLinks as {
          platform:
            | "instagram"
            | "linkedin"
            | "facebook"
            | "tiktok"
            | "youtube"
            | "website";
          url: string;
        }[],
      });
      if ("error" in result) toast.error(result.error);
      else toast.success("Social links updated.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            Add links to your social media pages.
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            All links are shown publicly on your profile. Maximum 6.
          </p>
        </div>
        {links.length < 6 && (
          <Button type="button" variant="outline" size="sm" onClick={addLink}>
            <Plus className="h-4 w-4" /> Add Link
          </Button>
        )}
      </div>

      {links.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
          <ExternalLink className="text-muted-foreground mx-auto mb-2 h-6 w-6" />
          <p className="text-muted-foreground text-sm">No social links yet.</p>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={addLink}
            className="mt-1"
          >
            Add your first link
          </Button>
        </div>
      )}

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
              className="text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Social Links"}
        </Button>
      </div>
    </div>
  );
}
