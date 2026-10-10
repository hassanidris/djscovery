import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import prisma from "@/lib/client";

export async function GET() {
  await requireAdmin();

  const entries = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Name",
    "Email",
    "Is DJ",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "Created At",
  ];

  const rows = entries.map((entry) => [
    entry.name ?? "",
    entry.email,
    entry.isDj ? "Yes" : "No",
    entry.utmSource ?? "",
    entry.utmMedium ?? "",
    entry.utmCampaign ?? "",
    entry.createdAt.toISOString(),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell);
          // Prefix with apostrophe to neutralize CSV formula injection
          const sanitized = /^[=+\-@\t\n\r]/.test(cellStr)
            ? `'${cellStr}`
            : cellStr;
          return `"${sanitized.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="founding-waitlist-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
