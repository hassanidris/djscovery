"use client";

import { useRef } from "react";
import { Plus, X } from "lucide-react";

export function MediaUploadSection({
  label,
  icon,
  accept,
  hint,
  files,
  onAdd,
  onRemove,
}: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  hint: string;
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-xs text-gray-400">· {hint}</span>
      </div>

      {files.length > 0 && (
        <div className="mb-1 flex flex-col gap-1.5">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-400"
            >
              <span className="max-w-xs truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="ml-3 shrink-0 text-gray-400 transition-colors hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-gray-400 transition-all hover:border-white/30 hover:text-gray-300">
        <Plus className="h-3.5 w-3.5" />
        Add {label.toLowerCase()}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          onChange={(e) => {
            const selected = Array.from(e.target.files ?? []);
            if (selected.length > 0) onAdd(selected);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
