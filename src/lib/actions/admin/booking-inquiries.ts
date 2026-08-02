"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { error: string };

export async function closeInquiry(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const inquiryId = Number(formData.get("inquiryId"));
  const reason = formData.get("reason") as string;

  if (!inquiryId || isNaN(inquiryId)) return { error: "Invalid inquiry ID" };
  if (!reason || reason.trim().length === 0)
    return { error: "Please provide a reason for closing this inquiry" };

  try {
    const inquiry = await prisma.bookingInquiry.findUnique({
      where: { id: inquiryId },
      select: { id: true },
    });
    if (!inquiry) return { error: "Inquiry not found" };

    await prisma.$transaction([
      prisma.bookingInquiry.update({
        where: { id: inquiryId },
        data: { status: "CANCELLED" },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "CLOSE_BOOKING_INQUIRY",
          targetType: "BookingInquiry",
          targetId: String(inquiryId),
          metadata: { reason: reason.trim() },
        },
      }),
    ]);

    revalidatePath("/admin/booking-inquiries");
    revalidatePath(`/admin/booking-inquiries/${inquiryId}`);
    return { success: true };
  } catch {
    return { error: "Failed to close inquiry" };
  }
}

export async function reopenInquiry(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const inquiryId = Number(formData.get("inquiryId"));

  if (!inquiryId || isNaN(inquiryId)) return { error: "Invalid inquiry ID" };

  try {
    const inquiry = await prisma.bookingInquiry.findUnique({
      where: { id: inquiryId },
      select: { id: true },
    });
    if (!inquiry) return { error: "Inquiry not found" };

    await prisma.$transaction(async (tx) => {
      const updateResult = await tx.bookingInquiry.updateMany({
        where: { id: inquiryId, status: "CANCELLED" },
        data: { status: "PENDING" },
      });
      if (updateResult.count === 0) throw new Error("NOT_CANCELLED");

      await tx.bookingInquiryMessage.create({
        data: {
          body: "[ADMIN NOTE] Inquiry reopened by admin",
          senderRole: "ORGANIZER",
          inquiryId,
          senderId: adminId,
        },
      });
      await tx.adminActionLog.create({
        data: {
          adminId,
          action: "REOPEN_BOOKING_INQUIRY",
          targetType: "BookingInquiry",
          targetId: String(inquiryId),
        },
      });
    });

    revalidatePath("/admin/booking-inquiries");
    revalidatePath(`/admin/booking-inquiries/${inquiryId}`);
    return { success: true };
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_CANCELLED") {
      return { error: "Only cancelled inquiries can be reopened" };
    }
    return { error: "Failed to reopen inquiry" };
  }
}

export async function addAdminNote(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const inquiryId = Number(formData.get("inquiryId"));
  const note = formData.get("note") as string;

  if (!inquiryId || isNaN(inquiryId)) return { error: "Invalid inquiry ID" };
  if (!note || note.trim().length === 0)
    return { error: "Please provide a note" };

  try {
    const inquiry = await prisma.bookingInquiry.findUnique({
      where: { id: inquiryId },
      select: { id: true },
    });
    if (!inquiry) return { error: "Inquiry not found" };

    await prisma.$transaction([
      prisma.bookingInquiryMessage.create({
        data: {
          body: `[ADMIN NOTE] ${note.trim()}`,
          senderRole: "ORGANIZER",
          inquiryId,
          senderId: adminId,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "ADD_ADMIN_NOTE",
          targetType: "BookingInquiry",
          targetId: String(inquiryId),
          metadata: { note: note.trim() },
        },
      }),
    ]);

    revalidatePath("/admin/booking-inquiries");
    revalidatePath(`/admin/booking-inquiries/${inquiryId}`);
    return { success: true };
  } catch {
    return { error: "Failed to add admin note" };
  }
}

export async function addAdminNoteAction(formData: FormData): Promise<void> {
  const result = await addAdminNote(formData);
  if ("error" in result) {
    throw new Error(result.error);
  }
}

