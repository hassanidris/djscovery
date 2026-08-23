"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import { updateOrganizerProfile } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProfileData, SocialLink } from "./types";

const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "website", label: "Website" },
] as const;

export default function SocialTab({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [links, setLinks] = useState<SocialLink[]>(
    profile.socialLinks.length > 0
      ? profile.socialLinks
      : [{ platform: "instagram", url: "" }],
  );

  function addLink() {
    if (links.length >= 6) return;
    const usedPlatforms = new Set(links.map((l) => l.platform));
    const next = SOCIAL_PLATFORMS.find((p) => !usedPlatforms.has(p.value));
    setLinks((prev) => [
      ...prev,
      { platform: next?.value ?? "instagram", url: "" },
    ]);
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: "platform" | "url", value: string) {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  }

  function handleSave() {
    const validLinks = links.filter((l) => l.url.trim());
    startTransition(async () => {
      const result = await updateOrganizerProfile({
        socialLinks: validLinks as {
          platform:
            | "instagram"
            | "linkedin"
            | "facebook"
            | "tiktok"
            | "youtube"
            | "website";
          url: string;
        }[],
      });
      if ("error" in result) toast.error(result.error);
      else toast.success("Social links updated.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            Add links to your social media pages.
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            All links are shown publicly on your profile. Maximum 6.
          </p>
        </div>
        {links.length < 6 && (
          <Button type="button" variant="outline" size="sm" onClick={addLink}>
            <Plus className="h-4 w-4" /> Add Link
          </Button>
        )}
      </div>

      {links.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
          <ExternalLink className="text-muted-foreground mx-auto mb-2 h-6 w-6" />
          <p className="text-muted-foreground text-sm">No social links yet.</p>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={addLink}
            className="mt-1"
          >
            Add your first link
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={link.platform}
              onValueChange={(v) => updateLink(i, "platform", v)}
            >
              <SelectTrigger className="w-36 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOCIAL_PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              placeholder="https://..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLink(i)}
              className="text-muted-foreground hover:text-destructive shrink-0"
              aria-label="Remove link"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Social Links"}
        </Button>
      </div>
    </div>
  );
}
