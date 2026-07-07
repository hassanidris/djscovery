"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PACKAGE_TEMPLATES,
  type PackageTemplate,
} from "@/data/package-templates";
import { CURRENCIES } from "@/config/currencies";

interface Package {
  id: number;
  name: string;
  priceFrom: number;
  priceTo: number | null;
  currency: string;
  duration: string | null;
  features: string[];
  popular: boolean;
  sortOrder: number;
}

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: Package[];
  onSave: (packages: Package[]) => void;
  djProfileId: number;
  defaultCurrency?: string;
}

export default function PackageModal({
  isOpen,
  onClose,
  packages: initialPackages,
  onSave,
  djProfileId,
  defaultCurrency = "USD",
}: PackageModalProps) {
  const [packages, setPackages] = useState<Package[]>(initialPackages);

  useEffect(() => {
    if (initialPackages.length === 0) {
      setPackages([
        {
          id: 0,
          name: "",
          priceFrom: 0,
          priceTo: null,
          currency: defaultCurrency,
          duration: null,
          features: [],
          popular: false,
          sortOrder: 0,
        },
      ]);
    } else {
      setPackages(initialPackages);
    }
  }, [initialPackages, defaultCurrency]);

  function addPackage() {
    setPackages((prev) => [
      ...prev,
      {
        id: 0,
        name: "",
        priceFrom: 0,
        priceTo: null,
        currency: defaultCurrency,
        duration: null,
        features: [],
        popular: false,
        sortOrder: prev.length,
      },
    ]);
  }

  function applyTemplate(index: number, templateKey: string) {
    const template = PACKAGE_TEMPLATES[templateKey];
    if (!template) return;

    setPackages((prev) =>
      prev.map((p, idx) =>
        idx === index
          ? {
              ...p,
              name: template.name,
              priceFrom: template.priceFrom,
              priceTo: template.priceTo || null,
              currency: defaultCurrency, // Use DJ's currency instead of template's
              duration: template.duration,
              features: template.features,
              popular: template.popular || false,
            }
          : p,
      ),
    );
  }

  function removePackage(index: number) {
    setPackages((prev) => prev.filter((_, idx) => idx !== index));
  }

  function updatePackage(index: number, field: string, value: any) {
    setPackages((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [field]: value } : p)),
    );
  }

  function addFeature(packageIndex: number) {
    setPackages((prev) =>
      prev.map((p, idx) =>
        idx === packageIndex ? { ...p, features: [...p.features, ""] } : p,
      ),
    );
  }

  function removeFeature(packageIndex: number, featureIndex: number) {
    setPackages((prev) =>
      prev.map((p, idx) =>
        idx === packageIndex
          ? {
              ...p,
              features: p.features.filter((_, fIdx) => fIdx !== featureIndex),
            }
          : p,
      ),
    );
  }

  function updateFeature(
    packageIndex: number,
    featureIndex: number,
    value: string,
  ) {
    setPackages((prev) =>
      prev.map((p, idx) =>
        idx === packageIndex
          ? {
              ...p,
              features: p.features.map((f, fIdx) =>
                fIdx === featureIndex ? value : f,
              ),
            }
          : p,
      ),
    );
  }

  function handleSave() {
    // Validate each package
    for (const pkg of packages) {
      if (!pkg.name.trim()) {
        toast.error("Package name is required");
        return;
      }
      if (pkg.priceFrom <= 0) {
        toast.error("Price must be greater than 0");
        return;
      }
    }
    onSave(packages);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-black p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Edit Packages</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {packages.map((pkg, index) => (
            <div
              key={`${pkg.id || 0}-${index}`}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Package #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePackage(index)}
                  className="text-gray-500 transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Package Type (optional template)
                </Label>
                <Select
                  value={
                    Object.entries(PACKAGE_TEMPLATES).find(
                      ([, t]) => t.name === pkg.name,
                    )?.[0] || "custom"
                  }
                  onValueChange={(value) => {
                    if (value === "custom") {
                      updatePackage(index, "name", "");
                      updatePackage(index, "priceFrom", 0);
                      updatePackage(index, "priceTo", null);
                      updatePackage(index, "duration", null);
                      updatePackage(index, "features", []);
                      updatePackage(index, "popular", false);
                    } else {
                      applyTemplate(index, value);
                    }
                  }}
                >
                  <SelectTrigger className="focus:border-h_red/50 w-full border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select a template or custom" />
                  </SelectTrigger>
                  <SelectContent
                    className="border-white/10 bg-black text-white"
                    side="bottom"
                    sideOffset={4}
                    align="start"
                    avoidCollisions={false}
                  >
                    {Object.entries(PACKAGE_TEMPLATES).map(
                      ([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                          {template.popular && " (Popular)"}
                        </SelectItem>
                      ),
                    )}
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {!Object.entries(PACKAGE_TEMPLATES).find(
                  ([, t]) => t.name === pkg.name,
                ) && (
                  <Input
                    value={pkg.name}
                    onChange={(e) =>
                      updatePackage(index, "name", e.target.value)
                    }
                    placeholder="Custom package name"
                    className="focus:border-h_red/50 mt-2 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                  />
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    Price From
                  </Label>
                  <Input
                    type="number"
                    value={pkg.priceFrom || ""}
                    onChange={(e) =>
                      updatePackage(
                        index,
                        "priceFrom",
                        e.target.value ? Number(e.target.value) : 0,
                      )
                    }
                    placeholder="2500"
                    className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-300">
                    Price To (optional)
                  </Label>
                  <Input
                    type="number"
                    value={pkg.priceTo || ""}
                    onChange={(e) =>
                      updatePackage(
                        index,
                        "priceTo",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="4000"
                    className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Currency
                </Label>
                <select
                  value={pkg.currency}
                  onChange={(e) =>
                    updatePackage(index, "currency", e.target.value)
                  }
                  className="focus:border-h_red/50 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600"
                >
                  {CURRENCIES.map((currency) => (
                    <option
                      key={currency.code}
                      value={currency.code}
                      className="bg-zinc-900"
                    >
                      {currency.code} ({currency.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Duration (e.g., "3-4 hours", "2 hours")
                </Label>
                <Input
                  type="text"
                  value={pkg.duration || ""}
                  onChange={(e) =>
                    updatePackage(index, "duration", e.target.value || null)
                  }
                  placeholder="3-4 hours"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Features
                </Label>
                <div className="flex flex-col gap-2">
                  {pkg.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) =>
                          updateFeature(index, featureIndex, e.target.value)
                        }
                        placeholder="e.g., Custom setlist"
                        className="focus:border-h_red/50 flex-1 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index, featureIndex)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature(index)}
                    className="border-dashed border-white/20 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`popular-${index}`}
                  checked={pkg.popular}
                  onCheckedChange={(checked) =>
                    updatePackage(index, "popular", checked === true)
                  }
                />
                <Label
                  htmlFor={`popular-${index}`}
                  className="text-xs text-gray-300"
                >
                  Mark as Most Popular
                </Label>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Sort Order
                </Label>
                <Input
                  type="number"
                  value={pkg.sortOrder}
                  onChange={(e) =>
                    updatePackage(
                      index,
                      "sortOrder",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  placeholder="0"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            onClick={addPackage}
            variant="outline"
            className="border-dashed border-white/20 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {packages.length === 0 ? "Add Package" : "Add More Packages"}
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
            Save Packages
          </Button>
        </div>
      </div>
    </div>
  );
}
