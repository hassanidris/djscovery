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
  const role = (formData.get("role") as string) ?? "";

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

    // Skip select-role — user already chose their role on the sign-up form
    if (role === "dj") redirect("/become-dj");
    if (role === "organizer") redirect("/become-organizer");
    redirect("/"); // Fan — go straight to the app
  }

  // Email confirmation required — pass role destination via callback `next`
  const next =
    role === "dj"
      ? "/become-dj"
      : role === "organizer"
        ? "/become-organizer"
        : "/";
  redirect(
    `/sign-in?message=Check your email to confirm your account&next=${encodeURIComponent(next)}`,
  );
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

  redirect(role === "DJ" ? "/become-dj" : "/become-organizer");
}
