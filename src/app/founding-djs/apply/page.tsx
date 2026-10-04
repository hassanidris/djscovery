"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createFoundingApplication } from "@/lib/actions/founding-applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FoundingDJsApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    stageName: "",
    portfolioLinks: ["", "", ""], // 3 slots for portfolio/social links
  });

  const [utmParams, setUtmParams] = useState({
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });

  useEffect(() => {
    setUtmParams({
      utmSource: searchParams.get("utm_source") || "",
      utmMedium: searchParams.get("utm_medium") || "",
      utmCampaign: searchParams.get("utm_campaign") || "",
    });

    const email = searchParams.get("email");
    const resumeToken = searchParams.get("resume_token");
    if (email && resumeToken) {
      setFormData((prev) => ({ ...prev, email }));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePortfolioLinkChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newLinks = [...prev.portfolioLinks];
      newLinks[index] = value;
      return { ...prev, portfolioLinks: newLinks };
    });
  };

  const handleSaveAndResume = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await createFoundingApplication({
        email: formData.email,
        name: formData.name,
        stageName: formData.stageName,
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
    setLoading(true);
    setError(null);

    try {
      const result = await createFoundingApplication({
        email: formData.email,
        name: formData.name,
        stageName: formData.stageName,
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
                We've sent a resume link to your email. You can use it to
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
            Join the first 100 founding DJs on Djscovery. Just a few details to
            get started.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/2 p-8">
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

          <div className="flex flex-col gap-2">
            <Label>
              Portfolio & Social Links{" "}
              <span className="text-h_redLight">*</span>
            </Label>
            <Input
              type="url"
              value={formData.portfolioLinks[0]}
              onChange={(e) => handlePortfolioLinkChange(0, e.target.value)}
              placeholder="https://soundcloud.com/your-mix (required)"
              className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
              required
            />
            <Input
              type="url"
              value={formData.portfolioLinks[1]}
              onChange={(e) => handlePortfolioLinkChange(1, e.target.value)}
              placeholder="https://instagram.com/your-dj (optional)"
              className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
            <Input
              type="url"
              value={formData.portfolioLinks[2]}
              onChange={(e) => handlePortfolioLinkChange(2, e.target.value)}
              placeholder="https://mixcloud.com/your-dj (optional)"
              className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
            <p className="text-xs text-gray-500">
              Share your SoundCloud, Mixcloud, Instagram, or other
              portfolio/social links
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/2 p-4">
            <p className="text-sm text-gray-400">
              If approved, you'll complete your full profile with genres,
              experience, location, and media uploads.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              onClick={handleSaveAndResume}
              disabled={loading}
              variant="outline"
              className="text-h_redLight"
            >
              {loading ? "Saving..." : "Save & Resume Later"}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
