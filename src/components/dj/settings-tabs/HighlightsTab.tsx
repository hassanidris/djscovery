"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Crown, Trophy, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  getDjHighlights,
  createDjHighlight,
  updateDjHighlight,
  deleteDjHighlight,
} from "@/lib/actions/dj-highlights";
import type { ProfileData, Highlight } from "./types";

export default function HighlightsTab({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const highlightsRequest = useRef(0);

  const isPremium = profile.plan === "PREMIUM";

  useEffect(() => {
    async function loadHighlights() {
      if (!isPremium) {
        setLoading(false);
        return;
      }
      const requestId = ++highlightsRequest.current;
      const result = await getDjHighlights(profile.id);
      if (requestId !== highlightsRequest.current) return;
      setHighlights(result);
      setLoading(false);
    }
    loadHighlights();
  }, [profile.id, isPremium]);

  function addHighlight() {
    const tempId = -Date.now();
    setHighlights((prev) => [
      ...prev,
      { id: tempId, year: "", title: "", description: "" },
    ]);
    setEditId(tempId);
  }

  async function removeHighlight(id: number) {
    const result = await deleteDjHighlight(id);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    const requestId = ++highlightsRequest.current;
    const updated = await getDjHighlights(profile.id);
    if (requestId === highlightsRequest.current) {
      setHighlights(updated);
    }
    toast.success("Highlight deleted.");
  }

  function updateHighlight(id: number, field: keyof Highlight, value: string) {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    );
  }

  function handleSave() {
    startTransition(async () => {
      const requestId = ++highlightsRequest.current;
      const toAdd = highlights.filter((h) => h.id < 0);
      const toUpdate = highlights.filter((h) => h.id > 0);
      const toDelete = highlights.filter(
        (h) => h.id < 0 && h.year === "" && h.title === "",
      );

      // Add new highlights
      for (const h of toAdd) {
        if (!h.year.trim() || !h.title.trim()) continue;
        const formData = new FormData();
        formData.append("year", h.year.trim());
        formData.append("title", h.title.trim());
        if (h.description?.trim())
          formData.append("description", h.description.trim());
        const result = await createDjHighlight(formData);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
      }

      // Update existing highlights
      for (const h of toUpdate) {
        const formData = new FormData();
        formData.append("year", h.year.trim());
        formData.append("title", h.title.trim());
        formData.append("description", h.description?.trim() ?? "");
        const result = await updateDjHighlight(h.id, formData);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
      }

      // Reload highlights
      const result = await getDjHighlights(profile.id);
      if (requestId === highlightsRequest.current) {
        setHighlights(result);
      }
      setEditId(null);
      toast.success("Career highlights updated.");
    });
  }

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10">
          <Crown className="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Premium Feature</h3>
          <p className="mt-2 text-sm text-gray-400">
            Showcase your career milestones and achievements with a Premium
            plan.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Career Highlights
          </h3>
          <p className="text-xs text-gray-400">
            Showcase your key milestones and achievements.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addHighlight}
        >
          <Plus className="h-4 w-4" /> Add Highlight
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {highlights.map((h) => (
          <div
            key={h.id}
            data-testid="highlight-item"
            className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
          >
            {editId === h.id ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`highlight-year-${h.id}`}>Year</Label>
                    <Input
                      id={`highlight-year-${h.id}`}
                      value={h.year}
                      onChange={(e) =>
                        updateHighlight(h.id, "year", e.target.value)
                      }
                      placeholder="2024"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`highlight-title-${h.id}`}>Title</Label>
                  <Input
                    id={`highlight-title-${h.id}`}
                    value={h.title}
                    onChange={(e) =>
                      updateHighlight(h.id, "title", e.target.value)
                    }
                    placeholder="Headlined Afro Nation Portugal"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`highlight-description-${h.id}`}>
                    Description (optional)
                  </Label>
                  <Textarea
                    id={`highlight-description-${h.id}`}
                    value={h.description ?? ""}
                    onChange={(e) =>
                      updateHighlight(h.id, "description", e.target.value)
                    }
                    placeholder="Additional details..."
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isPending}
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{h.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{h.year}</p>
                  {h.description && (
                    <p className="mt-1 text-xs text-gray-400">
                      {h.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditId(h.id)}
                    className="text-gray-400 hover:text-white"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHighlight(h.id)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {highlights.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/2 py-12 text-center">
          <Trophy className="h-8 w-8 text-gray-400" />
          <p className="mt-3 text-sm font-medium text-white">
            No career highlights yet
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Add your key milestones and achievements to build credibility.
          </p>
        </div>
      )}
    </div>
  );
}
