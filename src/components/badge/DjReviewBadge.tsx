"use client";

import { Star, Award } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

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

interface DjReviewBadgeProps {
  slug: string;
  theme?: "light" | "dark";
  size?: "small" | "medium" | "large";
  showRating?: boolean;
  showCount?: boolean;
  className?: string;
}

const SIZE_STYLES = {
  small: {
    container: "px-3 py-1.5 text-xs",
    star: "h-3 w-3",
    award: "h-3 w-3",
  },
  medium: {
    container: "px-4 py-2 text-sm",
    star: "h-4 w-4",
    award: "h-4 w-4",
  },
  large: {
    container: "px-5 py-3 text-base",
    star: "h-5 w-5",
    award: "h-5 w-5",
  },
};

const THEME_STYLES = {
  light: {
    container: "bg-white border-gray-200 text-gray-900",
    text: "text-gray-600",
    accent: "text-amber-500",
    hover: "hover:bg-gray-50",
  },
  dark: {
    container: "bg-gray-900 border-gray-700 text-white",
    text: "text-gray-300",
    accent: "text-amber-400",
    hover: "hover:bg-gray-800",
  },
};

export function DjReviewBadge({
  slug,
  theme = "dark",
  size = "medium",
  showRating = true,
  showCount = true,
  className = "",
}: DjReviewBadgeProps) {
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchBadgeData() {
      try {
        const params = new URLSearchParams({
          theme,
          size,
          showRating: showRating.toString(),
          showCount: showCount.toString(),
        });

        const response = await fetch(
          `/api/djs/${slug}/badge?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch badge data");
        }

        const data = await response.json();
        setBadgeData(data);
      } catch (err) {
        console.error("Error loading badge:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBadgeData();
  }, [slug, theme, size, showRating, showCount]);

  if (loading) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-lg border ${SIZE_STYLES[size].container} ${THEME_STYLES[theme].container} ${className}`}
      >
        <div className="h-4 w-4 animate-pulse rounded-full bg-gray-300" />
        <div className="h-3 w-16 animate-pulse rounded bg-gray-300" />
      </div>
    );
  }

  if (error || !badgeData) {
    return null;
  }

  const sizeStyles = SIZE_STYLES[size];
  const themeStyles = THEME_STYLES[theme];

  return (
    <a
      href={badgeData.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg border transition-colors ${sizeStyles.container} ${themeStyles.container} ${themeStyles.hover} ${className}`}
      title={`View ${badgeData.dj.stageName}'s reviews on Djscovery`}
    >
      {badgeData.dj.avatar && (
        <Image
          src={badgeData.dj.avatar}
          alt={badgeData.dj.stageName}
          width={20}
          height={20}
          className="h-5 w-5 rounded-full object-cover"
        />
      )}
      {badgeData.config.showRating && (
        <div className="flex items-center gap-1">
          <Star
            className={`fill-current ${sizeStyles.star} ${themeStyles.accent}`}
          />
          <span className="font-semibold">{badgeData.stats.avgRating}</span>
        </div>
      )}
      {badgeData.config.showCount && (
        <div className="flex items-center gap-1">
          <Award className={`sizeStyles.award ${themeStyles.text}`} />
          <span className={themeStyles.text}>
            {badgeData.stats.reviewCount} review
            {badgeData.stats.reviewCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </a>
  );
}
