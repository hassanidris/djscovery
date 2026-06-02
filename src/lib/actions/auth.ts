"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  if (error) redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });
  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);

  // Email confirmation disabled — user is immediately signed in
  if (data.session && data.user) {
    const userId = data.user.id;
    const email = data.user.email ?? "";
    const username = `${email.split("@")[0]}-${userId.slice(0, 6)}`;

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email, username },
    });

    redirect("/select-role");
  }

  // Email confirmation required — auth callback handles redirect to /select-role
  redirect("/sign-in?message=Check your email to confirm your account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function assignRole(role: "DJ" | "ORGANIZER") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // DJ role is only granted after the profile form is completed (see createDjProfile).
  // Assigning it here would leave the user tagged as a DJ even if they abandon the form.
  if (role === "ORGANIZER") {
    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role } },
      update: {},
      create: { userId: user.id, role },
    });
  }

  redirect(role === "DJ" ? "/become-dj" : "/become-organizer");
}
