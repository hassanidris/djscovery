"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/forms/SectionCard";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";

export function SocialLinksSection({
  socialLinks,
  setSocialLinks,
}: {
  socialLinks: { platform: string; url: string }[];
  setSocialLinks: React.Dispatch<
    React.SetStateAction<{ platform: string; url: string }[]>
  >;
}) {
  function addSocialLink() {
    setSocialLinks((prev) => [...prev, { platform: "instagram", url: "" }]);
  }

  function removeSocialLink(index: number) {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSocialLink(
    index: number,
    field: "platform" | "url",
    value: string,
  ) {
    setSocialLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  }

  return (
    <SectionCard
      title="Social & Music Links"
      subtitle="Connect your platforms to boost discovery"
    >
      <div className="flex flex-col gap-3">
        {socialLinks.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={link.platform}
              onChange={(e) =>
                updateSocialLink(i, "platform", e.target.value)
              }
              className="focus:border-h_red/50 w-32 shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-2 text-xs text-white focus:outline-none"
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option
                  key={p.value}
                  value={p.value}
                  className="bg-zinc-900 capitalize"
                >
                  {p.label}
                </option>
              ))}
            </select>
            <Input
              value={link.url}
              onChange={(e) => updateSocialLink(i, "url", e.target.value)}
              placeholder="https://..."
              type="url"
              className="focus:border-h_red/50 flex-1 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSocialLink(i)}
              className="shrink-0 text-gray-400 hover:text-red-400"
              aria-label="Remove link"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSocialLink}
          className="w-fit border-white/15 text-gray-400 hover:bg-white/5"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Link
        </Button>
      </div>
    </SectionCard>
  );
}
