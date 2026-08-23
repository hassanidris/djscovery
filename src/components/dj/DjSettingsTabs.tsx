"use client";

import dynamic from "next/dynamic";
import { User, Music, Banknote, BriefcaseBusiness, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProfileData, Country, City } from "./settings-tabs/types";

// Lazy-load each tab so only the active tab's JS ships to the client.
const ProfileTab = dynamic(() => import("./settings-tabs/ProfileTab"), {
  loading: () => null,
});
const MusicTab = dynamic(() => import("./settings-tabs/MusicTab"), {
  loading: () => null,
});
const PricingTab = dynamic(() => import("./settings-tabs/PricingTab"), {
  loading: () => null,
});
const HighlightsTab = dynamic(() => import("./settings-tabs/HighlightsTab"), {
  loading: () => null,
});
const TeamTab = dynamic(() => import("./settings-tabs/TeamTab"), {
  loading: () => null,
});

const TABS = [
  { value: "profile", label: "Profile", icon: User },
  { value: "music", label: "Music & Social", icon: Music },
  { value: "pricing", label: "Pricing", icon: Banknote },
  { value: "highlights", label: "Career Highlights", icon: Trophy },
  { value: "team", label: "Professional Team", icon: BriefcaseBusiness },
] as const;

export default function DjSettingsTabs({
  profile,
  countries,
  initialCities,
  allGenres,
}: {
  profile: ProfileData;
  countries: Country[];
  initialCities: City[];
  allGenres: string[];
}) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6 w-full flex-wrap justify-start gap-1 bg-white/5 sm:w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-active:bg-h_redDark flex-1 gap-1 px-3 py-1.5 data-active:text-white sm:flex-initial"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab
          profile={profile}
          countries={countries}
          initialCities={initialCities}
        />
      </TabsContent>
      <TabsContent value="music">
        <MusicTab profile={profile} allGenres={allGenres} />
      </TabsContent>
      <TabsContent value="pricing">
        <PricingTab profile={profile} />
      </TabsContent>
      <TabsContent value="highlights">
        <HighlightsTab profile={profile} />
      </TabsContent>
      <TabsContent value="team">
        <TeamTab profile={profile} />
      </TabsContent>
    </Tabs>
  );
}
