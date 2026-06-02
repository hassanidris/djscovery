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
      }

      // Always send newly confirmed users to role selection
      const destination = next !== "/" ? next : "/select-role";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
