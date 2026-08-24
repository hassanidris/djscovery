"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDjProfile, getCitiesByCountry } from "@/lib/actions/profile";
import { getGenres } from "@/lib/actions/genre";
import { uploadDjMediaTemp } from "@/lib/actions/dj-upload";
import { Loader2 } from "lucide-react";
import { CURRENCIES } from "@/config/currencies";
import { resolveCurrencyForCountry } from "@/config/country-currencies";
import {
  CreateDjProfileSchema,
  CreateDjProfileInput,
} from "@/lib/validations/dj-profile";

import { AvatarSection } from "./become-dj/AvatarSection";
import { CoverImageSection } from "./become-dj/CoverImageSection";
import { BasicInfoSection } from "./become-dj/BasicInfoSection";
import { DjTypeSection } from "./become-dj/DjTypeSection";
import { GenresSection } from "./become-dj/GenresSection";
import {
  LocationSection,
  type Country,
  type City,
} from "./become-dj/LocationSection";
import { SocialMediaSection } from "./become-dj/SocialMediaSection";
import { ExperienceSection } from "./become-dj/ExperienceSection";
import { FeePricingSection } from "./become-dj/FeePricingSection";
import { ContactInfoSection } from "./become-dj/ContactInfoSection";
import { MediaSection } from "./become-dj/MediaSection";

interface BecomeDjFormProps {
  countries: Country[];
  userId: string;
}

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
  const countryId = useWatch({ control, name: "countryId" });
  const djTypes = useWatch({ control, name: "djTypes" });
  const genreNames = useWatch({ control, name: "genreNames" });
  const socialLinks = useWatch({ control, name: "socialLinks" });
  const bio = useWatch({ control, name: "bio" });

  // Avatar (file upload - not in form schema)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Cover image (file upload - not in form schema)
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Location cities
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const cityRequestId = useRef(0);

  // Genres
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

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

  async function handleCountryChange(id: number) {
    setValue("countryId", id || 0);
    setValue("cityId", 0);
    setCities([]);

    // Auto-set currency based on selected country (with USD fallback)
    if (id && countries.length > 0) {
      const selectedCountry = countries.find((c) => c.id === id);
      if (selectedCountry) {
        const availableCodes = new Set(CURRENCIES.map((c) => c.code));
        const currency = resolveCurrencyForCountry(
          selectedCountry.name,
          availableCodes,
        );
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

  function toggleDjType(value: string) {
    const current = djTypes;
    if (current.includes(value)) {
      setValue(
        "djTypes",
        current.filter((type) => type !== value),
      );
    } else {
      setValue("djTypes", [...current, value]);
    }
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
      <AvatarSection
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        avatarPreview={avatarPreview}
        setAvatarPreview={setAvatarPreview}
      />

      <CoverImageSection
        coverFile={coverFile}
        setCoverFile={setCoverFile}
        coverPreview={coverPreview}
        setCoverPreview={setCoverPreview}
      />

      <BasicInfoSection
        register={register}
        errors={errors}
        stageName={stageName}
        bio={bio ?? ""}
        slugPreview={slugPreview}
      />

      <DjTypeSection
        djTypes={djTypes}
        toggleDjType={toggleDjType}
        error={errors.djTypes}
      />

      <GenresSection
        genreNames={genreNames}
        setGenres={(genres) => setValue("genreNames", genres)}
        availableGenres={availableGenres}
        setAvailableGenres={setAvailableGenres}
        error={errors.genreNames}
      />

      <LocationSection
        register={register}
        countries={countries}
        countryId={countryId}
        cities={cities}
        loadingCities={loadingCities}
        handleCountryChange={handleCountryChange}
        errors={errors}
      />

      <SocialMediaSection
        socialLinks={socialLinks}
        addSocialLink={addSocialLink}
        removeSocialLink={removeSocialLink}
        updateSocialLink={updateSocialLink}
        error={errors.socialLinks}
      />

      <ExperienceSection register={register} errors={errors} />

      <FeePricingSection register={register} errors={errors} />

      <ContactInfoSection register={register} errors={errors} />

      <MediaSection
        galleryFiles={galleryFiles}
        setGalleryFiles={setGalleryFiles}
        videoLinks={videoLinks}
        setVideoLinks={setVideoLinks}
        audioLinks={audioLinks}
        setAudioLinks={setAudioLinks}
      />

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
