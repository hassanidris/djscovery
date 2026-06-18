import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getNavUser } from "@/lib/auth/getNavUser";
import AccountTabs from "@/components/account/AccountTabs";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, displayName, avatarSrc, initials } = await getNavUser();
  if (!isLoggedIn) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/10">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                {initials}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{displayName}</h1>
            <p className="mt-0.5 text-sm text-gray-400">Your account</p>
          </div>
        </div>

        <AccountTabs />

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
