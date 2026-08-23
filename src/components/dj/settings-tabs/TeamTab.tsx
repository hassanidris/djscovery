"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateDjProfile } from "@/lib/actions/profile";
import type { ProfileData } from "./types";

export default function TeamTab({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [managerName, setManagerName] = useState(profile.managerName);
  const [managerEmail, setManagerEmail] = useState(profile.managerEmail);
  const [managerPhone, setManagerPhone] = useState(profile.managerPhone);
  const [agentName, setAgentName] = useState(profile.agentName);
  const [agentAgency, setAgentAgency] = useState(profile.agentAgency);
  const [agentEmail, setAgentEmail] = useState(profile.agentEmail);

  const isPremium = profile.plan === "PREMIUM";

  function handleSave() {
    startTransition(async () => {
      const result = await updateDjProfile({
        managerName: managerName.trim() || null,
        managerEmail: managerEmail.trim() || null,
        managerPhone: managerPhone.trim() || null,
        agentName: agentName.trim() || null,
        agentAgency: agentAgency.trim() || null,
        agentEmail: agentEmail.trim() || null,
      });
      if ("error" in result) toast.error(result.error);
      else toast.success("Professional Team updated.");
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
            Add your manager and booking agent details to your profile with a
            Premium plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-white">Professional Team</h3>
        <p className="text-xs text-gray-400">
          Add your manager and booking agent details.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Manager */}
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Manager
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="managerName">Name</Label>
                <Input
                  id="managerName"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Marcus Osei"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="managerEmail">Email</Label>
                <Input
                  id="managerEmail"
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="manager@email.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="managerPhone">Phone</Label>
                <Input
                  id="managerPhone"
                  type="tel"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="+44 7700 900123"
                />
              </div>
            </div>
          </div>

          {/* Booking Agent */}
          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Booking Agent
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="agentName">Name</Label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Sophie Laurent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="agentAgency">Agency</Label>
                <Input
                  id="agentAgency"
                  value={agentAgency}
                  onChange={(e) => setAgentAgency(e.target.value)}
                  placeholder="Rhythm Agency"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="agentEmail">Email</Label>
                <Input
                  id="agentEmail"
                  type="email"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  placeholder="agent@email.com"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Professional Team"}
        </Button>
      </div>
    </div>
  );
}
