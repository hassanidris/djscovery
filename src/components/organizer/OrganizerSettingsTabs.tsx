"use client";

import dynamic from "next/dynamic";
import { Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProfileData, Country, City } from "./settings-tabs/types";

// Lazy-load each tab so only the active tab's JS ships to the client.
const ProfileTab = dynamic(() => import("./settings-tabs/ProfileTab"), {
  loading: () => null,
});
const ContactTab = dynamic(() => import("./settings-tabs/ContactTab"), {
  loading: () => null,
});
const SocialTab = dynamic(() => import("./settings-tabs/SocialTab"), {
  loading: () => null,
});

interface Props {
  profile: ProfileData;
  countries: Country[];
  initialCities: City[];
}

export default function OrganizerSettingsTabs({
  profile,
  countries,
  initialCities,
}: Props) {
  return (
    <Tabs defaultValue="profile">
      {/* Info banner — distinguishes organizer profile from personal account */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
        <p className="text-xs text-blue-300">
          This is your <strong>public organizer profile</strong> — what DJs see
          when you post a gig. For security settings (password), visit{" "}
          <a
            href="/organizer/account"
            className="underline underline-offset-2 hover:text-blue-200"
          >
            Account Settings
          </a>
          .
        </p>
      </div>

      <TabsList variant="line" className="mb-8 w-full justify-start">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="social">Social Links</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <div className="p-6">
          <ProfileTab
            profile={profile}
            countries={countries}
            initialCities={initialCities}
          />
        </div>
      </TabsContent>

      <TabsContent value="contact">
        <div className="p-6">
          <ContactTab profile={profile} />
        </div>
      </TabsContent>

      <TabsContent value="social">
        <div className="p-6">
          <SocialTab profile={profile} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
