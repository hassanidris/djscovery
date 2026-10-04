"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PublicShell({
  children,
  navbar,
  footer,
  mobileNav,
  skipNavForPaths = [],
}: {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
  mobileNav: React.ReactNode;
  skipNavForPaths?: string[];
}) {
  const pathname = usePathname() ?? "/";
  const isAdminRoute = pathname.startsWith("/admin");
  const shouldSkipNav = skipNavForPaths.some((path) =>
    pathname.startsWith(path),
  );

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {!isAdminRoute && !shouldSkipNav && (
        <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-white/5 bg-black/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 md:px-8">{navbar}</div>
        </header>
      )}
      <main
        className={cn(
          "w-full flex-1 bg-black pb-20",
          isAdminRoute || shouldSkipNav ? "mt-0" : "mt-14 md:mt-16 md:pb-0",
        )}
      >
        {children}
      </main>
      {!isAdminRoute && !shouldSkipNav && (
        <div className="hidden w-full md:block">{footer}</div>
      )}
      {!isAdminRoute && !shouldSkipNav && mobileNav}
    </div>
  );
}
