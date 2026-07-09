"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { ActionResult, actionError, actionSuccess } from "./action-result";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/send";
import type { EventAttendanceData } from "@/lib/email/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://djscovery.com";

export async function toggleEventAttendance(
  eventId: number,
  status: "GOING" | "INTERESTED",
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // Check user has any profile (Fan, Organizer, or DJ)
  const [fanProfile, organizerProfile, djProfile] = await Promise.all([
    prisma.fanProfile.findUnique({ where: { userId: user.id } }),
    prisma.organizerProfile.findUnique({ where: { userId: user.id } }),
    prisma.djProfile.findUnique({ where: { userId: user.id } }),
  ]);

  if (!fanProfile && !organizerProfile && !djProfile) {
    return actionError("You must have a profile to attend events");
  }

  // Check event exists and is PUBLISHED
  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    select: {
      id: true,
      status: true,
      startDate: true,
      ownerDjId: true,
      title: true,
      slug: true,
    },
  });

  if (!event) return actionError("Event not found");
  if (event.status !== "PUBLISHED") {
    return actionError("Only published events can be attended");
  }

  // Check event is upcoming
  if (new Date(event.startDate) < new Date()) {
    return actionError("Cannot attend past events");
  }

  // Prevent event owner from attending their own event
  if (djProfile && djProfile.id === event.ownerDjId) {
    return actionError("You cannot attend your own event");
  }

  // Check existing attendance
  const existing = await prisma.eventAttendance.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });

  // Toggle logic
  let wasRemoved = false;
  if (existing) {
    if (existing.status === status) {
      // Remove record if same status (toggle off)
      await prisma.eventAttendance.delete({
        where: { eventId_userId: { eventId, userId: user.id } },
      });
      wasRemoved = true;
    } else {
      // Update to new status
      await prisma.eventAttendance.update({
        where: { eventId_userId: { eventId, userId: user.id } },
        data: { status },
      });
    }
  } else {
    // Create new record
    await prisma.eventAttendance.create({
      data: {
        eventId,
        userId: user.id,
        status,
      },
    });
  }

  revalidatePath(`/events/${event.slug}`);
  if (wasRemoved) return actionSuccess();

  // Send email notification to user
  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, name: true },
    });

    if (userData?.email && event) {
      const eventDate = new Date(event.startDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const emailData: EventAttendanceData = {
        userName: userData.name || "There",
        eventTitle: event.title,
        eventDate,
        eventUrl: `${SITE_URL}/events/${event.slug}`,
        status,
      };
      await sendEmail(userData.email, "EVENT_ATTENDANCE", emailData);
    }
  } catch (emailError) {
    console.error("Failed to send attendance email:", emailError);
  }

  return actionSuccess();
}

export async function getEventAttendance(
  eventId: number,
  userId: string,
): Promise<{ status: "GOING" | "INTERESTED" | null }> {
  const attendance = await prisma.eventAttendance.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: { status: true },
  });

  return {
    status:
      attendance?.status === "GOING" || attendance?.status === "INTERESTED"
        ? attendance.status
        : null,
  };
}
