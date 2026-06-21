import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  welcomeEmailSubject,
  welcomeEmailHtml,
} from "@/lib/email/templates/welcome";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const next = searchParams.get("next") ?? "";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password recovery flow — session established, skip profile sync
      if (next === "/auth/reset-password") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const email = user.email ?? "";
        const username =
          user.user_metadata?.username ??
          email.split("@")[0] + "_" + user.id.slice(0, 6);
        const name = user.user_metadata?.name ?? email.split("@")[0];
        const userId = user.id;

        // Cookie role (Google OAuth) takes priority over user_metadata role (email signup)
        const cookieStore = await cookies();
        const cookieRole = cookieStore.get("pending_role")?.value ?? "";
        const metaRole = user.user_metadata?.role ?? "";
        const role = cookieRole || metaRole;
        if (cookieRole) cookieStore.delete("pending_role");

        let dbRoles: string[] = [];
        let isNewUser = false;

        await prisma.$transaction(async (tx) => {
          const prior = await tx.user.findUnique({
            where: { id: userId },
            select: { id: true },
          });
          isNewUser = !prior;

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

          if (role === "" || role === "fan") {
            const existing = await tx.fanProfile.findUnique({
              where: { userId },
            });
            if (!existing) {
              await tx.fanProfile.create({ data: { userId, name } });
            }
          }

          const roleRecords = await tx.userRole.findMany({
            where: { userId },
            select: { role: true },
          });
          dbRoles = roleRecords.map((r) => r.role);
        });

        if (isNewUser) {
          await sendEmail({
            to: email,
            userId,
            emailType: "WELCOME",
            subject: welcomeEmailSubject,
            html: welcomeEmailHtml({ name }),
          });
        }

        // Existing users → redirect to their dashboard
        if (dbRoles.includes("ADMIN"))
          return NextResponse.redirect(`${origin}/admin`);
        if (dbRoles.includes("DJ"))
          return NextResponse.redirect(`${origin}/dashboard`);
        if (dbRoles.includes("ORGANIZER"))
          return NextResponse.redirect(`${origin}/organizer/dashboard`);

        // New users → redirect based on signup intent
        if (role === "dj") return NextResponse.redirect(`${origin}/become-dj`);
        if (role === "organizer")
          return NextResponse.redirect(`${origin}/become-organizer`);
        return NextResponse.redirect(`${origin}/`); // fan
      }
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
