import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import prisma from "@/lib/client";
import { getNavUser } from "@/lib/auth/getNavUser";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin — DJcovery",
  },
};

async function getOpenReportCount(): Promise<number> {
  try {
    return await prisma.report.count({ where: { status: "OPEN" } });
  } catch {
    return 0;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const openReportCount = await getOpenReportCount();
  const navUser = await getNavUser();

  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar
        openReportCount={openReportCount}
        admin={{
          displayName: navUser.displayName,
          email: navUser.username,
          avatarSrc: navUser.avatarSrc,
          initials: navUser.initials,
        }}
      />
      <div className="ml-16 lg:ml-64">
        <AdminTopBar />
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
