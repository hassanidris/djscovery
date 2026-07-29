"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { error: string };

export async function hideEvent(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const eventId = Number(formData.get("eventId"));
  if (!eventId || isNaN(eventId)) return { error: "Invalid event ID" };

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { slug: true },
    });
    if (!event) return { error: "Event not found" };

    await prisma.$transaction([
      prisma.event.update({ where: { id: eventId }, data: { hidden: true } }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "HIDE_EVENT",
          targetType: "Event",
          targetId: String(eventId),
        },
      }),
    ]);

    revalidatePath("/admin/events");
    revalidatePath(`/events/${event.slug}`);
    return { success: true };
  } catch {
    return { error: "Failed to hide event" };
  }
}

export async function unhideEvent(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const eventId = Number(formData.get("eventId"));
  if (!eventId || isNaN(eventId)) return { error: "Invalid event ID" };

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { slug: true },
    });
    if (!event) return { error: "Event not found" };

    await prisma.$transaction([
      prisma.event.update({ where: { id: eventId }, data: { hidden: false } }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "UNHIDE_EVENT",
          targetType: "Event",
          targetId: String(eventId),
        },
      }),
    ]);

    revalidatePath("/admin/events");
    revalidatePath(`/events/${event.slug}`);
    return { success: true };
  } catch {
    return { error: "Failed to unhide event" };
  }
}

export async function deleteEventReview(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const reviewId = Number(formData.get("reviewId"));
  if (!reviewId || isNaN(reviewId)) return { error: "Invalid review ID" };

  try {
    const review = await prisma.eventReview.findUnique({
      where: { id: reviewId },
      select: { eventId: true, event: { select: { slug: true } } },
    });
    if (!review) return { error: "Review not found" };

    await prisma.$transaction([
      prisma.eventReview.delete({ where: { id: reviewId } }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "DELETE_EVENT_REVIEW",
          targetType: "EventReview",
          targetId: String(reviewId),
        },
      }),
    ]);

    revalidatePath("/admin/events");
    revalidatePath(`/events/${review.event.slug}`);
    return { success: true };
  } catch {
    return { error: "Failed to delete review" };
  }
}

export async function requestEventEdit(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const eventId = Number(formData.get("eventId"));
  const adminComment = formData.get("adminComment") as string;

  if (!eventId || isNaN(eventId)) return { error: "Invalid event ID" };
  if (!adminComment || adminComment.trim().length === 0)
    return {
      error: "Please provide a comment explaining what needs to be edited",
    };

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        slug: true,
        ownerDjId: true,
        updatedAt: true,
        ownerDj: { select: { userId: true } },
      },
    });
    if (!event) return { error: "Event not found" };

    await prisma.$transaction(async (tx) => {
      const moderation = await tx.eventModeration.create({
        data: {
          status: "PENDING",
          adminComment: adminComment.trim(),
          adminId,
          eventId,
          eventUpdatedAt: event.updatedAt,
        },
      });

      await tx.notification.create({
        data: {
          type: "EVENT_EDIT_REQUESTED",
          recipientId: event.ownerDj.userId,
          data: { eventId, moderationId: moderation.id },
        },
      });

      await tx.adminActionLog.create({
        data: {
          adminId,
          action: "REQUEST_EVENT_EDIT",
          targetType: "Event",
          targetId: String(eventId),
          metadata: { comment: adminComment.trim() },
        },
      });
    });

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${eventId}`);
    return { success: true };
  } catch {
    return { error: "Failed to request event edit" };
  }
}

export async function requestEventEditAction(
  formData: FormData,
): Promise<void> {
  const result = await requestEventEdit(formData);
  if ("error" in result) {
    throw new Error(result.error);
  }
}

export async function resolveEventModeration(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const moderationId = Number(formData.get("moderationId"));
  if (!moderationId || isNaN(moderationId))
    return { error: "Invalid moderation ID" };

  try {
    const moderation = await prisma.eventModeration.findUnique({
      where: { id: moderationId },
      select: {
        eventId: true,
        event: { select: { slug: true } },
      },
    });
    if (!moderation) return { error: "Moderation request not found" };

    await prisma.$transaction([
      prisma.eventModeration.update({
        where: { id: moderationId },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "RESOLVE_EVENT_MODERATION",
          targetType: "EventModeration",
          targetId: String(moderationId),
        },
      }),
    ]);

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${moderation.eventId}`);
    return { success: true };
  } catch {
    return { error: "Failed to resolve moderation request" };
  }
}

