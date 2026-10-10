import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "./lib/client";

type SiteMode = "PRE_LAUNCH" | "BETA" | "LIVE";

const SITE_MODE = (process.env.SITE_MODE || "PRE_LAUNCH") as SiteMode;

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
  "/founding-djs",
  "/become-dj",
];

// Paths that remain accessible in BETA mode (in addition to ALWAYS_PUBLIC_PATHS)
const BETA_PUBLIC_PATHS = ["/djs", "/events", "/gigs", "/venues"];

function isAlwaysPublic(pathname: string): boolean {
  if (ALWAYS_PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/founding-djs")) return true;
  return false;
}

function isBetaPublic(pathname: string): boolean {
  if (isAlwaysPublic(pathname)) return true;
  if (
    BETA_PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  )
    return true;
  return false;
}

function setSecurityHeaders(response: NextResponse): void {
  // Content Security Policy
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.jsdelivr.net/npm/@supabase/supabase-js https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io",
    "media-src 'self' https: blob:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.tiktok.com https://open.spotify.com https://w.soundcloud.com https://www.mixcloud.com https://www.instagram.com https://embed.music.apple.com https://bandcamp.com https://www.facebook.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspHeader);

  // Additional security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // HSTS only in production
  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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

  // Protected routes — redirect to /sign-in if not authenticated
  const protectedPaths = [
    "/dashboard",
    "/select-role",
    "/become-dj",
    "/become-organizer",
    "/become-fan",
    "/fan",
    "/dj",
    "/organizer",
    "/profile/edit",
    "/inbox",
    "/admin",
  ];
  const isProtected = protectedPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(`${path}/`),
  );

  // ── Site mode gate: control access based on SITE_MODE ──────────────────
  if (isProduction) {
    let isBetaExempt = false;
    let user = null;

    // Only fetch user if we need it for beta exemption or protected routes
    const needsUserCheck = SITE_MODE === "BETA" || isProtected;

    if (needsUserCheck) {
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser();
      user = fetchedUser;
    }

    // Check for beta exemption (founding members with ACTIVE status)
    if (SITE_MODE === "BETA" && user) {
      try {
        const userProfile = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            djProfile: true,
          },
        });

        if (userProfile?.djProfile) {
          const foundingMember = await prisma.foundingMember.findUnique({
            where: { djProfileId: userProfile.djProfile.id },
          });

          if (foundingMember?.status === "ACTIVE") {
            isBetaExempt = true;
          }
        }
      } catch (error) {
        // If DB check fails, don't exempt (fail secure)
        console.error("Error checking beta exemption:", error);
      }
    }

    if (
      SITE_MODE === "PRE_LAUNCH" &&
      !isAlwaysPublic(request.nextUrl.pathname)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/coming-soon";
      const response = NextResponse.rewrite(url);
      response.headers.set("x-is-coming-soon", "true");
      setSecurityHeaders(response);
      return response;
    }

    if (
      SITE_MODE === "BETA" &&
      !isBetaExempt &&
      !isBetaPublic(request.nextUrl.pathname)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/coming-soon";
      const response = NextResponse.rewrite(url);
      response.headers.set("x-is-coming-soon", "true");
      setSecurityHeaders(response);
      return response;
    }

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      const response = NextResponse.redirect(url);
      setSecurityHeaders(response);
      return response;
    }
  } else {
    // In non-production, only check protected routes
    if (isProtected) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/sign-in";
        const response = NextResponse.redirect(url);
        setSecurityHeaders(response);
        return response;
      }
    }
  }

  // Add X-Robots-Tag header when indexing is disabled (PRE_LAUNCH or BETA mode)
  const indexingEnabled = SITE_MODE === "LIVE";

  if (!indexingEnabled) {
    supabaseResponse.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet",
    );
  }

  // Mark the placeholder page so the root layout hides the public shell.
  if (request.nextUrl.pathname === "/coming-soon") {
    supabaseResponse.headers.set("x-is-coming-soon", "true");
  }

  setSecurityHeaders(supabaseResponse);

  if (request.nextUrl.pathname.startsWith("/founding-djs/invitation/")) {
    supabaseResponse.headers.set(
      "Cache-Control",
      "private, no-store, max-age=0",
    );
    supabaseResponse.headers.set("Referrer-Policy", "no-referrer");
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
