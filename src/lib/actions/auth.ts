"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
  roleSchema,
} from "@/lib/validations/auth";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  welcomeEmailSubject,
  welcomeEmailHtml,
} from "@/lib/email/templates/welcome";
import { generateWelcomeCta } from "@/lib/supabase/admin";
import {
  securityAlertSubject,
  securityAlertEmailHtml,
} from "@/lib/email/templates/securityAlert";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://djcovery.com";

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid input";
    redirect(`/sign-in?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  if (!data.user) redirect("/sign-in?error=Authentication+failed");

  // Role-aware redirect + stamp lastLoginAt in one round-trip
  const [userRoles, stamp] = await prisma.$transaction([
    prisma.userRole.findMany({
      where: { userId: data.user.id },
      select: { role: true },
    }),
    prisma.user.updateMany({
      where: { id: data.user.id },
      data: { lastLoginAt: new Date() },
    }),
  ]);
  if (stamp.count === 0) {
    // Handle provisioning drift explicitly (log/reconcile/redirect),
    // but don't crash sign-in due to missing local row.
  }
  const roles = userRoles.map((r) => r.role);

  if (roles.includes("ADMIN")) redirect("/admin");
  if (roles.includes("DJ")) redirect("/dashboard");
  if (roles.includes("ORGANIZER")) redirect("/organizer/dashboard");
  redirect("/"); // fan
}

export async function signUp(formData: FormData) {
  const rawDisplayName =
    (formData.get("displayName") as string | null)?.trim() ?? "";

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "",
    displayName: rawDisplayName || undefined,
  });
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid input";
    redirect(`/sign-up?error=${encodeURIComponent(message)}`);
  }

  const { email, password, role, displayName } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, displayName }, // stored in user_metadata — callback reads this
      emailRedirectTo: `${BASE_URL}/auth/callback`,
    },
  });
  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);

  // Email confirmation disabled (dev/local) — session returned immediately
  if (data.session && data.user) {
    const userId = data.user.id;
    const userEmail = data.user.email ?? "";
    const username = `${userEmail.split("@")[0]}-${userId.slice(0, 6)}`;
    const emailPrefix = userEmail.split("@")[0];
    const name = displayName || emailPrefix;

    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.upsert({
          where: { id: userId },
          update: {},
          create: { id: userId, email: userEmail, username },
        });
        await tx.emailPreference.upsert({
          where: { userId },
          update: {},
          create: { userId },
        });
        if (role === "") {
          const existing = await tx.fanProfile.findUnique({
            where: { userId },
          });
          if (!existing) {
            await tx.fanProfile.create({ data: { userId, name } });
          }
        }
      });

      const ctaUrl = await generateWelcomeCta(userEmail);

      // Welcome email for immediate signup (no email confirmation)
      await sendEmail({
        to: userEmail,
        userId,
        emailType: "WELCOME",
        subject: welcomeEmailSubject,
        html: welcomeEmailHtml({ name, ctaUrl }),
      });
    } catch {
      await supabase.auth.signOut();
      redirect("/sign-up?error=account_setup_failed");
    }

    if (role === "dj") redirect("/become-dj");
    if (role === "organizer") redirect("/become-organizer");
    redirect("/");
  }

  // Email confirmation required — role is in user_metadata, no need to pass in URL
  redirect(
    `/sign-in?message=${encodeURIComponent("Check your email to confirm your account")}`,
  );
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid email";
    redirect(`/forgot-password?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${BASE_URL}/auth/callback?next=/auth/reset-password`,
    },
  );

  if (error)
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  redirect(
    `/forgot-password?message=${encodeURIComponent("Check your email for a password reset link")}`,
  );
}

export async function updatePassword(formData: FormData) {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid input";
    redirect(`/auth/reset-password?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error)
    redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);

  const {
    data: { user: updatedUser },
  } = await supabase.auth.getUser();
  if (updatedUser?.email) {
    const name =
      updatedUser.user_metadata?.name ?? updatedUser.email.split("@")[0];
    await sendEmail({
      to: updatedUser.email,
      userId: updatedUser.id,
      emailType: "SECURITY_ALERT",
      subject: securityAlertSubject,
      html: securityAlertEmailHtml({ name }),
    });
  }

  await supabase.auth.signOut();
  redirect(
    `/sign-in?message=${encodeURIComponent("Password updated — please sign in with your new password")}`,
  );
}

export async function signInWithGoogle(formData: FormData) {
  const rawRole = (formData.get("role") as string) ?? "";
  const roleParsed = roleSchema.safeParse(rawRole);
  const role = roleParsed.success ? roleParsed.data : "";

  const cookieStore = await cookies();
  cookieStore.set("pending_role", role, {
    path: "/",
    maxAge: 60 * 10, // 10 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  const supabase = await createClient();
  const callbackUrl = role
    ? `${BASE_URL}/auth/callback?pending_role=${encodeURIComponent(role)}`
    : `${BASE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) {
    redirect(
      `/sign-in?error=${encodeURIComponent(error?.message ?? "Google sign-in failed")}`,
    );
  }
  redirect(data.url);
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
