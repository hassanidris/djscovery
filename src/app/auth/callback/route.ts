import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Sync Supabase Auth user into our public User table
        const email = user.email ?? "";
        const username =
          user.user_metadata?.username ??
          email.split("@")[0] + "_" + user.id.slice(0, 6);

        await prisma.user.upsert({
          where: { id: user.id },
          update: { email },
          create: { id: user.id, email, username },
        });

        // Assign extra role if provided at sign-up (dj or organiser)
        const rawRole = user.user_metadata?.role as string | undefined;
        if (rawRole === "dj" || rawRole === "organiser") {
          const role = rawRole === "dj" ? "DJ" : "ORGANIZER";
          await prisma.userRole.upsert({
            where: { userId_role: { userId: user.id, role } },
            update: {},
            create: { userId: user.id, role },
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
