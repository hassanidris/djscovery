"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  MarkHireCompletedSchema,
  MarkHireNoShowSchema,
  CancelHireSchema,
  UpdateHireNotesSchema,
} from "@/lib/validations/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { error: string };

export async function markHireCompleted(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = MarkHireCompletedSchema.safeParse({
    hireId: formData.get("hireId"),
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { hireId } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const result = await tx.hire.updateMany({
        where: { id: hireId, status: "ACTIVE" },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      if (result.count === 0) {
        throw new Error("Hire not found or not in ACTIVE status");
      }

      await tx.adminActionLog.create({
        data: {
          adminId,
          action: "MARK_HIRE_COMPLETED",
          targetType: "Hire",
          targetId: String(hireId),
        },
      });
    });

    revalidatePath("/admin/hires");
    revalidatePath(`/admin/hires/${hireId}`);
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Hire not found or not in ACTIVE status"
    ) {
      return { error: error.message };
    }
    return { error: "Failed to mark hire as completed" };
  }
}

export async function markHireNoShow(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = MarkHireNoShowSchema.safeParse({
    hireId: formData.get("hireId"),
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { hireId } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const result = await tx.hire.updateMany({
        where: { id: hireId, status: "ACTIVE" },
        data: { status: "NO_SHOW", noShow: true },
      });

      if (result.count === 0) {
        throw new Error("Hire not found or not in ACTIVE status");
      }

      await tx.adminActionLog.create({
        data: {
          adminId,
          action: "MARK_HIRE_NO_SHOW",
          targetType: "Hire",
          targetId: String(hireId),
        },
      });
    });

    revalidatePath("/admin/hires");
    revalidatePath(`/admin/hires/${hireId}`);
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Hire not found or not in ACTIVE status"
    ) {
      return { error: error.message };
    }
    return { error: "Failed to mark hire as no-show" };
  }
}

export async function cancelHire(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = CancelHireSchema.safeParse({
    hireId: formData.get("hireId"),
    reason: formData.get("reason") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { hireId, reason } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const result = await tx.hire.updateMany({
        where: { id: hireId, status: "ACTIVE" },
        data: {
          status: "CANCELLED_BY_ADMIN",
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      if (result.count === 0) {
        throw new Error("Hire not found or not in ACTIVE status");
      }

      await tx.adminActionLog.create({
        data: {
          adminId,
          action: "CANCEL_HIRE",
          targetType: "Hire",
          targetId: String(hireId),
          metadata: reason ? { reason } : undefined,
        },
      });
    });

    revalidatePath("/admin/hires");
    revalidatePath(`/admin/hires/${hireId}`);
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Hire not found or not in ACTIVE status"
    ) {
      return { error: error.message };
    }
    return { error: "Failed to cancel hire" };
  }
}

export async function updateHireNotes(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = UpdateHireNotesSchema.safeParse({
    hireId: formData.get("hireId"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { hireId, notes } = parsed.data;

  try {
    const hire = await prisma.hire.findUnique({
      where: { id: hireId },
      select: { id: true },
    });
    if (!hire) return { error: "Hire not found" };

    await prisma.$transaction([
      prisma.hire.update({
        where: { id: hireId },
        data: { notes },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "UPDATE_HIRE_NOTES",
          targetType: "Hire",
          targetId: String(hireId),
        },
      }),
    ]);

    revalidatePath("/admin/hires");
    revalidatePath(`/admin/hires/${hireId}`);
    return { success: true };
  } catch {
    return { error: "Failed to update hire notes" };
  }
}

export type AdminHire = {
  id: number;
  applicationId: number;
  agreedRate: any | null;
  notes: string | null;
  status:
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED_BY_DJ"
    | "CANCELLED_BY_ORGANIZER"
    | "NO_SHOW";
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  noShow: boolean;
  createdAt: Date;
  updatedAt: Date;
  application: {
    id: number;
    djProfile: {
      id: number;
      stageName: string;
      slug: string;
      user: {
        id: string;
        email: string;
      };
    };
    gig: {
      id: number;
      title: string;
      slug: string;
      eventDate: Date;
      venueName: string | null;
      country: {
        name: string;
      } | null;
      city: {
        name: string;
      } | null;
      organizerProfile: {
        id: number;
        displayName: string;
        slug: string;
        user: {
          id: string;
        };
      };
    };
  };
};

export async function getAdminHires({
  cursor,
  take = 20,
  status,
  dateFrom,
  dateTo,
  country,
}: {
  cursor?: number;
  take?: number;
  status?:
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED_BY_DJ"
    | "CANCELLED_BY_ORGANIZER"
    | "CANCELLED_BY_ADMIN"
    | "NO_SHOW";
  dateFrom?: Date;
  dateTo?: Date;
  country?: string;
}): Promise<{
  hires: AdminHire[];
  nextCursor: number | null;
  totalRevenue: number;
}> {
  await requireAdmin();

  // Create shared where constant merging eventDate and country under application.gig
  const where: any = {
    ...(status ? { status } : {}),
  };

  if (dateFrom || dateTo || country) {
    where.application = {
      gig: {
        ...(dateFrom || dateTo
          ? {
              eventDate: {
                ...(dateFrom ? { gte: dateFrom } : {}),
                ...(dateTo ? { lte: dateTo } : {}),
              },
            }
          : {}),
        ...(country
          ? {
              country: {
                name: { contains: country, mode: "insensitive" as const },
              },
            }
          : {}),
      },
    };
  }

  const hires = await prisma.hire.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      applicationId: true,
      agreedRate: true,
      notes: true,
      status: true,
      completedAt: true,
      cancelledAt: true,
      cancellationReason: true,
      noShow: true,
      createdAt: true,
      updatedAt: true,
      application: {
        select: {
          id: true,
          djProfile: {
            select: {
              id: true,
              stageName: true,
              slug: true,
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          gig: {
            select: {
              id: true,
              title: true,
              slug: true,
              eventDate: true,
              venueName: true,
              country: {
                select: {
                  name: true,
                },
              },
              city: {
                select: {
                  name: true,
                },
              },
              organizerProfile: {
                select: {
                  id: true,
                  displayName: true,
                  slug: true,
                  user: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const hasNextPage = hires.length > take;
  if (hasNextPage) hires.pop();

  // Calculate total revenue from all hires (not just current page)
  const totalRevenue = await prisma.hire.aggregate({
    where: { ...where, agreedRate: { not: null } },
    _sum: {
      agreedRate: true,
    },
  });

  return {
    hires: hires as AdminHire[],
    nextCursor: hasNextPage ? (hires[hires.length - 1]?.id ?? null) : null,
    totalRevenue: totalRevenue._sum?.agreedRate?.toNumber() || 0,
  };
}

export async function getAdminHireById(
  hireId: number,
): Promise<AdminHire | null> {
  await requireAdmin();

  const hire = await prisma.hire.findUnique({
    where: { id: hireId },
    select: {
      id: true,
      applicationId: true,
      agreedRate: true,
      notes: true,
      status: true,
      completedAt: true,
      cancelledAt: true,
      cancellationReason: true,
      noShow: true,
      createdAt: true,
      updatedAt: true,
      application: {
        select: {
          id: true,
          djProfile: {
            select: {
              id: true,
              stageName: true,
              slug: true,
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          gig: {
            select: {
              id: true,
              title: true,
              slug: true,
              eventDate: true,
              venueName: true,
              country: {
                select: {
                  name: true,
                },
              },
              city: {
                select: {
                  name: true,
                },
              },
              organizerProfile: {
                select: {
                  id: true,
                  displayName: true,
                  slug: true,
                  user: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return hire as AdminHire | null;
}
