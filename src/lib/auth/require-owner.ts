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
 * @returns The user's Supabase Auth UUID.
 * @throws Redirects to /sign-in if unauthenticated.
 */
export async function getCurrentUser(): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  return { id: user.id };
}

/**
 * Ensure the current user owns the specified DJ profile.
 * @param djProfileId - The DJ profile ID to check ownership of.
 * @returns The verified user ID and DJ profile ID.
 * @throws Redirects to /sign-in if unauthenticated, or / if not the owner.
 */
export async function requireDjOwner(
  djProfileId: number,
): Promise<{ userId: string; djProfileId: number }> {
  const { id: userId } = await getCurrentUser();

  const djProfile = await prisma.djProfile.findUnique({
    where: { id: djProfileId },
    select: { userId: true },
  });

  if (!djProfile || djProfile.userId !== userId) redirect("/");

  return { userId, djProfileId };
}

/**
 * Ensure the current user owns the specified Organizer profile.
 * @param organizerProfileId - The Organizer profile ID to check ownership of.
 * @returns The verified user ID and organizer profile ID.
 * @throws Redirects to /sign-in if unauthenticated, or / if not the owner.
 */
export async function requireOrganizerOwner(
  organizerProfileId: number,
): Promise<{ userId: string; organizerProfileId: number }> {
  const { id: userId } = await getCurrentUser();

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { id: organizerProfileId },
    select: { userId: true },
  });

  if (!orgProfile || orgProfile.userId !== userId) redirect("/");

  return { userId, organizerProfileId };
}

/**
 * Ensure the current user owns the specified Gig.
 * @param gigId - The Gig ID to check ownership of.
 * @returns The verified user ID, organizer profile ID, and gig ID.
 * @throws Redirects to /sign-in if unauthenticated, or / if not the owner.
 */
export async function requireGigOwner(
  gigId: number,
): Promise<{ userId: string; organizerProfileId: number; gigId: number }> {
  const { id: userId } = await getCurrentUser();

  const gig = await prisma.gig.findUnique({
    where: { id: gigId, deletedAt: null },
    select: { organizerProfileId: true },
  });

  if (!gig) redirect("/");

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { id: gig.organizerProfileId },
    select: { userId: true },
  });

  if (!orgProfile || orgProfile.userId !== userId) redirect("/");

  return { userId, organizerProfileId: gig.organizerProfileId, gigId };
}

/**
 * Ensure the current user owns the specified Event.
 * @param eventId - The Event ID to check ownership of.
 * @returns The verified user ID, DJ profile ID, and event ID.
 * @throws Redirects to /sign-in if unauthenticated, or / if not the owner.
 */
export async function requireEventOwner(
  eventId: number,
): Promise<{ userId: string; djProfileId: number; eventId: number }> {
  const { id: userId } = await getCurrentUser();

  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    select: { ownerDjId: true },
  });

  if (!event) redirect("/");

  const djProfile = await prisma.djProfile.findUnique({
    where: { id: event.ownerDjId },
    select: { userId: true },
  });

  if (!djProfile || djProfile.userId !== userId) redirect("/");

  return { userId, djProfileId: event.ownerDjId, eventId };
}
