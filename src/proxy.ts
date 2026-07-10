import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { indexingEnabled } from "./lib/seo/indexing";

const PRE_LAUNCH_MODE = process.env.PRE_LAUNCH_MODE === "true";

const isProduction =
  process.env.VERCEL_ENV === "production" ||
  process.env.NEXT_PUBLIC_APP_ENV === "production";

// Paths that remain accessible when the production site is masked behind the
// coming-soon placeholder. Auth paths and /admin stay reachable so the team can
// still sign in; everything else redirects to /coming-soon.
const ALWAYS_PUBLIC_PATHS = [
  "/coming-soon",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/update-password",
  "/auth/callback",
];

function isAlwaysPublic(pathname: string): boolean {
  if (ALWAYS_PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/api")) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // ── Pre-launch gate: mask the platform in production ──────────────────
  if (
    PRE_LAUNCH_MODE &&
    isProduction &&
    !isAlwaysPublic(request.nextUrl.pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    return NextResponse.rewrite(url);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — do not remove this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — redirect to /sign-in if not authenticated
  const protectedPaths = [
    "/dashboard",
    "/select-role",
    "/become-dj",
    "/become-organizer",
    "/become-fan",
    "/fan",
    "/organizer",
    "/settings",
    "/profile/edit",
    "/account",
    "/notifications",
    "/admin",
  ];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // Add X-Robots-Tag header when indexing is disabled

  if (!indexingEnabled) {
    supabaseResponse.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet",
    );
  }
  // noindexing code end here

  // Mark the placeholder page so the root layout hides the public shell.
  if (request.nextUrl.pathname === "/coming-soon") {
    supabaseResponse.headers.set("x-is-coming-soon", "true");
  }

  // Content Security Policy
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.jsdelivr.net/npm/@supabase/supabase-js",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' https: blob:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.tiktok.com https://open.spotify.com https://w.soundcloud.com https://www.mixcloud.com https://www.instagram.com https://embed.music.apple.com https://bandcamp.com https://www.facebook.com",
  ].join("; ");

  supabaseResponse.headers.set("Content-Security-Policy", cspHeader);

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
