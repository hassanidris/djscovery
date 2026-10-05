"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createFoundingApplication } from "@/lib/actions/founding-applications";
import { getCitiesForCountry, getCountries } from "@/lib/actions/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function FoundingDJsApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeEmail = searchParams.get("email");
  const resumeToken = searchParams.get("resume_token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [countries, setCountries] = useState<
    Array<{ id: number; name: string; code: string }>
  >([]);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  const [formData, setFormData] = useState({
    email: resumeEmail && resumeToken ? resumeEmail : "",
    name: "",
    stageName: "",
    countryId: "",
    cityId: "",
    portfolioLinks: [""],
  });

  useEffect(() => {
    let active = true;
    getCountries()
      .then((items) => {
        if (active) setCountries(items);
      })
      .catch(() => {
        if (active)
          setError("Unable to load countries. Please refresh and try again.");
      })
      .finally(() => {
        if (active) setLoadingCountries(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!formData.countryId) {
      return () => {
        active = false;
      };
    }

    getCitiesForCountry(Number(formData.countryId))
      .then((items) => {
        if (active) setCities(items);
      })
      .catch(() => {
        if (active)
          setError("Unable to load cities for this country. Please try again.");
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });
    return () => {
      active = false;
    };
  }, [formData.countryId]);

  const utmParams = {
    utmSource: searchParams.get("utm_source") || "",
    utmMedium: searchParams.get("utm_medium") || "",
    utmCampaign: searchParams.get("utm_campaign") || "",
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (countryId: string) => {
    setFormData((prev) => ({ ...prev, countryId, cityId: "" }));
    setCities([]);
    setLoadingCities(Boolean(countryId));
  };

  const handlePortfolioLinkChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newLinks = [...prev.portfolioLinks];
      newLinks[index] = value;
      return { ...prev, portfolioLinks: newLinks };
    });
  };

  const handleSaveAndResume = async () => {
    if (!formData.countryId || !formData.cityId) {
      setError("Please select your country and city.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await createFoundingApplication({
        email: formData.email,
        name: formData.name,
        stageName: formData.stageName,
        countryId: Number(formData.countryId),
        cityId: Number(formData.cityId),
        portfolioLinks: formData.portfolioLinks.filter(
          (link) => link.trim() !== "",
        ),
        ...utmParams,
        saveOnly: true,
      });

      if (result.success) {
        setSaveSuccess(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.countryId || !formData.cityId) {
      setError("Please select your country and city.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await createFoundingApplication({
        email: formData.email,
        name: formData.name,
        stageName: formData.stageName,
        countryId: Number(formData.countryId),
        cityId: Number(formData.cityId),
        portfolioLinks: formData.portfolioLinks.filter(
          (link) => link.trim() !== "",
        ),
        ...utmParams,
        saveOnly: false,
      });

      if (result.success) {
        router.push("/founding-djs/success");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (saveSuccess) {
    return (
      <div className="from-h_charcoal flex min-h-screen items-center justify-center bg-linear-to-b to-black px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/2 px-8 py-16 text-center">
            <div className="bg-h_red/10 border-h_red/20 mx-auto flex size-16 items-center justify-center rounded-2xl border">
              <svg
                className="text-h_redLight h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-2xl text-white">
                Application Saved
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-gray-400">
                We&apos;ve sent a resume link to your email. You can use it to
                continue your application anytime within the next 48 hours.
              </p>
            </div>
            <Button
              onClick={() => router.push("/founding-djs")}
              variant="outline"
              className="text-h_redLight"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="from-h_charcoal min-h-screen bg-linear-to-b to-black px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Apply to Become a Founding DJ
          </h1>
          <p className="text-gray-400">
            Join the first 100 founding DJs on DJcovery. Just a few details to
            get started.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/2 p-8"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">
              Email Address <span className="text-h_redLight">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Full Name <span className="text-h_redLight">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
              className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="stageName">
              Stage Name <span className="text-h_redLight">*</span>
            </Label>
            <Input
              id="stageName"
              name="stageName"
              type="text"
              value={formData.stageName}
              onChange={handleInputChange}
              placeholder="Your DJ name"
              className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="countryId">
                Country <span className="text-h_redLight">*</span>
              </Label>
              <select
                id="countryId"
                name="countryId"
                value={formData.countryId}
                onChange={(event) => handleCountryChange(event.target.value)}
                required
                disabled={loadingCountries || countries.length === 0}
                className="focus:border-h_red/50 h-10 rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none disabled:opacity-60"
              >
                <option value="">
                  {loadingCountries ? "Loading countries…" : "Select a country"}
                </option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cityId">
                City <span className="text-h_redLight">*</span>
              </Label>
              <select
                id="cityId"
                name="cityId"
                value={formData.cityId}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    cityId: event.target.value,
                  }))
                }
                required
                disabled={
                  !formData.countryId || loadingCities || cities.length === 0
                }
                className="focus:border-h_red/50 h-10 rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none disabled:opacity-60"
              >
                <option value="">
                  {!formData.countryId
                    ? "Select a country first"
                    : loadingCities
                      ? "Loading cities…"
                      : cities.length === 0
                        ? "No cities available"
                        : "Select a city"}
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="portfolioLink-0">
              Portfolio & Social Links{" "}
              <span className="text-h_redLight">*</span>
            </Label>
            {formData.portfolioLinks.map((link, index) => (
              <Input
                key={index}
                id={`portfolioLink-${index}`}
                aria-label={`Portfolio or social link ${index + 1}`}
                type="url"
                value={link}
                onChange={(e) =>
                  handlePortfolioLinkChange(index, e.target.value)
                }
                placeholder={
                  index === 0
                    ? "https://soundcloud.com/your-mix (required)"
                    : "Add a portfolio or social link (optional)"
                }
                className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
                required={index === 0}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  portfolioLinks: [...prev.portfolioLinks, ""],
                }))
              }
              className="text-h_redLight w-fit"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add another link
            </Button>
            <p className="text-xs text-gray-500">
              Share your SoundCloud, Mixcloud, Instagram, or other
              portfolio/social links
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/2 p-4">
            <p className="text-sm text-gray-400">
              If approved, you&apos;ll complete your full profile with genres,
              experience, and media uploads.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              onClick={handleSaveAndResume}
              disabled={loading}
              variant="outline"
              className="text-h_redLight"
            >
              {loading ? "Saving..." : "Save & Resume Later"}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
