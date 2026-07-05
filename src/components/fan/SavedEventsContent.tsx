import Link from "next/link";
import { CalendarHeart } from "lucide-react";
import { getSavedEvents } from "@/lib/actions/follows";
import SavedEventListItem from "./SavedEventListItem";

export default async function SavedEventsContent() {
  const savedEvents = await getSavedEvents();

  if (savedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <CalendarHeart className="h-6 w-6 text-gray-500" />
        </div>
        <p className="text-sm font-medium text-white">No saved events yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Browse{" "}
          <Link
            href="/events"
            className="text-white underline underline-offset-2"
          >
            upcoming events
          </Link>{" "}
          and save the ones you want to attend.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-4 text-sm text-gray-500">
        {savedEvents.length} saved{" "}
        {savedEvents.length === 1 ? "event" : "events"}
      </p>
      {savedEvents.map((event) => (
        <SavedEventListItem key={event.id} event={event} />
      ))}
    </div>
  );
}