export async function escalateDispute(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const inquiryId = Number(formData.get("inquiryId"));
  const description = formData.get("description") as string;

  if (!inquiryId || isNaN(inquiryId)) return { error: "Invalid inquiry ID" };
  if (!description || description.trim().length === 0)
    return { error: "Please provide a description of the dispute" };

  try {
    const inquiry = await prisma.bookingInquiry.findUnique({
      where: { id: inquiryId },
      select: {
        id: true,
        djProfile: { select: { userId: true } },
        organizerId: true,
      },
    });
    if (!inquiry) return { error: "Inquiry not found" };

    await prisma.$transaction(async (tx) => {
      await tx.bookingInquiryMessage.create({
        data: {
          body: `[DISPUTE ESCALATED] ${description.trim()}`,
          senderRole: "ORGANIZER",
          inquiryId,
          senderId: adminId,
        },
      });

      await tx.notification.create({
        data: {
          type: "NEW_COMMENT",
          recipientId: inquiry.djProfile.userId,
          data: { inquiryId },
        },
      });

      await tx.notification.create({
        data: {
          type: "NEW_COMMENT",
          recipientId: inquiry.organizerId,
          data: { inquiryId },
        },
      });

      await tx.adminActionLog.create({
        data: {
          adminId,
          action: "ESCALATE_DISPUTE",
          targetType: "BookingInquiry",
          targetId: String(inquiryId),
          metadata: { description: description.trim() },
        },
      });
    });

    revalidatePath("/admin/booking-inquiries");
    revalidatePath(`/admin/booking-inquiries/${inquiryId}`);
    return { success: true };
  } catch {
    return { error: "Failed to escalate dispute" };
  }
}

export async function resolveDispute(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const inquiryId = Number(formData.get("inquiryId"));
  const resolution = formData.get("resolution") as string;

  if (!inquiryId || isNaN(inquiryId)) return { error: "Invalid inquiry ID" };
  if (!resolution || resolution.trim().length === 0)
    return { error: "Please provide resolution notes" };

  try {
    const inquiry = await prisma.bookingInquiry.findUnique({
      where: { id: inquiryId },
      select: {
        id: true,
        djProfile: { select: { userId: true } },
        organizerId: true,
      },
    });
    if (!inquiry) return { error: "Inquiry not found" };

    await prisma.$transaction(async (tx) => {
      await tx.bookingInquiryMessage.create({
        data: {
          body: `[DISPUTE RESOLVED] ${resolution.trim()}`,
          senderRole: "ORGANIZER",
          inquiryId,
          senderId: adminId,
        },
      });

      await tx.notification.create({
        data: {
          type: "NEW_COMMENT",
          recipientId: inquiry.djProfile.userId,
          data: { inquiryId },
        },
      });

      await tx.notification.create({
        data: {
          type: "NEW_COMMENT",
          recipientId: inquiry.organizerId,
          data: { inquiryId },
        },
      });

      await tx.adminActionLog.create({
        data: {
          adminId,
          action: "RESOLVE_DISPUTE",
          targetType: "BookingInquiry",
          targetId: String(inquiryId),
          metadata: { resolution: resolution.trim() },
        },
      });
    });

    revalidatePath("/admin/booking-inquiries");
    revalidatePath(`/admin/booking-inquiries/${inquiryId}`);
    return { success: true };
  } catch {
    return { error: "Failed to resolve dispute" };
  }
}

export async function releaseContactInfo(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const inquiryId = Number(formData.get("inquiryId"));

  if (!inquiryId || isNaN(inquiryId)) return { error: "Invalid inquiry ID" };

  try {
    const inquiry = await prisma.bookingInquiry.findUnique({
      where: { id: inquiryId },
      select: { id: true, contactReleasedAt: true },
    });
    if (!inquiry) return { error: "Inquiry not found" };
    if (inquiry.contactReleasedAt)
      return { error: "Contact info already released" };

    await prisma.$transaction([
      prisma.bookingInquiry.update({
        where: { id: inquiryId },
        data: { contactReleasedAt: new Date() },
      }),
      prisma.bookingInquiryMessage.create({
        data: {
          body: "[ADMIN NOTE] Contact information released by admin",
          senderRole: "ORGANIZER",
          inquiryId,
          senderId: adminId,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "RELEASE_CONTACT_INFO",
          targetType: "BookingInquiry",
          targetId: String(inquiryId),
        },
      }),
    ]);

    revalidatePath("/admin/booking-inquiries");
    revalidatePath(`/admin/booking-inquiries/${inquiryId}`);
    return { success: true };
  } catch {
    return { error: "Failed to release contact info" };
  }
}

