import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import {
  faInstagram,
  faTiktok,
  faYoutube,
  faSoundcloud,
  faSpotify,
  faApple,
} from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// ── Shared types ────────────────────────────────────────────────────────────────

export type SocialLink = { platform: string; url: string };

export type ReviewItem = {
  id: number;
  rating: number;
  review: string;
  date: string;
  user: { name: string; image: string };
};

export type VenueItem = {
  name: string;
  city: string;
  count: number;
  country?: string;
};

export type EventItem = {
  id: number;
  title: string;
  date: string;
  venue: string;
  city: string;
  status?: string;
  country?: string;
};

export type HeroStat = {
  val: string;
  label: string;
  icon: React.ElementType;
  amber?: boolean;
  green?: boolean;
};

// ── Constants ───────────────────────────────────────────────────────────────────

export const SOCIAL_ICONS: Record<string, IconDefinition> = {
  instagram: faInstagram,
  tiktok: faTiktok,
  youtube: faYoutube,
  soundcloud: faSoundcloud,
  spotify: faSpotify,
  website: faGlobe,
  apple: faApple,
  anghami: faGlobe,
};

export const REVIEWER_AVATARS = [
  "/rated-1.webp",
  "/rated-2.webp",
  "/rated-3.webp",
];

// ── Utility functions ───────────────────────────────────────────────────────────

export function getPlatformFromUrl(url: string): string {
  if (url.includes("soundcloud")) return "SoundCloud";
  if (url.includes("mixcloud")) return "Mixcloud";
  if (url.includes("spotify")) return "Spotify";
  if (url.includes("youtube")) return "YouTube";
  return "External";
}

export function formatPlays(plays: number): string {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}k`;
  return String(plays);
}

// ── Shared components ───────────────────────────────────────────────────────────

export function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            size === "lg" ? "h-4 w-4" : "h-3 w-3",
            i <= Math.round(rating) ? "text-amber-400" : "text-gray-700",
          )}
        />
      ))}
    </div>
  );
}

export function SectionHeading({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="font-heading text-lg font-semibold tracking-tight text-white md:text-xl">
        {children}
      </h2>
      {sub && (
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{sub}</p>
      )}
    </div>
  );
}
