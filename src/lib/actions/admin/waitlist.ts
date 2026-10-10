import { Prisma } from "@prisma/client";
import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export type WaitlistListFilters = {
  query?: string;
  isDj?: string;
  page?: number;
};

export async function getWaitlistEntries(filters: WaitlistListFilters = {}) {
  await requireAdmin();

  const query = filters.query?.trim().slice(0, 120) ?? "";
  const isDj =
    filters.isDj === "yes" ? true : filters.isDj === "no" ? false : undefined;
  const page = Number.isInteger(filters.page)
    ? Math.max(1, filters.page ?? 1)
    : 1;
  const pageSize = 20;

  const where: Prisma.WaitlistEntryWhereInput = {
    ...(isDj !== undefined ? { isDj } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [entries, total, djCount, nonDjCount] = await prisma.$transaction([
    prisma.waitlistEntry.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.waitlistEntry.count({ where }),
    prisma.waitlistEntry.count({ where: { isDj: true } }),
    prisma.waitlistEntry.count({ where: { isDj: false } }),
  ]);

  return {
    entries,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    analytics: {
      total,
      djCount,
      nonDjCount,
    },
  };
}
