import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

/**
 * ============================================================
 * AUTHORIZATION GUARDS
 * Server-side ownership checks for DJ and Organizer resources.
 * Call at the top of server actions to ensure only owners can modify.
 * ============================================================
 */

/**
 * Get the currently authenticated user.
 * @returns The user's Supabase Auth UUID, or an error.
 */
export async function getCurrentUser(): Promise<
  { id: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  return { id: user.id };
}

/**
 * Ensure the current user owns the specified DJ profile.
 * @param djProfileId - The DJ profile ID to check ownership of.
 * @returns The verified user ID and DJ profile ID, or an error.
 */
export async function requireDjOwner(
  djProfileId: number,
): Promise<{ userId: string; djProfileId: number } | { error: string }> {
  const user = await getCurrentUser();
  if ("error" in user) return user;
  const { id: userId } = user;

  const djProfile = await prisma.djProfile.findUnique({
    where: { id: djProfileId },
    select: { userId: true },
  });

  if (!djProfile || djProfile.userId !== userId)
    return { error: "You don't have permission to modify this DJ profile" };

  return { userId, djProfileId };
}

/**
 * Ensure the current user owns the specified Organizer profile.
 * @param organizerProfileId - The Organizer profile ID to check ownership of.
 * @returns The verified user ID and organizer profile ID, or an error.
 */
export async function requireOrganizerOwner(
  organizerProfileId: number,
): Promise<{ userId: string; organizerProfileId: number } | { error: string }> {
  const user = await getCurrentUser();
  if ("error" in user) return user;
  const { id: userId } = user;

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { id: organizerProfileId },
    select: { userId: true },
  });

  if (!orgProfile || orgProfile.userId !== userId)
    return {
      error: "You don't have permission to modify this organizer profile",
    };

  return { userId, organizerProfileId };
}

/**
 * Ensure the current user owns the specified Gig.
 * @param gigId - The Gig ID to check ownership of.
 * @returns The verified user ID, organizer profile ID, and gig ID, or an error.
 */
export async function requireGigOwner(
  gigId: number,
): Promise<
  | { userId: string; organizerProfileId: number; gigId: number }
  | { error: string }
> {
  const user = await getCurrentUser();
  if ("error" in user) return user;
  const { id: userId } = user;

  const gig = await prisma.gig.findUnique({
    where: { id: gigId, deletedAt: null },
    select: { organizerProfileId: true },
  });

  if (!gig) return { error: "Gig not found" };

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { id: gig.organizerProfileId },
    select: { userId: true },
  });

  if (!orgProfile || orgProfile.userId !== userId)
    return { error: "You don't have permission to modify this gig" };

  return { userId, organizerProfileId: gig.organizerProfileId, gigId };
}

/**
 * Ensure the current user owns the specified Event.
 * @param eventId - The Event ID to check ownership of.
 * @returns The verified user ID, DJ profile ID, and event ID, or an error.
 */
export async function requireEventOwner(
  eventId: number,
): Promise<
  { userId: string; djProfileId: number; eventId: number } | { error: string }
> {
  const user = await getCurrentUser();
  if ("error" in user) return user;
  const { id: userId } = user;

  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    select: { ownerDjId: true },
  });

  if (!event) return { error: "Event not found" };

  const djProfile = await prisma.djProfile.findUnique({
    where: { id: event.ownerDjId },
    select: { userId: true },
  });

  if (!djProfile || djProfile.userId !== userId)
    return { error: "You don't have permission to modify this event" };

  return { userId, djProfileId: event.ownerDjId, eventId };
}
