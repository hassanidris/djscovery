"use client";

import { useState } from "react";
import { X, Plus, Trash2, CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface PressItem {
  id: number;
  source: string;
  type: string;
  title: string;
  date: string;
  url: string;
}

interface PressModalProps {
  isOpen: boolean;
  onClose: () => void;
  pressItems: PressItem[];
  onSave: (pressItems: PressItem[]) => void;
}

const PRESS_TYPES = ["Feature", "Interview", "Podcast", "Review", "Other"];

export default function PressModal({
  isOpen,
  onClose,
  pressItems: initialPressItems,
  onSave,
}: PressModalProps) {
  const [pressItems, setPressItems] = useState<PressItem[]>(() =>
    initialPressItems.length === 0
      ? [
          {
            id: Date.now(),
            source: "",
            type: "Feature",
            title: "",
            date: "",
            url: "",
          },
        ]
      : initialPressItems,
  );
  const [openDateIndex, setOpenDateIndex] = useState<number | null>(null);

  function parsePressDate(str: string): Date | undefined {
    if (!str) return undefined;
    const parsed = parse(str, "MMM yyyy", new Date());
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  function formatPressDate(date: Date | undefined): string {
    if (!date) return "";
    return format(date, "MMM yyyy");
  }

  function addPressItem() {
    setPressItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        source: "",
        type: "Feature",
        title: "",
        date: "",
        url: "",
      },
    ]);
  }

  function removePressItem(index: number) {
    setPressItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  function updatePressItem(index: number, field: string, value: any) {
    setPressItems((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [field]: value } : p)),
    );
  }

  function handleSave() {
    const validItems = pressItems.filter(
      (p) => p.source.trim() !== "" && p.title.trim() !== "",
    );
    onSave(validItems);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-black p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Edit Press &amp; Media
          </h2>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {pressItems.map((item, index) => (
            <div
              key={item.id || index}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Press Item #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePressItem(index)}
                  className="text-gray-500 transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    Outlet / Source *
                  </Label>
                  <Input
                    value={item.source}
                    onChange={(e) =>
                      updatePressItem(index, "source", e.target.value)
                    }
                    placeholder="e.g., Mixmag"
                    className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    Type
                  </Label>
                  <Select
                    value={item.type}
                    onValueChange={(val) => updatePressItem(index, "type", val)}
                  >
                    <SelectTrigger className="focus:border-h_red/50 w-full border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-black">
                      {PRESS_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Title *
                </Label>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    updatePressItem(index, "title", e.target.value)
                  }
                  placeholder="e.g., The Sound of Lagos Goes Global"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    Date (optional)
                  </Label>
                  <Popover
                    open={openDateIndex === index}
                    onOpenChange={(open) =>
                      setOpenDateIndex(open ? index : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "focus:border-h_red/50 h-9 w-full justify-start border-white/10 bg-white/5 text-left font-normal text-white",
                          !item.date && "text-gray-600",
                        )}
                      >
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                        {item.date || "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto border-white/10 bg-black p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={parsePressDate(item.date)}
                        onSelect={(date) => {
                          updatePressItem(index, "date", formatPressDate(date));
                          setOpenDateIndex(null);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    URL (optional)
                  </Label>
                  <Input
                    type="url"
                    value={item.url}
                    onChange={(e) =>
                      updatePressItem(index, "url", e.target.value)
                    }
                    placeholder="https://..."
                    className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            onClick={addPressItem}
            variant="outline"
            className="border-dashed border-white/20 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {pressItems.length === 0 ? "Add Press Item" : "Add More"}
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
            Save Press Items
          </Button>
        </div>
      </div>
    </div>
  );
}
