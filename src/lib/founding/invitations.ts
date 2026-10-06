import crypto from "crypto";
import prisma from "@/lib/client";

export function hashFoundingInvitationToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getValidFoundingInvitation(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;

  return prisma.invitationToken.findFirst({
    where: {
      tokenHash: hashFoundingInvitationToken(token),
      type: "FOUNDING_MEMBER",
      status: "PENDING",
      expiresAt: { gt: new Date() },
      foundingApplication: {
        is: {
          status: "APPROVED",
          emailVerifiedAt: { not: null },
          deletedAt: { equals: null },
        },
      },
    },
    select: {
      id: true,
      email: true,
      expiresAt: true,
      foundingApplication: { select: { id: true, name: true, stageName: true } },
    },
  });
}

export type AcceptFoundingInvitationResult =
  | { success: true; applicationId: number }
  | { success: false; reason: "invalid" | "email_mismatch" | "already_linked" };

export async function acceptFoundingInvitation(
  token: string,
  userId: string,
  userEmail: string,
): Promise<AcceptFoundingInvitationResult> {
  const invitation = await getValidFoundingInvitation(token);
  if (!invitation?.email || !invitation.foundingApplication) {
    return { success: false, reason: "invalid" };
  }

  if (invitation.email.trim().toLowerCase() !== userEmail.trim().toLowerCase()) {
    return { success: false, reason: "email_mismatch" };
  }
  const applicationId = invitation.foundingApplication.id;

  try {
    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      const consumed = await tx.invitationToken.updateMany({
        where: {
          id: invitation.id,
          status: "PENDING",
          expiresAt: { gt: now },
          tokenHash: hashFoundingInvitationToken(token),
        },
        data: { status: "ACCEPTED", acceptedAt: now },
      });
      if (consumed.count !== 1) return { success: false, reason: "invalid" };

      const linked = await tx.foundingApplication.updateMany({
        where: {
          id: applicationId,
          status: "APPROVED",
          emailVerifiedAt: { not: null },
          deletedAt: { equals: null },
          OR: [{ userId: null }, { userId }],
        },
        data: { userId },
      });
      if (linked.count !== 1) {
        throw new Error("FOUNDING_APPLICATION_ALREADY_LINKED");
      }

      await tx.userRole.upsert({
        where: { userId_role: { userId, role: "DJ" } },
        update: {},
        create: { userId, role: "DJ" },
      });

      return { success: true, applicationId };
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "FOUNDING_APPLICATION_ALREADY_LINKED"
    ) {
      return { success: false, reason: "already_linked" };
    }
    throw error;
  }
}

export function maskInvitationEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "the invited email address";
  return `${local[0]}***@${domain}`;
}