export async function hideContactInfo(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const inquiryId = Number(formData.get("inquiryId"));

  if (!inquiryId || isNaN(inquiryId)) return { error: "Invalid inquiry ID" };

  try {
    const inquiry = await prisma.bookingInquiry.findUnique({
      where: { id: inquiryId },
      select: { id: true, contactReleasedAt: true },
    });
    if (!inquiry) return { error: "Inquiry not found" };
    if (!inquiry.contactReleasedAt)
      return { error: "Contact info not currently released" };

    await prisma.$transaction([
      prisma.bookingInquiry.update({
        where: { id: inquiryId },
        data: { contactReleasedAt: null },
      }),
      prisma.bookingInquiryMessage.create({
        data: {
          body: "[ADMIN NOTE] Contact information hidden by admin",
          senderRole: "ORGANIZER",
          inquiryId,
          senderId: adminId,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "HIDE_CONTACT_INFO",
          targetType: "BookingInquiry",
          targetId: String(inquiryId),
        },
      }),
    ]);

    revalidatePath("/admin/booking-inquiries");
    revalidatePath(`/admin/booking-inquiries/${inquiryId}`);
    return { success: true };
  } catch {
    return { error: "Failed to hide contact info" };
  }
}

export type AdminBookingInquiry = {
  id: number;
  status: string;
  eventName: string;
  eventDate: Date | null;
  venue: string | null;
  countryName: string | null;
  cityName: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetCurrency: string | null;
  budgetType: string;
  djProfile: { id: number; stageName: string; slug: string };
  organizer: { id: string; username: string; name: string | null };
  _count: { messages: number };
  lastRespondedAt: Date | null;
  createdAt: Date;
};

export async function getAdminBookingInquiries({
  cursor,
  take = 20,
  status,
  country,
  dateRange,
}: {
  cursor?: number;
  take?: number;
  status?: string;
  country?: string;
  dateRange?: "7d" | "30d" | "90d";
}): Promise<{
  inquiries: AdminBookingInquiry[];
  nextCursor: number | null;
  averageResponseTime: number | null;
}> {
  await requireAdmin();

  try {
    const validStatuses = [
      "PENDING",
      "ACCEPTED",
      "DECLINED",
      "CANCELLED",
    ] as const;
    const isValidStatus = status && validStatuses.includes(status as any);

    let dateFilter: { createdAt?: { gte: Date } } | undefined;
    if (dateRange) {
      const now = new Date();
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      dateFilter = {
        createdAt: {
          gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
        },
      };
    }

    // Extract shared filtering criteria
    const filters = {
      ...(isValidStatus
        ? { status: status as (typeof validStatuses)[number] }
        : {}),
      ...(country
        ? { countryName: { contains: country, mode: "insensitive" as const } }
        : {}),
      ...(dateFilter || {}),
    };

    // Calculate average response time across ALL matching inquiries (not just current page)
    // Uses lastRespondedAt to measure the most recent response time per inquiry
    let averageResponseTime: number | null = null;
    const allRespondedInquiries = await prisma.bookingInquiry.findMany({
      where: {
        ...filters,
        lastRespondedAt: { not: null },
      },
      select: {
        lastRespondedAt: true,
        createdAt: true,
      },
    });

    if (allRespondedInquiries.length > 0) {
      const totalResponseTime = allRespondedInquiries.reduce((sum, inq) => {
        const responseTime =
          inq.lastRespondedAt!.getTime() - inq.createdAt.getTime();
        return sum + responseTime;
      }, 0);
      averageResponseTime =
        totalResponseTime / allRespondedInquiries.length / (1000 * 60 * 60); // Convert to hours
    }

    // Fetch paginated inquiries for display
    const inquiries = await prisma.bookingInquiry.findMany({
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: filters,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        status: true,
        eventName: true,
        eventDate: true,
        venue: true,
        countryName: true,
        cityName: true,
        budgetMin: true,
        budgetMax: true,
        budgetCurrency: true,
        budgetType: true,
        djProfile: { select: { id: true, stageName: true, slug: true } },
        organizer: { select: { id: true, username: true, name: true } },
        _count: { select: { messages: true } },
        lastRespondedAt: true,
        createdAt: true,
      },
    });

    const hasNextPage = inquiries.length > take;
    if (hasNextPage) inquiries.pop();

    return {
      inquiries: inquiries as AdminBookingInquiry[],
      nextCursor: hasNextPage
        ? (inquiries[inquiries.length - 1]?.id ?? null)
        : null,
      averageResponseTime,
    };
  } catch (error) {
    console.error("Error fetching admin booking inquiries:", error);
    return { inquiries: [], nextCursor: null, averageResponseTime: null };
  }
}

