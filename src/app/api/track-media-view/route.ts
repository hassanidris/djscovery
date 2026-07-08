import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

export async function POST(req: NextRequest) {
  try {
    const { mediaId, type } = await req.json();

    if (!mediaId || typeof mediaId !== "number") {
      return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });
    }
    if (type !== "AUDIO" && type !== "VIDEO") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Dedupe: one increment per viewer per media per day (via cookie)
    const sessionKey = `media_view_${mediaId}`;
    const hasViewed = req.cookies.get(sessionKey);
    if (hasViewed) return NextResponse.json({ success: true });

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: { id: true, type: true },
    });
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    await prisma.media.update({
      where: { id: mediaId },
      data:
        type === "AUDIO"
          ? { playCount: { increment: 1 } }
          : { viewCount: { increment: 1 } },
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
    console.error("Media view tracking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
