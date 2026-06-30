"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  bookingInquiryReceivedHtml,
  bookingInquiryReceivedSubject,
} from "@/lib/email/templates/bookingInquiryReceived";
import {
  bookingInquiryResponseHtml,
  bookingInquiryResponseSubject,
} from "@/lib/email/templates/bookingInquiryResponse";
import {
  bookingInquiryMessageHtml,
  bookingInquiryMessageSubject,
} from "@/lib/email/templates/bookingInquiryMessage";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://djcovery.com";
const RATE_LIMIT_WINDOW_HOURS = 24;
const prismaUnsafe = prisma as Record<string, any>;

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

type BookingInquiryStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
type BookingInquiryParticipantRole = "DJ" | "ORGANIZER";

const submitBookingInquirySchema = z
  .object({
    djProfileId: z.number().int().positive(),
    eventName: z.string().trim().min(3).max(80),
    eventDate: z
      .union([z.date(), z.string().trim().min(4), z.null()])
      .optional(),
    venue: z.string().trim().max(120).optional().nullable(),
    city: z.string().trim().max(120).optional().nullable(),
    crowdSize: z.number().int().positive().max(200000).optional().nullable(),
    budgetMin: z
      .number()
      .int()
      .nonnegative()
      .max(1_000_000)
      .optional()
      .nullable(),
    budgetMax: z
      .number()
      .int()
      .nonnegative()
      .max(1_000_000)
      .optional()
      .nullable(),
    budgetCurrency: z.string().trim().min(2).max(10).optional().nullable(),
    message: z.string().trim().min(30).max(1500),
  })
  .superRefine((value, ctx) => {
    if (
      value.budgetMin !== null &&
      value.budgetMin !== undefined &&
      value.budgetMax !== null &&
      value.budgetMax !== undefined &&
      value.budgetMax < value.budgetMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Budget max must be greater than or equal to budget min.",
        path: ["budgetMax"],
      });
    }
  });

const respondToBookingInquirySchema = z.object({
  inquiryId: z.number().int().positive(),
  decision: z.enum(["ACCEPT", "DECLINE"]),
  note: z.string().trim().max(800).optional().nullable(),
});

const sendMessageSchema = z.object({
  inquiryId: z.number().int().positive(),
  message: z.string().trim().min(2).max(1500),
});

type SubmitBookingInquiryInput = z.infer<typeof submitBookingInquirySchema>;
type RespondToBookingInquiryInput = z.infer<
  typeof respondToBookingInquirySchema
>;
type SendInquiryMessageInput = z.infer<typeof sendMessageSchema>;

function formatDateLabel(date?: Date | string | null): string | null {
  if (!date) return null;
  const resolvedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(resolvedDate.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
    resolvedDate,
  );
}

function truncatePreview(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length <= 200) return trimmed;
  return `${trimmed.slice(0, 197)}…`;
}

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function getUserRoles(userId: string): Promise<string[]> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: { select: { role: true } } },
  });
  return dbUser?.roles.map((r) => r.role) ?? [];
}

async function getOrganizerProfile(userId: string) {
  return prisma.organizerProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      status: true,
      deletedAt: true,
      displayName: true,
      contactEmail: true,
    },
  });
}

