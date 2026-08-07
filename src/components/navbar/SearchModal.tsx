"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Search, X, ArrowRight } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setQuery("");
  }

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
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
        className="bg-h_blackLight max-w-lg gap-0 overflow-hidden border border-white/10 p-0 text-white"
      >
        <DialogTitle className="sr-only">Search DJcovery</DialogTitle>
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-3 border-b border-white/8 px-4 py-3"
        >
          <Search className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search DJs, genres, events..."
            className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-gray-400"
            aria-label="Search DJcovery"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-gray-400 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
          {query && (
            <button
              type="submit"
              aria-label="Submit search"
              className="text-h_red/80 hover:text-h_red/80Dark transition-colors"
            >
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
          )}
        </form>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400">
            Search across the DJ directory, genres, and more. Press{" "}
            <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-gray-400">
              Enter
            </kbd>{" "}
            to search.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
