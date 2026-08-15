"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DjReviewBadge } from "@/components/badge/DjReviewBadge";

interface BadgeData {
  dj: {
    slug: string;
    stageName: string;
    avatar: string | null;
  };
  stats: {
    avgRating: number;
    reviewCount: number;
  };
  config: {
    theme: "light" | "dark";
    size: "small" | "medium" | "large";
    showRating: boolean;
    showCount: boolean;
  };
  profileUrl: string;
}

export default function BadgePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const slug = params.slug as string;
  const theme = (searchParams.get("theme") as "light" | "dark") || "dark";
  const size =
    (searchParams.get("size") as "small" | "medium" | "large") || "medium";

  useEffect(() => {
    async function fetchBadgeData() {
      try {
        const response = await fetch(
          `/api/djs/${slug}/badge?theme=${theme}&size=${size}`,
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setBadgeData(data);
      } catch (error) {
        console.error("Error fetching badge data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBadgeData();
  }, [slug, theme, size]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://djscovery.com";
  const embedCode = `<script src="${baseUrl}/embed/badge.js" data-dj-slug="${slug}" data-theme="${theme}" data-size="${size}"></script>`;

  function handleCopy() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function updateUrl(newTheme: string, newSize: string) {
    const params = new URLSearchParams();
    params.set("theme", newTheme);
    params.set("size", newSize);
    window.history.pushState({}, "", `?${params.toString()}`);
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-gray-900 to-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!badgeData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-gray-900 to-gray-950">
        <div className="text-gray-400">Failed to load badge data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-gray-950 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Review Badge for {badgeData.dj.stageName}
          </h1>
          <p className="text-gray-400">
            Embed this badge on your website to showcase your reviews
          </p>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Preview</h2>
            <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-800/30 p-8">
              <DjReviewBadge
                slug={slug}
                theme={theme}
                size={size}
                showRating
                showCount
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Embed Code
            </h2>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg bg-gray-950 p-4 text-sm text-gray-300">
                <code>{embedCode}</code>
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Customization Options
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Theme
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateUrl("light", size)}
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateUrl("dark", size)}
                  >
                    Dark
                  </Button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Size
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={size === "small" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateUrl(theme, "small")}
                  >
                    Small
                  </Button>
                  <Button
                    variant={size === "medium" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateUrl(theme, "medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={size === "large" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateUrl(theme, "large")}
                  >
                    Large
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Current Stats
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gray-800/50 p-4">
                <div className="text-sm text-gray-400">Average Rating</div>
                <div className="text-2xl font-bold text-amber-400">
                  {badgeData.stats.avgRating.toFixed(1)} / 5
                </div>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-4">
                <div className="text-sm text-gray-400">Total Reviews</div>
                <div className="text-2xl font-bold text-white">
                  {badgeData.stats.reviewCount}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <a
                href={badgeData.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                View Full Profile
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
