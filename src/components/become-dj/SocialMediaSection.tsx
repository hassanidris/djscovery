"use client";

import { Plus, Trash2 } from "lucide-react";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";
import { sectionCls, sectionTitleCls } from "./constants";

export function SocialMediaSection({
  socialLinks,
  addSocialLink,
  removeSocialLink,
  updateSocialLink,
  error,
}: {
  socialLinks: { platform: string; url: string }[];
  addSocialLink: () => void;
  removeSocialLink: (i: number) => void;
  updateSocialLink: (i: number, key: "platform" | "url", value: string) => void;
  error?: { message?: string } | undefined;
}) {
  return (
    <div className={`${sectionCls} ${error ? "border-red-500/40" : ""}`}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleCls}>
          Social Media <span className="text-h_redLight">*</span>
        </h2>
      </div>

      {socialLinks.length === 0 && (
        <p className="-mt-2 text-xs text-gray-400">
          Add at least one link so fans can find you.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {socialLinks.map((link, i) => (
          <div key={i} className="flex min-w-0 items-center gap-2">
            <select
              value={link.platform}
              onChange={(e) => updateSocialLink(i, "platform", e.target.value)}
              className="focus:ring-h_red w-36 shrink-0 cursor-pointer appearance-none rounded-lg bg-white/10 px-3 py-3 text-sm text-white ring-1 ring-white/20 transition-all outline-none"
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option
                  key={p.value}
                  value={p.value}
                  className="bg-[#1a1a1a]"
                >
                  {p.label}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateSocialLink(i, "url", e.target.value)}
              placeholder="https://..."
              className="focus:ring-h_red min-w-0 flex-1 rounded-lg bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 ring-1 ring-white/20 transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => removeSocialLink(i)}
              className="shrink-0 rounded-lg bg-white/5 p-3 text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="-mt-2 text-xs text-red-400">{error.message}</p>
      )}

      <button
        type="button"
        onClick={addSocialLink}
        className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-2.5 text-sm text-gray-400 transition-all hover:border-white/40 hover:text-white"
      >
        <Plus className="h-4 w-4" />
        Add social link
      </button>
    </div>
  );
}
