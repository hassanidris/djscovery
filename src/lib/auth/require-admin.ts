import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

/**
 * Server-side admin guard.
 *
 * Call at the top of every admin Server Component and Server Action.
 * Never trusts client-passed role values — always re-queries the DB.
 *
 * @returns { userId: string } — the verified admin's Supabase Auth UUID.
 * @throws Redirects to /sign-in if unauthenticated, or / if not ADMIN.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const adminRole = await prisma.userRole.findUnique({
    where: { userId_role: { userId: user.id, role: "ADMIN" } },
    select: { role: true },
  });

  if (!adminRole) redirect("/");

  return { userId: user.id };
}
