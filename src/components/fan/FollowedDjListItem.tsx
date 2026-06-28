"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleCheck, MapPin } from "lucide-react";
import UnfollowDjButton from "@/components/account/RemoveSavedDjButton";

type Dj = {
  id: number;
  slug: string;
  stageName: string;
  avatar: string | null;
  plan: string;
  status: string;
  city: { name: string } | null;
  country: { name: string } | null;
  genres: string[];
};

export default function FollowedDjListItem({ dj }: { dj: Dj }) {
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3 transition-colors hover:bg-white/5">
      <Link href={`/djs/${dj.slug}`} className="relative shrink-0">
        <Image
          src={dj.avatar ?? "/noAvatar.png"}
          alt={dj.stageName}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-red-500/60"
        />
        {dj.plan === "PREMIUM" && (
          <span className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-black bg-amber-400 text-[9px] font-bold text-black">
            ★
          </span>
        )}
      </Link>

      <Link href={`/djs/${dj.slug}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-white">
            {dj.stageName}
          </span>
          {dj.status === "APPROVED" && (
            <CircleCheck
              className="h-3.5 w-3.5 shrink-0 text-blue-400"
              aria-label="Admin approved"
            />
          )}
        </div>
        {(dj.city || dj.country) && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-400">
            <MapPin className="h-3 w-3 shrink-0" />
            {[dj.city?.name, dj.country?.name].filter(Boolean).join(", ")}
          </p>
        )}
        {dj.genres.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {dj.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-red-950/60 px-2 py-0.5 text-xs text-red-200"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </Link>

      <UnfollowDjButton djProfileId={dj.id} onSuccess={() => setRemoved(true)} />
    </div>
  );
}
