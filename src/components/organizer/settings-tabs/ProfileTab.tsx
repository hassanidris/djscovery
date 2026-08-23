"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Camera, Trash2 } from "lucide-react";
import {
  updateOrganizerProfile,
  getCitiesByCountry,
} from "@/lib/actions/profile";
import {
  uploadOrganizerLogo,
  uploadOrganizerCover,
  deleteOrganizerImage,
} from "@/lib/actions/organizer-upload";
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
import type { ProfileData, Country, City } from "./types";

const ORGANIZER_TYPES = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "COMPANY", label: "Company" },
  { value: "VENUE", label: "Venue" },
  { value: "AGENCY", label: "Agency" },
  { value: "FESTIVAL", label: "Festival" },
] as const;

export default function ProfileTab({
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
