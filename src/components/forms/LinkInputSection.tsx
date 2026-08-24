"use client";

import { Plus, X } from "lucide-react";

export function LinkInputSection({
  label,
  icon,
  placeholder,
  hint,
  links,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  hint: string;
  links: string[];
  onChange: (links: string[]) => void;
}) {
  function addLink() {
    onChange([...links, ""]);
  }

  function updateLink(i: number, value: string) {
    onChange(links.map((l, idx) => (idx === i ? value : l)));
  }

  function removeLink(i: number) {
    onChange(links.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-xs text-gray-400">· {hint}</span>
      </div>

      {links.length > 0 && (
        <div className="mb-1 flex flex-col gap-2">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
                placeholder={placeholder}
                className="focus:ring-h_red flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs text-white placeholder-gray-500 ring-1 ring-white/20 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="shrink-0 text-gray-400 transition-colors hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addLink}
        className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-gray-400 transition-all hover:border-white/30 hover:text-gray-300"
      >
        <Plus className="h-3.5 w-3.5" />
        Add link
      </button>
    </div>
  );
}
