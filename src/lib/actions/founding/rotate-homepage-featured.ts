import prisma from "@/lib/client";

export async function rotateHomepageFeatured(): Promise<number> {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const expiredFeatured = await tx.djProfile.findMany({
      where: {
        homepageFeatured: true,
        homepageFeaturedUntil: {
          lt: now,
        },
        foundingMember: {
          status: "ACTIVE",
        },
      },
      select: {
        id: true,
        foundingNumber: true,
      },
      orderBy: {
        foundingNumber: "asc",
      },
    });

    if (expiredFeatured.length === 0) {
      return 0;
    }

    const allFoundingMembers = await tx.foundingMember.findMany({
      where: {
        status: "ACTIVE",
        djProfile: {
          status: "APPROVED",
          hidden: false,
          deletedAt: null,
        },
      },
      include: {
        djProfile: {
          select: {
            id: true,
            foundingNumber: true,
          },
        },
      },
      orderBy: {
        djProfile: {
          foundingNumber: "asc",
        },
      },
    });

    const currentlyFeatured = await tx.djProfile.findMany({
      where: {
        homepageFeatured: true,
        homepageFeaturedUntil: {
          gt: now,
        },
      },
      select: {
        id: true,
        foundingNumber: true,
      },
    });

    const currentlyFeaturedIds = new Set(currentlyFeatured.map((p) => p.id));
    const expiredFeaturedIds = new Set(expiredFeatured.map((p) => p.id));

    const availableMembers = allFoundingMembers.filter(
      (m) =>
        !currentlyFeaturedIds.has(m.djProfile.id) &&
        !expiredFeaturedIds.has(m.djProfile.id),
    );

    const maxFeaturedFoundingNumber =
      currentlyFeatured.length > 0
        ? Math.max(...currentlyFeatured.map((p) => p.foundingNumber ?? 0))
        : 0;

    const membersAfterCursor = availableMembers.filter(
      (m) => (m.djProfile.foundingNumber ?? 0) > maxFeaturedFoundingNumber,
    );
    const membersBeforeCursor = availableMembers.filter(
      (m) => (m.djProfile.foundingNumber ?? 0) <= maxFeaturedFoundingNumber,
    );

    const rotatedMembers = [...membersAfterCursor, ...membersBeforeCursor];

    const slotsToFill = Math.min(expiredFeatured.length, rotatedMembers.length);

    for (let i = 0; i < slotsToFill; i++) {
      const nextMember = rotatedMembers[i];
      await tx.djProfile.update({
        where: { id: nextMember.djProfile.id },
        data: {
          homepageFeatured: true,
          homepageFeaturedUntil: oneWeekFromNow,
        },
      });
    }

    for (const expired of expiredFeatured) {
      await tx.djProfile.update({
        where: { id: expired.id },
        data: {
          homepageFeatured: false,
          homepageFeaturedUntil: null,
        },
      });
    }

    return slotsToFill;
  });

  return result;
}