export type BookingInquiryDetail = {
  id: number;
  status: string;
  eventName: string;
  eventDate: Date | null;
  venue: string | null;
  countryName: string | null;
  cityName: string | null;
  crowdSize: number | null;
  budgetType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetCurrency: string | null;
  message: string;
  contactReleasedAt: Date | null;
  lastRespondedAt: Date | null;
  packageName: string | null;
  packagePrice: number | null;
  packagePriceTo: number | null;
  createdAt: Date;
  updatedAt: Date;
  country: { name: string } | null;
  city: { name: string } | null;
  djProfile: {
    id: number;
    stageName: string;
    slug: string;
    avatar: string | null;
    user: { id: string; email: string | null; name: string | null };
  };
  organizer: {
    id: string;
    username: string;
    name: string | null;
    email: string | null;
    organizerProfile: {
      id: number;
      displayName: string;
      city: { name: string } | null;
      country: { name: string } | null;
    } | null;
  };
  messages: {
    id: number;
    body: string;
    senderRole: string;
    readAt: Date | null;
    createdAt: Date;
    sender: { id: string; name: string | null; username: string };
  }[];
  adminActions: {
    id: number;
    action: string;
    admin: { name: string | null; username: string } | null;
    createdAt: Date;
    metadata: any;
  }[];
};

export async function getBookingInquiryDetails(
  inquiryId: number,
): Promise<BookingInquiryDetail | null> {
  await requireAdmin();

  const inquiry = await prisma.bookingInquiry.findUnique({
    where: { id: inquiryId },
    include: {
      country: { select: { name: true } },
      city: { select: { name: true } },
      djProfile: {
        select: {
          id: true,
          stageName: true,
          slug: true,
          avatar: true,
          user: { select: { id: true, email: true, name: true } },
        },
      },
      organizer: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          organizerProfile: {
            select: {
              id: true,
              displayName: true,
              city: { select: { name: true } },
              country: { select: { name: true } },
            },
          },
        },
      },
      messages: {
        select: {
          id: true,
          body: true,
          senderRole: true,
          readAt: true,
          createdAt: true,
          sender: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!inquiry) return null;

  const adminActions = await prisma.adminActionLog.findMany({
    where: { targetId: String(inquiryId), targetType: "BookingInquiry" },
    select: {
      id: true,
      action: true,
      admin: { select: { name: true, username: true } },
      createdAt: true,
      metadata: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter out null admin entries (shouldn't happen, but type safety)
  const filteredAdminActions = adminActions.filter((a) => a.admin !== null);

  return {
    id: inquiry.id,
    status: inquiry.status,
    eventName: inquiry.eventName,
    eventDate: inquiry.eventDate,
    venue: inquiry.venue,
    countryName: inquiry.countryName,
    cityName: inquiry.cityName,
    crowdSize: inquiry.crowdSize,
    budgetType: inquiry.budgetType,
    budgetMin: inquiry.budgetMin,
    budgetMax: inquiry.budgetMax,
    budgetCurrency: inquiry.budgetCurrency,
    message: inquiry.message,
    contactReleasedAt: inquiry.contactReleasedAt,
    lastRespondedAt: inquiry.lastRespondedAt,
    packageName: inquiry.packageName,
    packagePrice: inquiry.packagePrice,
    packagePriceTo: inquiry.packagePriceTo,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
    country: inquiry.country,
    city: inquiry.city,
    djProfile: inquiry.djProfile,
    organizer: inquiry.organizer,
    messages: inquiry.messages,
    adminActions: filteredAdminActions,
  };
}
