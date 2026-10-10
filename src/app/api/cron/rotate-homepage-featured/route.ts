import { NextRequest } from "next/server";
import { validateCronAuth, createCronAuthResponse } from "@/lib/cron-auth";
import { rotateHomepageFeatured } from "@/lib/actions/founding/rotate-homepage-featured";
import { cacheDelete } from "@/lib/cache";

export async function GET(request: NextRequest) {
  if (!validateCronAuth(request)) {
    return createCronAuthResponse("Unauthorized");
  }

  try {
    const rotatedCount = await rotateHomepageFeatured();

    await cacheDelete("featured_djs:homepage").catch(() => {});

    return new Response(
      JSON.stringify({
        success: true,
        rotatedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Homepage rotation cron error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
