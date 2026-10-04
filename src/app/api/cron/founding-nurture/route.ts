import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { validateCronAuth, createCronAuthResponse } from "@/lib/cron-auth";

export async function GET(request: NextRequest) {
  if (!validateCronAuth(request)) {
    return createCronAuthResponse("Unauthorized", 401);
  }

  try {
    const now = new Date();
    const day3 = new Date(now);
    day3.setDate(day3.getDate() - 3);

    const day10 = new Date(now);
    day10.setDate(day10.getDate() - 10);

    const day21 = new Date(now);
    day21.setDate(day21.getDate() - 21);

    const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/founding-djs/status`;

    const { foundingNurtureDay3Email } =
      await import("@/lib/email/templates/foundingNurtureDay3");
    const { foundingNurtureDay10Email } =
      await import("@/lib/email/templates/foundingNurtureDay10");
    const { foundingNurtureDay21Email } =
      await import("@/lib/email/templates/foundingNurtureDay21");
    const resend = process.env.RESEND_API_KEY
      ? (await import("resend")).Resend
      : null;
    const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@djscovery.com";

    let emailsSent = 0;

    const applications = await prisma.foundingApplication.findMany({
      where: {
        status: { in: ["UNDER_REVIEW"] },
        deletedAt: null,
        submittedAt: { gte: day21 },
      },
      select: {
        id: true,
        name: true,
        email: true,
        submittedAt: true,
      },
    });

    for (const app of applications) {
      const daysSinceSubmission = Math.floor(
        (now.getTime() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      let html: string | null = null;
      let subject: string | null = null;

      if (daysSinceSubmission === 3) {
        html = foundingNurtureDay3Email({ name: app.name, statusUrl });
        subject = "We're reviewing your application";
      } else if (daysSinceSubmission === 10) {
        html = foundingNurtureDay10Email({ name: app.name, statusUrl });
        subject = "Founding DJ Spotlight";
      } else if (daysSinceSubmission === 21) {
        html = foundingNurtureDay21Email({ name: app.name, statusUrl });
        subject = "Decision coming soon";
      }

      if (html && subject) {
        try {
          if (resend) {
            const client = new resend(process.env.RESEND_API_KEY);
            await client.emails.send({
              from: FROM_EMAIL,
              to: app.email,
              subject,
              html,
            });
          } else {
            console.log(
              `[Email Mock] Would send nurture email to ${app.email}`,
            );
          }
          emailsSent++;
        } catch (error) {
          console.error(`Failed to send nurture email to ${app.email}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      applicationsProcessed: applications.length,
    });
  } catch (error) {
    console.error("Nurture cron failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
