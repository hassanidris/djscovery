import { NextRequest } from "next/server";
import prisma from "@/lib/client";
import { validateCronAuth, createCronAuthResponse } from "@/lib/cron-auth";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  premiumExpiring30DaysSubject,
  premiumExpiring30DaysHtml,
} from "@/lib/email/templates/premiumExpiring30Days";
import {
  premiumExpiring7DaysSubject,
  premiumExpiring7DaysHtml,
} from "@/lib/email/templates/premiumExpiring7Days";
import {
  premiumExpiredSubject,
  premiumExpiredHtml,
} from "@/lib/email/templates/premiumExpired";

export async function GET(request: NextRequest) {
  if (!validateCronAuth(request)) {
    return createCronAuthResponse("Unauthorized");
  }

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let emailsSent = 0;
  let downgradedCount = 0;

  try {
    await prisma.$transaction(async (tx) => {
      const expiringIn30Days = await tx.djProfile.findMany({
        where: {
          plan: "PREMIUM",
          premiumUntil: {
            gte: now,
            lte: thirtyDaysFromNow,
          },
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          foundingMember: {
            select: {
              status: true,
            },
          },
        },
      });

      for (const profile of expiringIn30Days) {
        const isFoundingMember = profile.foundingMember?.status === "ACTIVE";
        const expiryDate = profile.premiumUntil?.toLocaleDateString();

        await sendEmail({
          to: profile.user.email,
          userId: profile.userId,
          emailType: "PREMIUM_EXPIRING_30_DAYS" as any,
          subject: premiumExpiring30DaysSubject(),
          html: premiumExpiring30DaysHtml({
            name: profile.user.name ?? profile.stageName,
            expiryDate: expiryDate ?? "",
            isFoundingMember,
          }),
        });
        emailsSent++;
      }

      const expiringIn7Days = await tx.djProfile.findMany({
        where: {
          plan: "PREMIUM",
          premiumUntil: {
            gte: now,
            lte: sevenDaysFromNow,
          },
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          foundingMember: {
            select: {
              status: true,
            },
          },
        },
      });

      for (const profile of expiringIn7Days) {
        const isFoundingMember = profile.foundingMember?.status === "ACTIVE";
        const expiryDate = profile.premiumUntil?.toLocaleDateString();

        await sendEmail({
          to: profile.user.email,
          userId: profile.userId,
          emailType: "PREMIUM_EXPIRING_7_DAYS" as any,
          subject: premiumExpiring7DaysSubject(),
          html: premiumExpiring7DaysHtml({
            name: profile.user.name ?? profile.stageName,
            expiryDate: expiryDate ?? "",
            isFoundingMember,
          }),
        });
        emailsSent++;
      }

      const expiredProfiles = await tx.djProfile.findMany({
        where: {
          plan: "PREMIUM",
          premiumUntil: {
            lt: now,
          },
        },
        include: {
          foundingMember: {
            select: {
              status: true,
            },
          },
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      for (const profile of expiredProfiles) {
        const isFoundingMember = profile.foundingMember?.status === "ACTIVE";

        if (isFoundingMember) {
          await tx.djProfile.update({
            where: { id: profile.id },
            data: {
              plan: "FOUNDING",
              premiumUntil: null,
              priorityBoost: 1,
              homepageFeatured: profile.homepageFeaturedUntil
                ? profile.homepageFeaturedUntil > now
                : false,
            },
          });
        } else {
          await tx.djProfile.update({
            where: { id: profile.id },
            data: {
              plan: "FREE",
              premiumUntil: null,
              priorityBoost: 0,
              homepageFeatured: false,
              homepageFeaturedUntil: null,
            },
          });
        }

        await sendEmail({
          to: profile.user.email,
          userId: profile.userId,
          emailType: "PREMIUM_EXPIRED" as any,
          subject: premiumExpiredSubject(),
          html: premiumExpiredHtml({
            name: profile.user.name ?? profile.stageName,
            isFoundingMember,
          }),
        });
        emailsSent++;
        downgradedCount++;
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        downgradedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Premium expiry cron error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
