"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { acceptFoundingInvitation } from "@/lib/founding/invitations";

export async function acceptFoundingInvitationAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`/sign-in?invitationToken=${encodeURIComponent(token)}`);
  }

  const result = await acceptFoundingInvitation(token, user.id, user.email);
  if (!result.success) {
    const error =
      result.reason === "email_mismatch"
        ? "email_mismatch"
        : result.reason === "already_linked"
          ? "already_linked"
          : "invalid_invitation";
    redirect(
      `/founding-djs/invitation/${encodeURIComponent(token)}?error=${error}`,
    );
  }

  redirect(`/become-dj?foundingApplicationId=${result.applicationId}`);
}

export async function signOutAndRetryFoundingInvitation(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/sign-in?invitationToken=${encodeURIComponent(token)}`);
}
