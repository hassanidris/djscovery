"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/forms/SectionCard";

export function ExperienceSection({
  experienceYears,
  setExperienceYears,
}: {
  experienceYears: string;
  setExperienceYears: (v: string) => void;
}) {
  return (
    <SectionCard title="Experience" subtitle="Your background and skill level">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs text-gray-300">
            Years of Experience
          </Label>
          <Input
            type="number"
            min="0"
            max="50"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="e.g. 5"
            className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
          />
          <p className="mt-1 text-[11px] text-gray-400">Total years as a DJ</p>
        </div>
      </div>
    </SectionCard>
  );
}
