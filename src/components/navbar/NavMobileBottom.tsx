"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { bottomNavByRole, type NavRole } from "@/config/navigation";

type Props = {
  navRole: NavRole;
  username: string | null;
  djSlug: string | null;
  avatarSrc: string | null;
  initials: string;
};

export default function NavMobileBottom({
  navRole,
  username,
  djSlug,
  avatarSrc,
  initials,
}: Props) {
  const pathname = usePathname();
  const items = bottomNavByRole[navRole];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-black/95 backdrop-blur-sm md:hidden"
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
                className="flex flex-1 cursor-not-allowed flex-col items-center justify-center gap-1 py-3 text-gray-700 select-none"
                aria-disabled="true"
                aria-label={`${item.label} — Coming Soon`}
              >
                <Icon className="h-5.5 w-5.5 shrink-0" aria-hidden />
                <span className="text-[11px] leading-none font-medium">
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
                  : "/account";
            const isActive =
              pathname.startsWith("/djs/") ||
              pathname.startsWith("/account") ||
              pathname === "/settings";

            return (
              <Link
                key={item.id}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300 active:text-gray-200",
                )}
                aria-label="You"
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "h-5.5 w-5.5 shrink-0 overflow-hidden rounded-full",
                    isActive ? "ring-h_red ring-1" : "ring-1 ring-white/25",
                  )}
                >
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt=""
                      width={22}
                      height={22}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-h_redDark flex h-full w-full items-center justify-center text-[8px] font-bold text-white">
                      {initials}
                    </div>
                  )}
                </div>
                <span className="text-[11px] leading-none font-medium">
                  You
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
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors",
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-300 active:text-gray-200",
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5.5 w-5.5 shrink-0 transition-colors",
                  isActive ? "text-h_red/80" : "",
                )}
                aria-hidden
              />
              <span className="text-[11px] leading-none font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
