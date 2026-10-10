import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import prisma from "@/lib/client";

export async function GET() {
  await requireAdmin();

  const members = await prisma.foundingMember.findMany({
    include: {
      djProfile: {
        select: {
          stageName: true,
          user: {
            select: { name: true, email: true },
          },
          city: {
            select: {
              name: true,
              country: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const headers = [
    "Founding Number",
    "Stage Name",
    "Name",
    "Email",
    "Status",
    "Location",
    "Joined At",
    "Launched At",
    "Revoked At",
    "Notes",
  ];

  const rows = members.map((member) => [
    member.foundingNumber ?? "",
    member.djProfile.stageName,
    member.djProfile.user.name,
    member.djProfile.user.email,
    member.status,
    [
      member.djProfile.city?.name,
      member.djProfile.city?.country?.name,
    ]
      .filter(Boolean)
      .join(", "),
    member.joinedAt.toISOString(),
    member.launchedAt?.toISOString() ?? "",
    member.revokedAt?.toISOString() ?? "",
    member.notes ?? "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="founding-members-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
