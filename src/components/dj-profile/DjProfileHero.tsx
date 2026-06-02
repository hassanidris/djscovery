import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faTiktok,
  faYoutube,
  faSoundcloud,
  faSpotify,
  faMixcloud,
} from "@fortawesome/free-brands-svg-icons";
import {
  faMapPin,
  faStar,
  faUsers,
  faCalendarDays,
  faUserPlus,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type SocialLink = {
  platform: string;
  url: string;
};

type Props = {
  stageName: string;
  avatar: string | null;
  coverImage: string | null;
  city?: string | null;
  country?: string | null;
  genres: string[];
  socialLinks: SocialLink[];
  avgRating: number;
  ratingCount: number;
  followerCount: number;
  eventsCount: number;
};

const SOCIAL_ICONS: Record<string, IconDefinition> = {
  instagram: faInstagram,
  tiktok: faTiktok,
  youtube: faYoutube,
  soundcloud: faSoundcloud,
  spotify: faSpotify,
  mixcloud: faMixcloud,
};

export default function DjProfileHero({
  stageName,
  avatar,
  coverImage,
  city,
  country,
  genres,
  socialLinks,
  avgRating,
  ratingCount,
  followerCount,
  eventsCount,
}: Props) {
  const location = [city, country].filter(Boolean).join(", ");

  return (
    <section className="w-full">
      {/* Cover Image */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <Image
          src={coverImage ?? "/noCover.png"}
          alt={`${stageName} cover`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-h_red/5 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Avatar + Name + Actions row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-14 sm:-mt-12 pb-5">
          {/* Avatar */}
          <div className="relative shrink-0 z-10">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-h_red ring-offset-2 ring-offset-black">
              <Image
                src={avatar ?? "/noAvatar.png"}
                alt={stageName}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Name + Location */}
          <div className="flex-1 min-w-0 pt-1 sm:pb-2">
            <h1 className="font-heading text-3xl md:text-4xl text-white leading-none">
              {stageName}
            </h1>
            {location && (
              <p className="text-gray-400 text-sm mt-2 flex items-center gap-1.5">
                <FontAwesomeIcon
                  icon={faMapPin}
                  className="h-3 w-3 text-h_red"
                />
                {location}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:pb-2">
            <Button
              disabled
              className="bg-h_red hover:bg-h_redDark text-white font-semibold disabled:opacity-40"
            >
              <FontAwesomeIcon
                icon={faUserPlus}
                className="h-3.5 w-3.5 mr-1.5"
              />
              Follow
            </Button>
            <Button
              disabled
              variant="outline"
              className="border-white/20 text-gray-300 hover:bg-white/5 disabled:opacity-40"
            >
              Book DJ
            </Button>
            <Button
              disabled
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white disabled:opacity-40"
              aria-label="Share profile"
            >
              <FontAwesomeIcon icon={faShareNodes} className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Genre Badges */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {genres.map((g) => (
              <Badge
                key={g}
                className="bg-h_redDark/50 text-red-100 border-0 h-6"
              >
                {g}
              </Badge>
            ))}
          </div>
        )}

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            {socialLinks.map((link) => {
              const icon = SOCIAL_ICONS[link.platform.toLowerCase()];
              if (!icon) return null;
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/8"
                >
                  <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        )}

        <Separator className="bg-white/10" />

        {/* Stats Bar */}
        <div className="grid grid-cols-3 py-5">
          <div className="flex flex-col items-center border-r border-white/10">
            <span className="text-2xl font-bold text-white">
              {followerCount.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <FontAwesomeIcon icon={faUsers} className="h-3 w-3" />
              Followers
            </span>
          </div>
          <div className="flex flex-col items-center border-r border-white/10">
            <span className="text-2xl font-bold text-white">
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <FontAwesomeIcon
                icon={faStar}
                className="h-3 w-3 text-amber-400"
              />
              {ratingCount > 0 ? `${ratingCount} reviews` : "No reviews yet"}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{eventsCount}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <FontAwesomeIcon icon={faCalendarDays} className="h-3 w-3" />
              Events
            </span>
          </div>
        </div>

        <Separator className="bg-white/10" />
      </div>
    </section>
  );
}
