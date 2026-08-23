"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Globe, Lock } from "lucide-react";
import { updateOrganizerProfile } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProfileData } from "./types";

export default function ContactTab({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [website, setWebsite] = useState(profile.website);
  const [contactEmail, setContactEmail] = useState(profile.contactEmail);
  const [phone, setPhone] = useState(profile.phone);

  function handleSave() {
    startTransition(async () => {
      const result = await updateOrganizerProfile({
        website: website || null,
        contactEmail: contactEmail || null,
        phone: phone || null,
      });
      if ("error" in result) toast.error(result.error);
      else toast.success("Contact details updated.");
    });
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Website — public */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="website">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Website
            </span>
          </Label>
          <Badge
            variant="outline"
            className="border-green-500/40 text-[10px] text-green-400"
          >
            Public
          </Badge>
        </div>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourvenue.com"
          maxLength={200}
        />
        <p className="text-muted-foreground text-xs">
          Shown publicly as the primary way DJs can contact you.
        </p>
      </div>

      {/* Contact email — private */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="contactEmail">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Contact Email
            </span>
          </Label>
          <Badge variant="secondary" className="text-[10px]">
            Private
          </Badge>
        </div>
        <Input
          id="contactEmail"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="bookings@yourvenue.com"
          maxLength={100}
        />
        <p className="text-muted-foreground text-xs">
          Never shown publicly. Reserved for future direct booking features.
        </p>
      </div>

      {/* Phone — private */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="phone">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Phone
            </span>
          </Label>
          <Badge variant="secondary" className="text-[10px]">
            Private
          </Badge>
        </div>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+46 70 000 0000"
          maxLength={30}
        />
        <p className="text-muted-foreground text-xs">
          Never shown publicly. Reserved for future verified-contact features.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Contact"}
        </Button>
      </div>
    </div>
  );
}
