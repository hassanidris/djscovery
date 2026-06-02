"use client";

import { useState, useTransition } from "react";
import { assignRole } from "@/lib/actions/auth";
import Footer from "@/components/Footer";

export default function SelectRolePage() {
  const [role, setRole] = useState<"DJ" | "ORGANIZER" | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!role) return;
    startTransition(() => assignRole(role));
  };

  return (
    <>
      <div className="h-[calc(100vh-96px)] flex items-center justify-center">
        <div className="bg-white/5 border border-white/60 p-10 space-y-8 rounded-lg w-full max-w-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Select Your Role</h1>
            <p className="text-gray-400 text-sm">
              All signed-in users can interact as fans by default. Select an
              additional role if you want to list as a DJ or post gigs as an
              Organizer.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <label
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                role === "DJ"
                  ? "border-h_red bg-h_red/10 text-white"
                  : "border-white/20 text-gray-300 hover:border-white/40"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="DJ"
                checked={role === "DJ"}
                onChange={() => setRole("DJ")}
                className="sr-only"
              />
              <span className="font-semibold text-lg">DJ</span>
              <span className="text-sm text-gray-400 ml-auto">
                Public profile · Book gigs
              </span>
            </label>
            <label
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                role === "ORGANIZER"
                  ? "border-h_red bg-h_red/10 text-white"
                  : "border-white/20 text-gray-300 hover:border-white/40"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="ORGANIZER"
                checked={role === "ORGANIZER"}
                onChange={() => setRole("ORGANIZER")}
                className="sr-only"
              />
              <span className="font-semibold text-lg">Organizer</span>
              <span className="text-sm text-gray-400 ml-auto">
                Post gigs · Manage events
              </span>
            </label>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!role || isPending}
            className="w-full bg-h_red hover:bg-h_redDark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            {isPending ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
