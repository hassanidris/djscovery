"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { bottomNavByRole, type NavRole } from "@/config/navigation";

type Props = {
  navRole: NavRole;
  username: string | null;
  djSlug: string | null;
};

export default function NavMobileBottom({ navRole, username, djSlug }: Props) {
  const pathname = usePathname();
  const items = bottomNavByRole[navRole];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-black/95 backdrop-blur-sm border-t border-white/8"
      aria-label="Bottom navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;

          /* Coming-soon items: visible, non-interactive */
          if (item.comingSoon) {
            return (
              <span
                key={item.id}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-3 text-gray-700 cursor-not-allowed select-none"
                aria-disabled="true"
                aria-label={`${item.label} — Coming Soon`}
              >
                <Icon className="h-5.5 w-5.5 shrink-0" aria-hidden />
                <span className="text-[10px] font-medium leading-none">
                  {item.label}
                </span>
              </span>
            );
          }

          /* Profile item — dynamic href, DJ goes to /djs/[slug] */
          if (item.id === "profile") {
            const href =
              navRole === "dj" && djSlug
                ? `/djs/${djSlug}`
                : navRole === "dj"
                  ? "/become-dj"
                  : username
                    ? `/profile/${username}`
                    : "/settings";
            const isActive =
              pathname.startsWith("/djs/") ||
              pathname.startsWith("/profile") ||
              pathname === "/settings";

            return (
              <Link
                key={item.id}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-300 active:text-gray-200",
                )}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-5.5 w-5.5 shrink-0 transition-colors",
                    isActive ? "text-h_red" : "",
                  )}
                  aria-hidden
                />
                <span className="text-[10px] font-medium leading-none">
                  {item.label}
                </span>
              </Link>
            );
          }

          /* Regular items */
          const isActive = item.href
            ? item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
            : false;

          return (
            <Link
              key={item.id}
              href={item.href!}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-colors",
                isActive
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300 active:text-gray-200",
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5.5 w-5.5 shrink-0 transition-colors",
                  isActive ? "text-h_red" : "",
                )}
                aria-hidden
              />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
