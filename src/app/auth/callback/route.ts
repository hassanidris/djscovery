import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  welcomeEmailSubject,
  welcomeEmailHtml,
} from "@/lib/email/templates/welcome";
import { generateWelcomeCta } from "@/lib/supabase/admin";
import { roleSchema } from "@/lib/validations/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "";

  if (!code && !(token_hash && type)) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=auth_callback_failed`,
    );
  }

  try {
    const supabase = await createClient();

    if (token_hash && type) {
      const { error: otpError } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      if (otpError) {
        console.error("[auth/callback] verifyOtp error:", otpError.message);
        return NextResponse.redirect(
          `${origin}/sign-in?error=auth_callback_failed`,
        );
      }
    } else {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code!);
      if (exchangeError) {
        console.error(
          "[auth/callback] exchangeCodeForSession error:",
          exchangeError.message,
        );
        return NextResponse.redirect(
          `${origin}/sign-in?error=auth_callback_failed`,
        );
      }
    }

    // Password recovery flow — session established, skip profile sync
    if (next === "/auth/reset-password") {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${origin}/sign-in?error=auth_callback_failed`,
      );
    }

    const email = user.email;
    if (!email) {
      return NextResponse.redirect(`${origin}/sign-in?error=missing_email`);
    }

    const username =
      user.user_metadata?.username ??
      email.split("@")[0] + "_" + user.id.slice(0, 6);
    const name =
      user.user_metadata?.displayName ??
      user.user_metadata?.name ??
      email.split("@")[0];
    const userId = user.id;

    // Role resolution priority: URL param → cookie → user_metadata
    // URL param survives cross-site OAuth redirect when Supabase allowlist
    // includes a wildcard (e.g. https://djcovery.com/auth/callback*)
    const rawUrlRole = searchParams.get("pending_role") ?? "";
    const urlRole = roleSchema.safeParse(rawUrlRole).success ? rawUrlRole : "";

    const cookieStore = await cookies();
    const rawCookieRole = cookieStore.get("pending_role")?.value ?? "";
    const cookieRole = roleSchema.safeParse(rawCookieRole).success
      ? rawCookieRole
      : "";
    const rawMetaRole = user.user_metadata?.role ?? "";
    const metaRole = roleSchema.safeParse(rawMetaRole).success
      ? rawMetaRole
      : "";
    const role = urlRole || cookieRole || metaRole;

    if (rawCookieRole) cookieStore.delete("pending_role");

    let dbRoles: string[] = [];
    let isNewUser = false;
    let onboardingComplete = false;

    try {
      await prisma.$transaction(async (tx) => {
        const prior = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, onboardingComplete: true },
        });
        isNewUser = !prior;
        onboardingComplete = prior?.onboardingComplete ?? false;

        // If a stale DB record exists for this email under a different auth ID
        // (can happen when the Supabase Auth account was deleted and re-created),
        // remove it so the upsert create path doesn't hit the email unique constraint.
        const stale = await tx.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (stale && stale.id !== userId) {
          await tx.user.delete({ where: { id: stale.id } });
        }

        await tx.user.upsert({
          where: { id: userId },
          update: { email },
          create: { id: userId, email, username },
        });

        await tx.emailPreference.upsert({
          where: { userId },
          update: {},
          create: { userId },
        });

        // Only create fan profile for brand-new users with fan intent
        // Returning incomplete users (e.g. DJ who never finished /become-dj)
        // must not be silently converted to fans
        if (isNewUser && (role === "" || role === "fan")) {
          await tx.fanProfile.create({ data: { userId, name } });
          await tx.userRole.create({ data: { userId, role: "FAN" } });
        }

        const roleRecords = await tx.userRole.findMany({
          where: { userId },
          select: { role: true },
        });
        dbRoles = roleRecords.map((r) => r.role);
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error("[auth/callback] DB transaction error:", detail);
      const msg =
        process.env.NODE_ENV === "development"
          ? encodeURIComponent(detail.slice(0, 150))
          : "db_error";
      return NextResponse.redirect(`${origin}/sign-in?error=${msg}`);
    }

    if (isNewUser) {
      const ctaUrl = await generateWelcomeCta(email);
      await sendEmail({
        to: email,
        userId,
        emailType: "WELCOME",
        subject: welcomeEmailSubject,
        html: welcomeEmailHtml({ name, ctaUrl }),
      });
    }

    // Welcome email CTA — role-aware redirect so users complete their profile
    if (searchParams.get("welcome") === "true") {
      if (dbRoles.includes("ADMIN"))
        return NextResponse.redirect(`${origin}/admin`);
      return NextResponse.redirect(`${origin}/select-role`);
    }

    if (dbRoles.includes("ADMIN"))
      return NextResponse.redirect(`${origin}/admin`);

    const isOnboarded =
      onboardingComplete ||
      dbRoles.includes("DJ") ||
      dbRoles.includes("ORGANIZER");

    if (!isOnboarded) return NextResponse.redirect(`${origin}/select-role`);

    return NextResponse.redirect(`${origin}/`);
  } catch (err) {
    console.error("[auth/callback] Unhandled error:", err);
    return NextResponse.redirect(`${origin}/sign-in?error=auth_error`);
  }
}
