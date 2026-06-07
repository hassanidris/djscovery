"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, X, ArrowRight } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
    }
  }, [open]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/directory?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-h_blackLight border border-white/10 text-white max-w-lg p-0 gap-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">Search DJscovery</DialogTitle>
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-3 px-4 py-3 border-b border-white/8"
        >
          <Search className="h-5 w-5 text-gray-400 shrink-0" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search DJs, genres, events..."
            className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500 text-base"
            aria-label="Search DJscovery"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
          {query && (
            <button
              type="submit"
              aria-label="Submit search"
              className="text-h_red hover:text-h_redDark transition-colors"
            >
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
          )}
        </form>
        <div className="px-4 py-3">
          <p className="text-gray-500 text-xs">
            Search across the DJ directory, genres, and more. Press{" "}
            <kbd className="px-1 py-0.5 text-[10px] bg-white/5 border border-white/10 rounded text-gray-400">
              Enter
            </kbd>{" "}
            to search.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
