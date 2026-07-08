import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json();

    if (!eventId || typeof eventId !== "number") {
      return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
    }

    // Dedupe: one increment per viewer per event per day (via cookie)
    const sessionKey = `event_view_${eventId}`;
    const hasViewed = req.cookies.get(sessionKey);
    if (hasViewed) return NextResponse.json({ success: true });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { viewCount: { increment: 1 } },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(sessionKey, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("Event view tracking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
