"use server";

import { createClient } from "@/lib/supabase/server";
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
  const rawRole = formData.get("role") as string | null;
  const role =
    rawRole === "dj" || rawRole === "organiser" ? rawRole : undefined;
  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      data: { role },
    },
  });
  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  redirect("/sign-in?message=Check your email to confirm your account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
