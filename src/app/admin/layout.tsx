import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import prisma from "@/lib/client";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin — DJscovery",
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

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="flex gap-6">
          <AdminSidebar openReportCount={openReportCount} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
