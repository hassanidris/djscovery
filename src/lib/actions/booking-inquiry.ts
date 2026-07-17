"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { sendEmail } from "@/lib/email/sendEmail";
import { rateLimit, rateLimitMessage } from "@/lib/rate-limit";
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
  { success: true; data: T } | { success: false; error: string };

type BookingInquiryStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
type BookingInquiryParticipantRole = "DJ" | "ORGANIZER";

const BUDGET_TYPES = ["FIXED", "RANGE", "NEGOTIABLE", "TBA"] as const;
const budgetTypeSchema = z.enum(BUDGET_TYPES);

const submitBookingInquirySchema = z
  .object({
    djProfileId: z.number().int().positive(),
    eventName: z.string().trim().min(3).max(80),
    eventDate: z.string().trim().min(4),
    venue: z.string().trim().min(2).max(120),
    countryId: z.number().int().positive(),
    cityId: z.number().int().positive(),
    crowdSize: z.number().int().positive().max(200000),
    budgetType: budgetTypeSchema,
    budgetMin: z.number().int().nonnegative().max(1_000_000).nullable(),
    budgetMax: z.number().int().nonnegative().max(1_000_000).nullable(),
    budgetCurrency: z.string().trim().min(2).max(10),
    message: z.string().trim().min(50).max(1500),
    packageName: z.string().trim().max(100).optional(),
    packagePrice: z
      .number()
      .int()
      .nonnegative()
      .max(1_000_000)
      .nullable()
      .optional(),
    packagePriceTo: z
      .number()
      .int()
      .nonnegative()
      .max(1_000_000)
      .nullable()
      .optional(),
  })
  .superRefine((value, ctx) => {
    const eventDate = new Date(value.eventDate);
    if (Number.isNaN(eventDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Event date is invalid.",
        path: ["eventDate"],
      });
    }

    if (value.budgetType === "FIXED") {
      if (value.budgetMin === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fixed budget amount is required.",
          path: ["budgetMin"],
        });
      }
    }

    if (value.budgetType === "RANGE") {
      if (value.budgetMin === null || value.budgetMax === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Provide both minimum and maximum amounts for range budgets.",
          path: value.budgetMin === null ? ["budgetMin"] : ["budgetMax"],
        });
      } else if (value.budgetMax < value.budgetMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Budget max must be greater than or equal to budget min.",
          path: ["budgetMax"],
        });
      }
    }

    if (value.budgetType === "NEGOTIABLE" || value.budgetType === "TBA") {
      if (value.budgetMin !== null || value.budgetMax !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Do not provide amounts for negotiable or TBA budgets.",
          path: value.budgetMin !== null ? ["budgetMin"] : ["budgetMax"],
        });
      }
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

