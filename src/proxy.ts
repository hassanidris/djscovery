import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { indexingEnabled } from "./lib/seo/indexing";

const PRE_LAUNCH_MODE = process.env.PRE_LAUNCH_MODE === "true";

// Paths that remain accessible during pre-launch (public landing, auth, legal, admin, api)
const ALWAYS_PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/faq",
  "/terms",
  "/privacy",
  "/founding-djs",
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

  // ── Pre-launch gate: block all platform routes in production ─────────────
  if (PRE_LAUNCH_MODE && !isAlwaysPublic(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
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

  // Content Security Policy
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.jsdelivr.net/npm/@supabase/supabase-js",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' https: blob:",
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.tiktok.com https://open.spotify.com",
  ].join("; ");

  supabaseResponse.headers.set("Content-Security-Policy", cspHeader);

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
