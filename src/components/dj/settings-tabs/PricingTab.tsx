"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDjProfile } from "@/lib/actions/profile";
import { CURRENCIES } from "@/config/currencies";
import type { ProfileData } from "./types";

export default function PricingTab({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [feeMin, setFeeMin] = useState(profile.feeMin?.toString() ?? "");
  const [feeMax, setFeeMax] = useState(profile.feeMax?.toString() ?? "");
  const [currency, setCurrency] = useState(profile.feeCurrency || "USD");

  function handleSave() {
    startTransition(async () => {
      const minNum = feeMin ? Number(feeMin) : null;
      const maxNum = feeMax ? Number(feeMax) : null;
      const result = await updateDjProfile({
        feeMin: minNum,
        feeMax: maxNum,
        feeCurrency: currency,
      });
      if ("error" in result) toast.error(result.error);
      else toast.success("Pricing updated.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="feeMin">Minimum Fee</Label>
          <Input
            id="feeMin"
            type="number"
            min={0}
            value={feeMin}
            onChange={(e) => setFeeMin(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="feeMax">Maximum Fee</Label>
          <Input
            id="feeMax"
            type="number"
            min={0}
            value={feeMax}
            onChange={(e) => setFeeMax(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Pricing"}
        </Button>
      </div>
    </div>
  );
}
