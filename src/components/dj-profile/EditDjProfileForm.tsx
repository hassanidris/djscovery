"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateDjProfile, getCitiesByCountry } from "@/lib/actions/profile";
import { getGenres } from "@/lib/actions/genre";
import { getMediaLimit, normalisePlan } from "@/lib/plan-features";
import { COUNTRY_CURRENCIES } from "@/config/country-currencies";
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

import { ProfileImagesSection } from "./edit-form/ProfileImagesSection";
import { BasicInfoSection } from "./edit-form/BasicInfoSection";
import { ExperienceSection } from "./edit-form/ExperienceSection";
import { LocationSection } from "./edit-form/LocationSection";
import { GenresSpecialtiesSection } from "./edit-form/GenresSpecialtiesSection";
import { SocialLinksSection } from "./edit-form/SocialLinksSection";
import { BookingFeesSection } from "./edit-form/BookingFeesSection";
import { MediaLibrarySection } from "./edit-form/MediaLibrarySection";
import { FeaturedPerformanceSection } from "./edit-form/FeaturedPerformanceSection";
import { TeamContactsSection } from "./edit-form/TeamContactsSection";
import { AvailabilityCalendarSection } from "./edit-form/AvailabilityCalendarSection";
import type {
  City,
  AvailabilityDay,
  EditDjProfileFormProps as Props,
} from "./edit-form/types";

export default function EditDjProfileForm({
  profile,
  countries,
  initialCities,
  userId,
  allMedia,
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plan = normalisePlan(profile.plan);

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
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

  // Fetch genres on mount
  useEffect(() => {
    getGenres().then(setAvailableGenres);
  }, []);

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
  const [mediaChanged, setMediaChanged] = useState(false);

  // Team
  const [managerName, setManagerName] = useState(profile.managerName);
  const [managerEmail, setManagerEmail] = useState(profile.managerEmail);
  const [managerPhone, setManagerPhone] = useState(profile.managerPhone);
  const [agentName, setAgentName] = useState(profile.agentName);
  const [agentAgency, setAgentAgency] = useState(profile.agentAgency);
  const [agentEmail, setAgentEmail] = useState(profile.agentEmail);

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

  // Featured performance
  const [featuredPerformanceUrl, setFeaturedPerformanceUrl] = useState(
    profile.featuredPerformanceUrl,
  );
  const [featuredPerformanceContext, setFeaturedPerformanceContext] = useState(
    profile.featuredPerformanceContext,
  );

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
    availabilityTimezone !== profile.availabilityTimezone ||
    availabilityMonth !== profile.availabilityMonth ||
    JSON.stringify(availabilityDays) !==
      JSON.stringify(profile.availabilityDays) ||
    featuredPerformanceUrl !== (profile.featuredPerformanceUrl || "") ||
    featuredPerformanceContext !== (profile.featuredPerformanceContext || "") ||
    mediaChanged;

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

  function toggleDjType(type: string) {
    setDjTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  const isPremium = profile.plan === "PREMIUM";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (isUploadingAvatar || isUploadingCover) return;
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
        // Availability
        availabilityTimezone: availabilityTimezone.trim() || null,
        availabilityMonth: availabilityMonth.trim() || null,
        availabilityDays: availabilityDays,
        // Featured performance
        featuredPerformanceUrl: featuredPerformanceUrl.trim() || null,
        featuredPerformanceContext: featuredPerformanceContext.trim() || null,
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
          <p className="mt-0.5 text-sm text-gray-400">
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
        <ProfileImagesSection
          avatarUrl={avatarUrl}
          coverImageUrl={coverImageUrl}
          onAvatarChange={setAvatarUrl}
          onCoverChange={setCoverImageUrl}
          onUploadingChange={(avatar, cover) => {
            setIsUploadingAvatar(avatar);
            setIsUploadingCover(cover);
          }}
        />

        <BasicInfoSection
          stageName={stageName}
          setStageName={setStageName}
          bio={bio}
          setBio={setBio}
          submitted={submitted}
          stageNameError={stageNameError}
        />

        <ExperienceSection
          experienceYears={experienceYears}
          setExperienceYears={setExperienceYears}
        />

        <LocationSection
          countries={countries}
          cities={cities}
          countryId={countryId}
          cityId={cityId}
          setCountryId={setCountryId}
          setCityId={setCityId}
          submitted={submitted}
          countryError={countryError}
        />

        <GenresSpecialtiesSection
          genreNames={genreNames}
          setGenreNames={setGenreNames}
          availableGenres={availableGenres}
          djTypes={djTypes}
          toggleDjType={toggleDjType}
          submitted={submitted}
          genresError={genresError}
          djTypesError={djTypesError}
        />

        <SocialLinksSection
          socialLinks={socialLinks}
          setSocialLinks={setSocialLinks}
        />

        <BookingFeesSection
          bookingEmail={bookingEmail}
          setBookingEmail={setBookingEmail}
          bookingPhone={bookingPhone}
          setBookingPhone={setBookingPhone}
          feeMin={feeMin}
          setFeeMin={setFeeMin}
          feeMax={feeMax}
          setFeeMax={setFeeMax}
          feeCurrency={feeCurrency}
          setFeeCurrency={setFeeCurrency}
          currencyAutoSet={currencyAutoSet}
          setCurrencyAutoSet={setCurrencyAutoSet}
        />

        <MediaLibrarySection
          profileId={profile.id}
          plan={plan}
          initialMedia={allMedia}
          onMediaChange={setMediaChanged}
        />

        <FeaturedPerformanceSection
          featuredPerformanceUrl={featuredPerformanceUrl}
          setFeaturedPerformanceUrl={setFeaturedPerformanceUrl}
          featuredPerformanceContext={featuredPerformanceContext}
          setFeaturedPerformanceContext={setFeaturedPerformanceContext}
        />

        <TeamContactsSection
          isPremium={isPremium}
          managerName={managerName}
          setManagerName={setManagerName}
          managerEmail={managerEmail}
          setManagerEmail={setManagerEmail}
          managerPhone={managerPhone}
          setManagerPhone={setManagerPhone}
          agentName={agentName}
          setAgentName={setAgentName}
          agentAgency={agentAgency}
          setAgentAgency={setAgentAgency}
          agentEmail={agentEmail}
          setAgentEmail={setAgentEmail}
        />

        <AvailabilityCalendarSection
          isPremium={isPremium}
          availabilityMonth={availabilityMonth}
          setAvailabilityMonth={setAvailabilityMonth}
          availabilityTimezone={availabilityTimezone}
          setAvailabilityTimezone={setAvailabilityTimezone}
          availabilityDays={availabilityDays}
          setAvailabilityDays={setAvailabilityDays}
        />

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            <span className="text-h_redLight">*</span> Required fields
          </p>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isUploadingAvatar ||
              isUploadingCover ||
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