async function getDjProfileForInquiry(djProfileId: number) {
  return prisma.djProfile.findUnique({
    where: { id: djProfileId },
    select: {
      id: true,
      slug: true,
      stageName: true,
      status: true,
      bookingEmail: true,
      userId: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });
}

async function revalidateInquirySurfaces() {
  revalidatePath("/notifications");
  revalidatePath("/dashboard/dj/bookings");
  revalidatePath("/organizer/bookings");
}

function getDisplayName({
  profileName,
  userName,
  fallbackEmail,
}: {
  profileName?: string | null;
  userName?: string | null;
  fallbackEmail: string;
}): string {
  return profileName?.trim() || userName?.trim() || fallbackEmail;
}

export async function submitBookingInquiry(
  input: unknown,
): Promise<ActionResult<{ inquiryId: number }>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const roles = await getUserRoles(user.id);
  if (!roles.includes("ORGANIZER")) {
    return {
      success: false,
      error: "Only organizers can send booking requests.",
    };
  }

  const organizerProfile = await getOrganizerProfile(user.id);
  if (
    !organizerProfile ||
    organizerProfile.status !== "ACTIVE" ||
    organizerProfile.deletedAt !== null
  ) {
    return {
      success: false,
      error: "You need an active organizer profile before booking DJs.",
    };
  }

  let payload: SubmitBookingInquiryInput;
  try {
    payload = submitBookingInquirySchema.parse(input);
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? (err.issues[0]?.message ?? "Invalid booking details provided.")
        : "Invalid booking details provided.";
    return { success: false, error: message };
  }

  const eventDate = formatDateLabel(payload.eventDate ?? null);

  const djProfile = await getDjProfileForInquiry(payload.djProfileId);
  if (!djProfile) {
    return { success: false, error: "DJ profile could not be found." };
  }
  if (djProfile.userId === user.id) {
    return {
      success: false,
      error: "You cannot send a booking request to your own profile.",
    };
  }
  if (djProfile.status !== "APPROVED") {
    return {
      success: false,
      error: "This DJ is not available for bookings yet.",
    };
  }

  const windowStart = new Date();
  windowStart.setHours(windowStart.getHours() - RATE_LIMIT_WINDOW_HOURS);
  const recentInquiry = await prismaUnsafe.bookingInquiry.findFirst({
    where: {
      organizerId: user.id,
      djProfileId: payload.djProfileId,
      createdAt: { gte: windowStart },
    },
    select: { id: true },
  });
  if (recentInquiry) {
    return {
      success: false,
      error: "You already contacted this DJ in the last 24 hours.",
    };
  }

  let createdInquiry: any;

  await prisma.$transaction(async (tx) => {
    const txUnsafe = tx as Record<string, any>;
    createdInquiry = await txUnsafe.bookingInquiry.create({
      data: {
        djProfileId: payload.djProfileId,
        organizerId: user.id,
        eventName: payload.eventName,
        eventDate:
          payload.eventDate instanceof Date
            ? payload.eventDate
            : payload.eventDate
              ? new Date(payload.eventDate)
              : null,
        venue: payload.venue ?? null,
        city: payload.city ?? null,
        crowdSize: payload.crowdSize ?? null,
        budgetMin: payload.budgetMin ?? null,
        budgetMax: payload.budgetMax ?? null,
        budgetCurrency: payload.budgetCurrency?.toUpperCase() ?? null,
        message: payload.message,
      },
    });

    await txUnsafe.bookingInquiryMessage.create({
      data: {
        inquiryId: createdInquiry.id,
        senderId: user.id,
        senderRole: "ORGANIZER",
        body: payload.message,
      },
    });

    await tx.notification.create({
      data: {
        type: "BOOKING_INQUIRY" as any,
        recipientId: djProfile.userId,
        senderId: user.id,
        data: {
          inquiryId: createdInquiry.id,
          eventName: payload.eventName,
          organizerName: organizerProfile.displayName,
          stageName: djProfile.stageName,
        },
      },
    });
  });

  const organizerName = getDisplayName({
    profileName: organizerProfile.displayName,
    userName: user.user_metadata?.full_name ?? user.user_metadata?.name,
    fallbackEmail: user.email ?? "Organizer",
  });

  const bookingEmail = djProfile.bookingEmail ?? djProfile.user.email;
  if (bookingEmail) {
    await sendEmail({
      to: bookingEmail,
      userId: djProfile.userId,
      emailType: "BOOKING_INQUIRY",
      subject: bookingInquiryReceivedSubject,
      html: bookingInquiryReceivedHtml({
        djName: djProfile.stageName,
        organizerName,
        eventName: payload.eventName,
        eventDate,
        ctaUrl: `${BASE_URL}/dashboard/dj/bookings?inquiry=${createdInquiry.id}`,
      }),
    });
  }

  await revalidateInquirySurfaces();

  return { success: true, data: { inquiryId: createdInquiry!.id } };
}

export async function respondToBookingInquiry(
  input: unknown,
): Promise<ActionResult<{ status: BookingInquiryStatus }>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be signed in." };

  let payload: RespondToBookingInquiryInput;
  try {
    payload = respondToBookingInquirySchema.parse(input);
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? (err.issues[0]?.message ?? "Invalid response.")
        : "Invalid response.";
    return { success: false, error: message };
  }

  const inquiry = await prismaUnsafe.bookingInquiry.findUnique({
    where: { id: payload.inquiryId },
    include: {
      djProfile: {
        select: {
          id: true,
          stageName: true,
          slug: true,
          bookingEmail: true,
          userId: true,
          user: { select: { id: true, email: true, name: true } },
        },
      },
      organizer: {
        select: {
          id: true,
          email: true,
          name: true,
          organizerProfile: {
            select: { displayName: true, contactEmail: true },
          },
        },
      },
    },
  });

  if (!inquiry) {
    return { success: false, error: "Booking inquiry not found." };
  }

  if (inquiry.djProfile.userId !== user.id) {
    return {
      success: false,
      error: "Only the DJ who received the inquiry can respond.",
    };
  }

  const newStatus: BookingInquiryStatus =
    payload.decision === "ACCEPT" ? "ACCEPTED" : "DECLINED";
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const txUnsafe = tx as Record<string, any>;

    await txUnsafe.bookingInquiry.update({
      where: { id: inquiry.id },
      data: {
        status: newStatus,
        contactReleasedAt:
          newStatus === "ACCEPTED" ? now : inquiry.contactReleasedAt,
        lastRespondedAt: now,
      },
    });

    if (payload.note) {
      await txUnsafe.bookingInquiryMessage.create({
        data: {
          inquiryId: inquiry.id,
          senderId: user.id,
          senderRole: "DJ",
          body: payload.note,
        },
      });
    }

    await tx.notification.create({
      data: {
        type: "BOOKING_INQUIRY_RESPONSE" as any,
        recipientId: inquiry.organizer.id,
        senderId: user.id,
        data: {
          inquiryId: inquiry.id,
          eventName: inquiry.eventName,
          status: newStatus,
          djName: inquiry.djProfile.stageName,
        },
      },
    });
  });

  const organizerName = getDisplayName({
    profileName: inquiry.organizer.organizerProfile?.displayName,
    userName: inquiry.organizer.name,
    fallbackEmail: inquiry.organizer.email,
  });

  await sendEmail({
    to: inquiry.organizer.email,
    userId: inquiry.organizer.id,
    emailType: "BOOKING_INQUIRY_RESPONSE",
    subject: bookingInquiryResponseSubject,
    html: bookingInquiryResponseHtml({
      organizerName,
      djName: inquiry.djProfile.stageName,
      eventName: inquiry.eventName,
      status: newStatus,
      note: payload.note ?? null,
      ctaUrl: `${BASE_URL}/organizer/bookings?inquiry=${inquiry.id}`,
    }),
  });

  await revalidateInquirySurfaces();

  return { success: true, data: { status: newStatus } };
}

