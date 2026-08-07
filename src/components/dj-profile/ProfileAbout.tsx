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
  bookingEmail?: string;
  bookingPhone?: string;
  isOwner?: boolean;
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
  bookingEmail,
  bookingPhone,
  isOwner = false,
}: Props) {
  const formatFee = (value?: number) => {
    if (!value) return null;
    // Validate currency code: must be 3 uppercase letters
    const isValidCurrency = /^[A-Z]{3}$/.test(feeCurrency || "");
    const currency = isValidCurrency ? feeCurrency : "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
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
          className="text-h_red/80 mt-2 text-xs transition-colors hover:text-red-400"
        >
          {bioExpanded ? "Show less" : "Read more"}
        </button>
      </div>
      {(experienceYears || experienceLevel || feeMin || feeMax || isOwner) && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          {experienceYears && experienceYears > 0 && (
            <span>
              <span className="text-gray-400">Experience:</span>{" "}
              {experienceYears} {experienceYears === 1 ? "year" : "years"}
            </span>
          )}
          {experienceLevel && experienceLevel !== "0" && (
            <span>
              <span className="text-gray-400">Level:</span> {experienceLevel}
            </span>
          )}
          {(feeMin || feeMax) && (
            <span>
              <span className="text-gray-400">Fee:</span>{" "}
              {feeMin && feeMax
                ? `${formatFee(feeMin)} - ${formatFee(feeMax)}`
                : feeMin
                  ? `${formatFee(feeMin)}+`
                  : `Up to ${formatFee(feeMax)}`}
            </span>
          )}
          {isOwner &&
            !experienceYears &&
            !experienceLevel &&
            !feeMin &&
            !feeMax && (
              <span className="text-gray-400 italic">
                No experience or fee information added
              </span>
            )}
        </div>
      )}
      {(bookingEmail || bookingPhone || isOwner) && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          {bookingEmail && (
            <span>
              <span className="text-gray-400">Email:</span>{" "}
              <a
                href={`mailto:${bookingEmail}`}
                className="text-gray-300 transition-colors hover:text-white"
              >
                {bookingEmail}
              </a>
            </span>
          )}
          {bookingPhone && (
            <span>
              <span className="text-gray-400">Phone:</span>{" "}
              <a
                href={`tel:${bookingPhone}`}
                className="text-gray-300 transition-colors hover:text-white"
              >
                {bookingPhone}
              </a>
            </span>
          )}
          {isOwner && !bookingEmail && !bookingPhone && (
            <span className="text-gray-400 italic">
              No contact information added
            </span>
          )}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-xs text-gray-400">Specializes in:</span>
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