export async function dismissEventModeration(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const moderationId = Number(formData.get("moderationId"));
  if (!moderationId || isNaN(moderationId))
    return { error: "Invalid moderation ID" };

  try {
    const moderation = await prisma.eventModeration.findUnique({
      where: { id: moderationId },
      select: {
        eventId: true,
        event: { select: { slug: true } },
      },
    });
    if (!moderation) return { error: "Moderation request not found" };

    await prisma.$transaction([
      prisma.eventModeration.update({
        where: { id: moderationId },
        data: { status: "DISMISSED" },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "DISMISS_EVENT_MODERATION",
          targetType: "EventModeration",
          targetId: String(moderationId),
        },
      }),
    ]);

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${moderation.eventId}`);
    return { success: true };
  } catch {
    return { error: "Failed to dismiss moderation request" };
  }
}

export type AdminEvent = {
  id: number;
  title: string;
  slug: string;
  status: string;
  eventType: string;
  category: string;
  hidden: boolean;
  featured: boolean;
  viewCount: number;
  startDate: Date;
  endDate: Date | null;
  country: { name: string } | null;
  city: { name: string } | null;
  ownerDj: { stageName: string; slug: string };
  _count: { participants: number; eventReviews: number };
};

export async function getAdminEvents({
  cursor,
  take = 20,
  status,
  category,
  country,
}: {
  cursor?: number;
  take?: number;
  status?: string;
  category?: string;
  country?: string;
}): Promise<{ events: AdminEvent[]; nextCursor: number | null }> {
  await requireAdmin();

  try {
    const validStatuses = [
      "DRAFT",
      "PUBLISHED",
      "COMPLETED",
      "CANCELLED",
      "ARCHIVED",
    ] as const;
    const isValidStatus = status && validStatuses.includes(status as any);

    const events = await prisma.event.findMany({
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: {
        deletedAt: null,
        ...(isValidStatus
          ? { status: status as (typeof validStatuses)[number] }
          : {}),
        ...(category ? { category } : {}),
        ...(country
          ? { country: { name: { contains: country, mode: "insensitive" } } }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        eventType: true,
        category: true,
        hidden: true,
        featured: true,
        viewCount: true,
        startDate: true,
        endDate: true,
        country: { select: { name: true } },
        city: { select: { name: true } },
        ownerDj: { select: { stageName: true, slug: true } },
        _count: { select: { participants: true, eventReviews: true } },
      },
    });

    const hasNextPage = events.length > take;
    if (hasNextPage) events.pop();

    return {
      events,
      nextCursor: hasNextPage ? (events[events.length - 1]?.id ?? null) : null,
    };
  } catch (error) {
    console.error("Error fetching admin events:", error);
    return { events: [], nextCursor: null };
  }
}

export type EventDetail = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  eventType: string;
  category: string;
  posterUrl: string | null;
  venue: string | null;
  startDate: Date;
  endDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  timezone: string | null;
  ticketUrl: string | null;
  recap: string | null;
  audioLink: string | null;
  videoLink: string | null;
  featured: boolean;
  viewCount: number;
  genres: string[];
  status: string;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  country: { name: string } | null;
  city: { name: string } | null;
  ownerDj: {
    id: number;
    stageName: string;
    slug: string;
    avatar: string | null;
  };
  participants: {
    djProfile: {
      id: number;
      stageName: string;
      slug: string;
      avatar: string | null;
    };
    role: string | null;
  }[];
  gallery: {
    id: number;
    url: string;
    caption: string | null;
    sortOrder: number;
  }[];
  eventReviews: {
    id: number;
    rating: number;
    review: string | null;
    reviewType: string | null;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      username: string;
    };
  }[];
  moderations: {
    id: number;
    status: string;
    adminComment: string;
    createdAt: Date;
    resolvedAt: Date | null;
    admin: {
      name: string | null;
      username: string;
    };
  }[];
};

export async function getEventDetails(
  eventId: number,
): Promise<EventDetail | null> {
  await requireAdmin();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      country: { select: { name: true } },
      city: { select: { name: true } },
      ownerDj: {
        select: {
          id: true,
          stageName: true,
          slug: true,
          avatar: true,
        },
      },
      participants: {
        select: {
          djProfile: {
            select: {
              id: true,
              stageName: true,
              slug: true,
              avatar: true,
            },
          },
          role: true,
        },
      },
      gallery: {
        select: {
          id: true,
          url: true,
          caption: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      eventReviews: {
        select: {
          id: true,
          rating: true,
          review: true,
          reviewType: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!event) return null;

  // Fetch moderations separately
  const moderations = await prisma.eventModeration.findMany({
    where: { eventId },
    select: {
      id: true,
      status: true,
      adminComment: true,
      createdAt: true,
      resolvedAt: true,
      admin: {
        select: {
          name: true,
          username: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    eventType: event.eventType,
    category: event.category,
    posterUrl: event.posterUrl,
    venue: event.venue,
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
    timezone: event.timezone,
    ticketUrl: event.ticketUrl,
    recap: event.recap,
    audioLink: event.audioLink,
    videoLink: event.videoLink,
    featured: event.featured,
    viewCount: event.viewCount,
    genres: event.genres,
    status: event.status,
    hidden: event.hidden,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    country: event.country,
    city: event.city,
    ownerDj: event.ownerDj,
    participants: event.participants,
    gallery: event.gallery,
    eventReviews: event.eventReviews,
    moderations,
  };
}
