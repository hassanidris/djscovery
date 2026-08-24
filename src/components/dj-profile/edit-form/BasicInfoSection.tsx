"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/forms/SectionCard";

export function BasicInfoSection({
  stageName,
  setStageName,
  bio,
  setBio,
  submitted,
  stageNameError,
}: {
  stageName: string;
  setStageName: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  submitted: boolean;
  stageNameError: boolean;
}) {
  return (
    <SectionCard
      title="Basic Information"
      subtitle="Your stage name and biography"
    >
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="text-xs text-gray-300">
              Stage Name <span className="text-h_redLight">*</span>
            </Label>
            <span className="text-[11px] text-gray-400">
              Displays as{" "}
              <span className="font-medium text-gray-400">
                Dj {stageName.trim() || "Your Name"}
              </span>{" "}
              — no &ldquo;DJ&rdquo; needed
            </span>
          </div>
          <Input
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            placeholder="e.g. Hassan, Tiësto, Carl Cox"
            className={`focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400 ${
              submitted && stageNameError ? "border-red-500/60" : ""
            }`}
            maxLength={60}
          />
          {submitted && stageNameError && (
            <p className="mt-1 text-[11px] text-red-400">
              Stage name is required (min 2 characters)
            </p>
          )}
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-gray-300">
            Biography
          </Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell bookers and fans about your sound and story..."
            className="focus:border-h_red/50 min-h-28 resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-400"
            maxLength={800}
          />
          <div className="mt-1 flex items-center justify-between">
            {bio.trim().length === 0 ? (
              <p className="text-[11px] text-amber-400/70">
                ⚠ A bio increases your booking chances
              </p>
            ) : bio.trim().length < 50 ? (
              <p className="text-[11px] text-amber-400/70">
                ⚠ Short bio — aim for 50+ characters
              </p>
            ) : (
              <span />
            )}
            <p className="text-[11px] text-gray-400">{bio.length}/800</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
