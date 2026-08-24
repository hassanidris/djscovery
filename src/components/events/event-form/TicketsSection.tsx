"use client";

import { Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventFormErrors } from "./types";

export function TicketsSection({
  data,
  set,
  errors,
}: {
  data: { ticketUrl: string };
  set: (field: "ticketUrl", value: unknown) => void;
  errors: EventFormErrors;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
        <Ticket className="h-4 w-4" /> Tickets
      </h2>
      <div className="space-y-1.5">
        <Label htmlFor="ticketUrl" className="text-zinc-300">
          Ticket URL
        </Label>
        <Input
          id="ticketUrl"
          value={data.ticketUrl}
          onChange={(e) => set("ticketUrl", e.target.value)}
          placeholder="https://ra.co/events/…"
          className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
        />
        {errors.ticketUrl && (
          <p className="text-xs text-red-400">{errors.ticketUrl}</p>
        )}
      </div>
    </section>
  );
}
