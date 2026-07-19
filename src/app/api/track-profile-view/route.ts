import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

export async function POST(req: NextRequest) {
  try {
    const { djProfileId } = await req.json();

    if (!djProfileId || typeof djProfileId !== "number") {
      return NextResponse.json(
        { error: "Invalid djProfileId" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Do not track views for the profile owner
    if (user) {
      const profile = await prisma.djProfile.findUnique({
        where: { id: djProfileId },
        select: { userId: true, status: true, hidden: true },
      });
      if (!profile)
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 },
        );
      if (profile.userId === user.id)
        return NextResponse.json({ success: true });
      if (profile.status !== "APPROVED" || profile.hidden) {
        return NextResponse.json({ success: true });
      }
    } else {
      // For anonymous users, still check profile visibility
      const profile = await prisma.djProfile.findUnique({
        where: { id: djProfileId },
        select: { status: true, hidden: true },
      });
      if (!profile)
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 },
        );
      if (profile.status !== "APPROVED" || profile.hidden) {
        return NextResponse.json({ success: true });
      }
    }

    // Simple rate-limit: one view per session per profile (using session cookie)
    const sessionKey = `profile_view_${djProfileId}`;
    const hasViewed = req.cookies.get(sessionKey);
    if (hasViewed) return NextResponse.json({ success: true });

    // Create profile view record
    // Capture viewer city/country for Top Cities analytics
    let viewerCity: string | null = null;
    let viewerCountry: string | null = null;
    if (user) {
      const viewerProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          city: { select: { name: true } },
          country: { select: { name: true } },
        },
      });
      viewerCity = viewerProfile?.city?.name ?? null;
      viewerCountry = viewerProfile?.country?.name ?? null;
    }

    await prisma.profileView.create({
      data: {
        djProfileId,
        viewerId: user?.id ?? null,
        source: null,
        city: viewerCity,
        country: viewerCountry,
      },
    });

    // Bump denormalized counter
    await prisma.djProfile.update({
      where: { id: djProfileId },
      data: { monthlyViews: { increment: 1 } },
    });

    // Set cookie to prevent duplicate tracking for 1 hour
    const response = NextResponse.json({ success: true });
    response.cookies.set(sessionKey, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
    });

    return response;
  } catch (error) {
    console.error("Profile view tracking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
