import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

// This route is intentionally dynamic (uses cookies/auth) and must NEVER be
// called from within an ISR-cached page render. It exists so that
// /djs/[slug] can stay a static, ISR-cached shell while still surfacing
// per-viewer state (follow status, booking role) via a client-side fetch.

type BookingRole = "guest" | "fan" | "organizer" | "dj-owner" | "admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const dj = await prisma.djProfile.findUnique({
    where: { slug },
    select: { id: true, userId: true },
  });

  if (!dj) {
    return NextResponse.json(
      {
        viewMode: "fan",
        isFollowed: false,
        viewerContext: { role: "guest", isAuthenticated: false },
      },
      { status: 200 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const viewMode = authUser?.id === dj.userId ? "dj-owner" : "fan";

  let isFollowed = false;
  let viewerContext: {
    role: BookingRole;
    isAuthenticated: boolean;
    organizerDisplayName?: string;
    organizerContactEmail?: string;
    organizerCityId?: number;
    organizerCityName?: string;
    organizerCountryId?: number;
  } = { role: "guest", isAuthenticated: false };

  if (authUser) {
    const [follow, roleRows, organizerProfile] = await Promise.all([
      viewMode === "fan"
        ? prisma.djFollow.findUnique({
            where: {
              userId_djProfileId: { userId: authUser.id, djProfileId: dj.id },
            },
          })
        : Promise.resolve(null),
      prisma.userRole.findMany({
        where: { userId: authUser.id },
        select: { role: true },
      }),
      prisma.organizerProfile.findUnique({
        where: { userId: authUser.id },
        select: {
          displayName: true,
          contactEmail: true,
          countryId: true,
          cityId: true,
          city: { select: { id: true, name: true } },
        },
      }),
    ]);

    isFollowed = !!follow;

    const roleSet = new Set(roleRows.map((r) => r.role));
    let bookingRole: BookingRole = "fan";
    if (authUser.id === dj.userId) bookingRole = "dj-owner";
    else if (roleSet.has("ADMIN")) bookingRole = "admin";
    else if (roleSet.has("ORGANIZER")) bookingRole = "organizer";

    viewerContext = {
      role: bookingRole,
      isAuthenticated: true,
      organizerDisplayName: organizerProfile?.displayName ?? undefined,
      organizerContactEmail: organizerProfile?.contactEmail ?? undefined,
      organizerCityId: organizerProfile?.cityId ?? undefined,
      organizerCityName: organizerProfile?.city?.name ?? undefined,
      organizerCountryId: organizerProfile?.countryId ?? undefined,
    };
  }

  return NextResponse.json({ viewMode, isFollowed, viewerContext });
}
