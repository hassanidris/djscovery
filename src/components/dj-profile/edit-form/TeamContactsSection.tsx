"use client";

import { Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SectionCard } from "@/components/forms/SectionCard";

export function TeamContactsSection({
  isPremium,
  managerName,
  setManagerName,
  managerEmail,
  setManagerEmail,
  managerPhone,
  setManagerPhone,
  agentName,
  setAgentName,
  agentAgency,
  setAgentAgency,
  agentEmail,
  setAgentEmail,
}: {
  isPremium: boolean;
  managerName: string;
  setManagerName: (v: string) => void;
  managerEmail: string;
  setManagerEmail: (v: string) => void;
  managerPhone: string;
  setManagerPhone: (v: string) => void;
  agentName: string;
  setAgentName: (v: string) => void;
  agentAgency: string;
  setAgentAgency: (v: string) => void;
  agentEmail: string;
  setAgentEmail: (v: string) => void;
}) {
  if (isPremium) {
    return (
      <SectionCard
        title="Professional Team"
        subtitle="Manager and booking agent details"
      >
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Manager
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Name
                </Label>
                <Input
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Marcus Osei"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Email
                </Label>
                <Input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="manager@email.com"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Phone
                </Label>
                <Input
                  type="tel"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="+44 7700 900123"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
          <Separator className="bg-white/8" />
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Booking Agent
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Name
                </Label>
                <Input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Sophie Laurent"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Agency
                </Label>
                <Input
                  value={agentAgency}
                  onChange={(e) => setAgentAgency(e.target.value)}
                  placeholder="Rhythm Agency"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-300">
                  Email
                </Label>
                <Input
                  type="email"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  placeholder="agent@email.com"
                  className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Professional Team"
      subtitle="Manager and booking agent details — Premium only"
    >
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Crown className="h-6 w-6 text-amber-500" />
        <p className="text-sm text-gray-400">
          Upgrade to Premium to add your manager and booking agent details.
        </p>
      </div>
    </SectionCard>
  );
}
