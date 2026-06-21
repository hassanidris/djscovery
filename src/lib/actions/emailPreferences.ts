"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";

export async function updateEmailPreferences(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const bookingEmails = formData.get("bookingEmails") === "on";
  const gigEmails = formData.get("gigEmails") === "on";
  const applicationEmails = formData.get("applicationEmails") === "on";
  const platformUpdates = formData.get("platformUpdates") === "on";
  const marketingEmails = formData.get("marketingEmails") === "on";

  await prisma.emailPreference.upsert({
    where: { userId: user.id },
    update: {
      bookingEmails,
      gigEmails,
      applicationEmails,
      platformUpdates,
      marketingEmails,
    },
    create: {
      userId: user.id,
      bookingEmails,
      gigEmails,
      applicationEmails,
      platformUpdates,
      marketingEmails,
    },
  });

  redirect("/settings/notifications?saved=1");
}
