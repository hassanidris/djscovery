import prisma from "@/lib/client";
import { updateSearchScore } from "@/lib/search/composite-score";

export interface ActivationResult {
  activatedCount: number;
  members: Array<{
    id: number;
    foundingNumber: number | null;
    stageName: string;
    email: string;
  }>;
  skippedCount: number;
}

export async function activateFoundingRewards(
  djProfileId?: number,
): Promise<ActivationResult> {
  const now = new Date();
  const premiumExpiry = new Date(now.getTime() + 12 * 30 * 24 * 60 * 60 * 1000);
  const homepageFeatureExpiry = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  );

  const whereClause = djProfileId
    ? {
        status: "ACTIVE" as const,
        launchedAt: null,
        djProfileId,
      }
    : {
        status: "ACTIVE" as const,
        launchedAt: null,
      };

  const membersToActivate = await prisma.foundingMember.findMany({
    where: whereClause,
    include: {
      djProfile: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  if (membersToActivate.length === 0) {
    return {
      activatedCount: 0,
      members: [],
      skippedCount: 0,
    };
  }

  const activationResults = await prisma.$transaction(
    membersToActivate.map((member) =>
      prisma.foundingMember.update({
        where: { id: member.id },
        data: {
          launchedAt: now,
          djProfile: {
            update: {
              data: {
                plan: "PREMIUM",
                premiumUntil: premiumExpiry,
                priorityBoost: 2,
                homepageFeatured: true,
                homepageFeaturedUntil: homepageFeatureExpiry,
              },
            },
          },
        },
        include: {
          djProfile: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      }),
    ),
  );

  return {
    activatedCount: activationResults.length,
    members: activationResults.map((result) => ({
      id: result.id,
      foundingNumber: result.foundingNumber,
      stageName: result.djProfile.stageName,
      email: result.djProfile.user.email,
    })),
    skippedCount: 0,
  };
}

export async function deactivateFoundingRewards(
  djProfileId?: number,
): Promise<number> {
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const whereClause = djProfileId
      ? {
          status: "ACTIVE" as const,
          launchedAt: { not: null },
          djProfileId,
        }
      : {
          status: "ACTIVE" as const,
          launchedAt: { not: null },
        };

    const members = await tx.foundingMember.findMany({
      where: whereClause,
      select: { id: true, djProfileId: true },
    });

    if (members.length === 0) {
      return 0;
    }

    await tx.foundingMember.updateMany({
      where: {
        id: { in: members.map((m) => m.id) },
      },
      data: {
        launchedAt: null,
      },
    });

    await tx.djProfile.updateMany({
      where: {
        foundingMember: {
          id: { in: members.map((m) => m.id) },
        },
      },
      data: {
        plan: "FOUNDING",
        premiumUntil: null,
        priorityBoost: 1,
        homepageFeatured: false,
        homepageFeaturedUntil: null,
      },
    });

    return members;
  });

  for (const member of result) {
    await updateSearchScore(member.djProfileId);
  }

  return result.length;
}
