"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Highlight {
  id: number;
  year: string;
  title: string;
  description: string;
}

interface HighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlights: Highlight[];
  onSave: (highlights: Highlight[]) => void;
}

export default function HighlightModal({
  isOpen,
  onClose,
  highlights: initialHighlights,
  onSave,
}: HighlightModalProps) {
  const [highlights, setHighlights] = useState<Highlight[]>(() =>
    initialHighlights.length === 0
      ? [
          {
            id: 0,
            year: "",
            title: "",
            description: "",
          },
        ]
      : initialHighlights,
  );

  function addHighlight() {
    setHighlights((prev) => [
      ...prev,
      {
        id: 0,
        year: "",
        title: "",
        description: "",
      },
    ]);
  }

  function removeHighlight(index: number) {
    setHighlights((prev) => prev.filter((_, idx) => idx !== index));
  }

  function updateHighlight(index: number, field: string, value: any) {
    setHighlights((prev) =>
      prev.map((h, idx) => (idx === index ? { ...h, [field]: value } : h)),
    );
  }

  function handleSave() {
    const validHighlights = highlights.filter(
      (h) => h.year.trim() !== "" && h.title.trim() !== "",
    );
    onSave(validHighlights);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-black p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Edit Career Highlights
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {highlights.map((highlight, index) => (
            <div
              key={highlight.id || index}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Highlight #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="text-gray-500 transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    Year *
                  </Label>
                  <Input
                    type="text"
                    value={highlight.year}
                    onChange={(e) =>
                      updateHighlight(index, "year", e.target.value)
                    }
                    placeholder="e.g., 2024"
                    maxLength={4}
                    className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Title *
                </Label>
                <Input
                  value={highlight.title}
                  onChange={(e) =>
                    updateHighlight(index, "title", e.target.value)
                  }
                  placeholder="e.g., Headlined Afro Nation Portugal"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Description (optional)
                </Label>
                <Textarea
                  value={highlight.description}
                  onChange={(e) =>
                    updateHighlight(index, "description", e.target.value)
                  }
                  placeholder="Additional details about this achievement..."
                  className="focus:border-h_red/50 min-h-16 resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            onClick={addHighlight}
            variant="outline"
            className="border-dashed border-white/20 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {highlights.length === 0 ? "Add Highlight" : "Add More Highlights"}
          </Button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Highlights
          </Button>
        </div>
      </div>
    </div>
  );
}
