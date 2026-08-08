import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/track-media-view/route";

vi.mock("@/lib/client", () => ({
  default: {
    media: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import prisma from "@/lib/client";

function makeRequest(body: unknown, cookieHeader?: string) {
  return new NextRequest("http://localhost:3000/api/track-media-view", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });
}

describe("POST /api/track-media-view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when mediaId is missing", async () => {
    const response = await POST(makeRequest({ type: "AUDIO" }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: "Invalid mediaId" });
  });

  it("returns 400 when mediaId is not a number", async () => {
    const response = await POST(makeRequest({ mediaId: "5", type: "AUDIO" }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: "Invalid mediaId" });
  });

  it("returns 400 when type is not AUDIO or VIDEO", async () => {
    const response = await POST(makeRequest({ mediaId: 5, type: "IMAGE" }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: "Invalid type" });
  });

  it("returns 404 when the media item does not exist", async () => {
    (prisma.media.findUnique as any).mockResolvedValue(null);

    const response = await POST(makeRequest({ mediaId: 999, type: "AUDIO" }));
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: "Media not found" });
    expect(prisma.media.update).not.toHaveBeenCalled();
  });

  it("increments playCount for AUDIO media", async () => {
    (prisma.media.findUnique as any).mockResolvedValue({ id: 5, type: "AUDIO" });
    (prisma.media.update as any).mockResolvedValue({});

    const response = await POST(makeRequest({ mediaId: 5, type: "AUDIO" }));

    expect(response.status).toBe(200);
    expect(prisma.media.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { playCount: { increment: 1 } },
    });
  });

  it("increments viewCount for VIDEO media", async () => {
    (prisma.media.findUnique as any).mockResolvedValue({ id: 6, type: "VIDEO" });
    (prisma.media.update as any).mockResolvedValue({});

    const response = await POST(makeRequest({ mediaId: 6, type: "VIDEO" }));

    expect(response.status).toBe(200);
    expect(prisma.media.update).toHaveBeenCalledWith({
      where: { id: 6 },
      data: { viewCount: { increment: 1 } },
    });
  });

  it("sets a dedupe cookie scoped to the media item after a successful increment", async () => {
    (prisma.media.findUnique as any).mockResolvedValue({ id: 7, type: "AUDIO" });
    (prisma.media.update as any).mockResolvedValue({});

    const response = await POST(makeRequest({ mediaId: 7, type: "AUDIO" }));

    const setCookie = response.cookies.get("media_view_7");
    expect(setCookie).toBeDefined();
    expect(setCookie?.value).toBe("1");
  });

  it("skips the DB increment when the dedupe cookie is already set", async () => {
    const response = await POST(
      makeRequest({ mediaId: 7, type: "AUDIO" }, "media_view_7=1"),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ success: true });
    expect(prisma.media.findUnique).not.toHaveBeenCalled();
    expect(prisma.media.update).not.toHaveBeenCalled();
  });

  it("returns 500 when the database throws", async () => {
    (prisma.media.findUnique as any).mockRejectedValue(new Error("DB down"));

    const response = await POST(makeRequest({ mediaId: 8, type: "AUDIO" }));

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: "Internal error" });
  });
});