export async function sendBookingInquiryMessage(
  input: unknown,
): Promise<ActionResult<{ messageId: number }>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be signed in." };

  let payload: SendInquiryMessageInput;
  try {
    payload = sendMessageSchema.parse(input);
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? (err.issues[0]?.message ?? "Invalid message.")
        : "Invalid message.";
    return { success: false, error: message };
  }

  const inquiry = await prismaUnsafe.bookingInquiry.findUnique({
    where: { id: payload.inquiryId },
    include: {
      djProfile: {
        select: {
          id: true,
          stageName: true,
          slug: true,
          bookingEmail: true,
          userId: true,
          user: { select: { id: true, email: true, name: true } },
        },
      },
      organizer: {
        select: {
          id: true,
          email: true,
          name: true,
          organizerProfile: {
            select: { displayName: true, contactEmail: true },
          },
        },
      },
    },
  });

  if (!inquiry) {
    return { success: false, error: "Booking inquiry not found." };
  }

  const isOrganizer = inquiry.organizer.id === user.id;
  const isDj = inquiry.djProfile.userId === user.id;

  if (!isOrganizer && !isDj) {
    return {
      success: false,
      error: "You are not allowed to post in this booking thread.",
    };
  }

  if (inquiry.status === "CANCELLED") {
    return {
      success: false,
      error: "This booking inquiry has been closed.",
    };
  }

  const senderRole: BookingInquiryParticipantRole = isOrganizer
    ? "ORGANIZER"
    : "DJ";
  const recipient = isOrganizer ? inquiry.djProfile : inquiry.organizer;
  const recipientName = isOrganizer
    ? getDisplayName({
        profileName: null,
        userName: inquiry.djProfile.user.name,
        fallbackEmail: inquiry.djProfile.user.email,
      })
    : getDisplayName({
        profileName: inquiry.organizer.organizerProfile?.displayName,
        userName: inquiry.organizer.name,
        fallbackEmail: inquiry.organizer.email,
      });
  const senderName = isOrganizer
    ? getDisplayName({
        profileName: inquiry.organizer.organizerProfile?.displayName,
        userName: inquiry.organizer.name,
        fallbackEmail: inquiry.organizer.email,
      })
    : inquiry.djProfile.stageName;

  let createdMessageId: number;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const txUnsafe = tx as Record<string, any>;

    const created = await txUnsafe.bookingInquiryMessage.create({
      data: {
        inquiryId: inquiry.id,
        senderId: user.id,
        senderRole,
        body: payload.message,
      },
      select: { id: true },
    });
    createdMessageId = created.id;

    await txUnsafe.bookingInquiry.update({
      where: { id: inquiry.id },
      data: { lastRespondedAt: now },
    });

    await tx.notification.create({
      data: {
        type: "BOOKING_INQUIRY_MESSAGE" as any,
        recipientId: isOrganizer
          ? inquiry.djProfile.userId
          : inquiry.organizer.id,
        senderId: user.id,
        data: {
          inquiryId: inquiry.id,
          eventName: inquiry.eventName,
          senderRole,
          senderName,
        },
      },
    });
  });

  const recipientEmail = isOrganizer
    ? (inquiry.djProfile.bookingEmail ?? inquiry.djProfile.user.email)
    : inquiry.organizer.email;

  if (recipientEmail) {
    await sendEmail({
      to: recipientEmail,
      userId: isOrganizer ? inquiry.djProfile.userId : inquiry.organizer.id,
      emailType: "BOOKING_INQUIRY_MESSAGE",
      subject: bookingInquiryMessageSubject,
      html: bookingInquiryMessageHtml({
        recipientName,
        counterpartName: senderName,
        eventName: inquiry.eventName,
        messagePreview: truncatePreview(payload.message),
        ctaUrl: `${
          isOrganizer
            ? `${BASE_URL}/dashboard/dj/bookings`
            : `${BASE_URL}/organizer/bookings`
        }?inquiry=${inquiry.id}`,
      }),
    });
  }

  await revalidateInquirySurfaces();

  return { success: true, data: { messageId: createdMessageId! } };
}
