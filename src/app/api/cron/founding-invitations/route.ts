import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/client";
import resend from "@/lib/email/client";
import {
  foundingInvitationExpiredEmail,
  foundingInvitationExpiredSubject,
} from "@/lib/email/templates/foundingInvitationExpired";
import {
  foundingInvitationReminderEmail,
  foundingInvitationReminderSubject,
} from "@/lib/email/templates/foundingInvitationReminder";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Cron secret is not configured" },
      { status: 500 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const reminderStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const reminderEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  let remindersSent = 0;
  let invitationsExpired = 0;
  let expiredEmailsSent = 0;

  try {
    const reminders = await prisma.invitationToken.findMany({
      where: {
        type: "FOUNDING_MEMBER",
        status: "PENDING",
        reminderSentAt: { equals: null },
        expiresAt: { gt: reminderStart, lte: reminderEnd },
        email: { not: null },
        foundingApplication: { is: { deletedAt: { equals: null } } },
      },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        foundingApplication: { select: { name: true } },
      },
    });

    for (const invitation of reminders) {
      if (!resend || !invitation.email || !invitation.foundingApplication)
        continue;
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@djcovery.com",
        to: invitation.email,
        subject: foundingInvitationReminderSubject,
        html: foundingInvitationReminderEmail({
          name: invitation.foundingApplication.name,
          expiresAt: invitation.expiresAt,
        }),
      });
      if (result.error) continue;
      const updated = await prisma.invitationToken.updateMany({
        where: { id: invitation.id, status: "PENDING", reminderSentAt: null },
        data: { reminderSentAt: new Date() },
      });
      remindersSent += updated.count;
    }

    const pendingExpired = await prisma.invitationToken.findMany({
      where: {
        type: "FOUNDING_MEMBER",
        status: "PENDING",
        expiresAt: { lte: now },
      },
      select: { id: true },
    });
    for (const invitation of pendingExpired) {
      const updated = await prisma.invitationToken.updateMany({
        where: {
          id: invitation.id,
          status: "PENDING",
          expiresAt: { lte: now },
        },
        data: { status: "EXPIRED" },
      });
      invitationsExpired += updated.count;
    }

    const expiredWithoutEmail = await prisma.invitationToken.findMany({
      where: {
        type: "FOUNDING_MEMBER",
        status: "EXPIRED",
        expiredEmailSentAt: { equals: null },
        email: { not: null },
        foundingApplication: { is: { deletedAt: { equals: null } } },
      },
      select: {
        id: true,
        email: true,
        foundingApplication: { select: { name: true } },
      },
    });
    for (const invitation of expiredWithoutEmail) {
      if (!resend || !invitation.email || !invitation.foundingApplication)
        continue;
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@djcovery.com",
        to: invitation.email,
        subject: foundingInvitationExpiredSubject,
        html: foundingInvitationExpiredEmail({
          name: invitation.foundingApplication.name,
        }),
      });
      if (result.error) continue;
      const updated = await prisma.invitationToken.updateMany({
        where: {
          id: invitation.id,
          status: "EXPIRED",
          expiredEmailSentAt: null,
        },
        data: { expiredEmailSentAt: new Date() },
      });
      expiredEmailsSent += updated.count;
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      invitationsExpired,
      expiredEmailsSent,
    });
  } catch (error) {
    console.error("Founding invitation cron failed", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