function isUnknownLocationArgumentError(
  error: unknown,
): error is Prisma.PrismaClientValidationError {
  if (!(error instanceof Prisma.PrismaClientValidationError)) return false;
  const message = error.message ?? "";
  if (!message.includes("Unknown argument")) return false;
  return (
    message.includes("countryId") ||
    message.includes("cityId") ||
    message.includes("countryName") ||
    message.includes("cityName")
  );
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
      cityId: true,
      city: {
        select: {
          id: true,
          name: true,
          countryId: true,
          country: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
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
      cityId: true,
      city: {
        select: {
          id: true,
          name: true,
          countryId: true,
          country: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

async function revalidateInquirySurfaces() {
  revalidatePath("/inbox");
  revalidatePath("/dj/bookings");
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

  const inquiryRateLimit = await rateLimit(
    `booking-inquiry:organizer:${user.id}`,
    10,
    60 * 60,
  );
  if (!inquiryRateLimit.success) {
    return {
      success: false,
      error: rateLimitMessage("booking inquiry", inquiryRateLimit.resetAt),
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

  const eventDateValue = new Date(payload.eventDate);
  const eventDateLabel = formatDateLabel(eventDateValue);

  const cityRecord = await prisma.city.findUnique({
    where: { id: payload.cityId },
    select: {
      id: true,
      name: true,
      countryId: true,
      country: { select: { id: true, name: true } },
    },
  });

  if (!cityRecord) {
    return {
      success: false,
      error:
        "Selected city is no longer available. Please refresh and try again.",
    };
  }

  const normalizedCountryId = cityRecord.countryId;

  if (normalizedCountryId !== payload.countryId) {
    return {
      success: false,
      error: "City does not belong to the selected country.",
    };
  }

  const countryRecord =
    cityRecord.country ??
    (await prisma.country.findUnique({
      where: { id: normalizedCountryId },
      select: { id: true, name: true },
    }));

  if (!countryRecord) {
    return {
      success: false,
      error: "Selected country is no longer available.",
    };
  }

  let budgetMin = payload.budgetMin;
  let budgetMax = payload.budgetMax;

  if (payload.budgetType === "FIXED") {
    budgetMax = budgetMin;
  }

  if (payload.budgetType === "NEGOTIABLE" || payload.budgetType === "TBA") {
    budgetMin = null;
    budgetMax = null;
  }

  const budgetCurrency = payload.budgetCurrency || "SEK";

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

  try {
    await prisma.$transaction(async (tx) => {
      const txUnsafe = tx as Record<string, any>;
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${`${user.id}:${payload.djProfileId}`}))
      `;

      const recentInquiry = await txUnsafe.bookingInquiry.findFirst({
        where: {
          organizerId: user.id,
          djProfileId: payload.djProfileId,
          createdAt: { gte: windowStart },
        },
        select: { id: true },
      });
      if (recentInquiry) {
        throw new Error("RATE_LIMITED_BOOKING_INQUIRY");
      }

      const baseCreateData = {
        djProfileId: payload.djProfileId,
        organizerId: user.id,
        eventName: payload.eventName,
        eventDate: eventDateValue,
        venue: payload.venue,
        crowdSize: payload.crowdSize,
        budgetType: payload.budgetType,
        budgetMin,
        budgetMax,
        budgetCurrency: budgetCurrency.toUpperCase(),
        message: payload.message,
        packageName: payload.packageName,
        packagePrice: payload.packagePrice,
        packagePriceTo: payload.packagePriceTo,
      } satisfies Record<string, unknown>;

      const locationCreateData = {
        countryId: normalizedCountryId,
        countryName: countryRecord.name,
        cityId: cityRecord.id,
        cityName: cityRecord.name,
      } satisfies Record<string, unknown>;

      try {
        createdInquiry = await txUnsafe.bookingInquiry.create({
          data: {
            ...baseCreateData,
            ...locationCreateData,
          },
        });
      } catch (error) {
        if (!isUnknownLocationArgumentError(error)) {
          throw error;
        }

        console.warn(
          "Prisma schema for BookingInquiry appears out of date. Falling back to legacy location fields. Please run `npx prisma db push && npx prisma generate`.",
        );

        createdInquiry = await txUnsafe.bookingInquiry.create({
          data: {
            ...baseCreateData,
            country: countryRecord.name,
            city: cityRecord.name,
          },
        });
      }

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
            cityName: cityRecord.name,
            countryName: countryRecord.name,
            organizerName: organizerProfile.displayName,
            stageName: djProfile.stageName,
          },
        },
      });
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === "RATE_LIMITED_BOOKING_INQUIRY"
    ) {
      return {
        success: false,
        error: "You already contacted this DJ in the last 24 hours.",
      };
    }
    throw err;
  }

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
        eventDate: eventDateLabel,
        location: [cityRecord.name, countryRecord.name]
          .filter(Boolean)
          .join(", "),
        ctaUrl: `${BASE_URL}/dj/bookings?inquiry=${createdInquiry.id}`,
        packageName: payload.packageName,
        packagePrice: payload.packagePrice,
        packagePriceTo: payload.packagePriceTo,
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
      country: { select: { id: true, name: true } },
      city: { select: { id: true, name: true } },
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

  if (inquiry.status !== "PENDING") {
    return {
      success: false,
      error: "This booking inquiry has already been responded to.",
    };
  }

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
      country: { select: { id: true, name: true } },
      city: { select: { id: true, name: true } },
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
          cityName: inquiry.cityName,
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
            ? `${BASE_URL}/dj/bookings`
            : `${BASE_URL}/organizer/bookings`
        }?inquiry=${inquiry.id}`,
      }),
    });
  }

  await revalidateInquirySurfaces();

  return { success: true, data: { messageId: createdMessageId! } };
}
