import { headers } from "next/headers";
import { Search, LogOut } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { DashboardRangePicker } from "@/components/admin/DashboardRangePicker";
import { signOut } from "@/lib/actions/auth";

export default async function AdminTopBar() {
  const headerList = await headers();
  const rawUrl = headerList.get("x-next-url") ?? "/admin";
  const url = new URL(rawUrl, "https://djcovery.com");
  const currentRange = url.searchParams.get("range") ?? "7d";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-black/95 px-4 backdrop-blur-md md:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <form
          action="/directory"
          className="focus-within:border-h_red/40 focus-within:ring-h_red/30 flex h-9 min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white transition-colors focus-within:ring-1"
        >
          <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          <input
            name="q"
            type="search"
            placeholder="Search..."
            className="w-28 min-w-0 bg-transparent text-sm outline-none placeholder:text-gray-400 sm:w-40 md:w-56"
          />
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <DashboardRangePicker currentRange={currentRange} />
        <NotificationBell />
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
