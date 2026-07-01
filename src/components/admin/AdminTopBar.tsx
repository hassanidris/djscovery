import { headers } from "next/headers";
import { Search } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNavUser } from "@/lib/auth/getNavUser";
import { DashboardRangePicker } from "@/components/admin/DashboardRangePicker";

export default async function AdminTopBar() {
  const navUser = await getNavUser();
  const headerList = await headers();
  const rawUrl = headerList.get("x-next-url") ?? "/admin";
  const url = new URL(rawUrl, "https://djcovery.com");
  const currentRange = url.searchParams.get("range") ?? "7d";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-black/95 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-4">
        <form
          action="/directory"
          className="focus-within:border-h_red/40 focus-within:ring-h_red/30 flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white transition-colors focus-within:ring-1"
        >
          <Search className="h-4 w-4 text-gray-500" aria-hidden />
          <input
            name="q"
            type="search"
            placeholder="Search..."
            className="w-40 bg-transparent text-sm outline-none placeholder:text-gray-500 md:w-56"
          />
        </form>
      </div>

      <div className="flex items-center gap-3">
        <DashboardRangePicker currentRange={currentRange} />
        <NotificationBell />
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1.5">
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarImage
              src={navUser.avatarSrc ?? undefined}
              alt={navUser.displayName}
            />
            <AvatarFallback className="text-xs text-white">
              {navUser.initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
