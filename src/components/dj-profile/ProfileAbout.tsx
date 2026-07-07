"use client";

import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/dj-profile/dj-profile-shared";
import { cn } from "@/lib/utils";

type Props = {
  bio: string;
  djTypes: string[];
  bioExpanded: boolean;
  onToggleBio: () => void;
  experienceYears?: number;
  experienceLevel?: string;
  feeMin?: number;
  feeMax?: number;
  feeCurrency?: string;
};

export default function ProfileAbout({
  bio,
  djTypes,
  bioExpanded,
  onToggleBio,
  experienceYears,
  experienceLevel,
  feeMin,
  feeMax,
  feeCurrency,
}: Props) {
  const formatFee = (value?: number) => {
    if (!value) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: feeCurrency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section>
      <SectionHeading>About Me</SectionHeading>
      <div>
        <p
          className={cn(
            "text-sm leading-relaxed text-gray-300",
            !bioExpanded && "line-clamp-4",
          )}
        >
          {bio}
        </p>
        <button
          onClick={onToggleBio}
          className="text-h_red mt-2 text-xs transition-colors hover:text-red-400"
        >
          {bioExpanded ? "Show less" : "Read more"}
        </button>
      </div>
      {(experienceYears || experienceLevel || feeMin || feeMax) && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          {experienceYears && experienceYears > 0 && (
            <span>
              <span className="text-gray-500">Experience:</span>{" "}
              {experienceYears} {experienceYears === 1 ? "year" : "years"}
            </span>
          )}
          {experienceLevel && experienceLevel !== "0" && (
            <span>
              <span className="text-gray-500">Level:</span> {experienceLevel}
            </span>
          )}
          {(feeMin || feeMax) && (
            <span>
              <span className="text-gray-500">Fee:</span>{" "}
              {feeMin && feeMax
                ? `${formatFee(feeMin)} - ${formatFee(feeMax)}`
                : feeMin
                  ? `${formatFee(feeMin)}+`
                  : `Up to ${formatFee(feeMax)}`}
            </span>
          )}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-xs text-gray-500">Specializes in:</span>
        {djTypes.map((t) => (
          <Badge
            key={t}
            variant="outline"
            className="border-white/15 text-xs text-gray-300"
          >
            {t}
          </Badge>
        ))}
      </div>
    </section>
  );
}
