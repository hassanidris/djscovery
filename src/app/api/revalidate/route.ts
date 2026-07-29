import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

// Secret API key for internal revalidation requests
// Set this in your environment variables: REVALIDATE_SECRET_KEY
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    // Verify authentication via secret key
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${REVALIDATE_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { path, tag } = body;

    // Validate that either path or tag is provided
    if (!path && !tag) {
      return NextResponse.json(
        { error: "Either 'path' or 'tag' must be provided" },
        { status: 400 },
      );
    }

    // Revalidate specific path
    if (path) {
      if (typeof path !== "string") {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
      }
      revalidatePath(path);
      console.log(`[Revalidation] Revalidated path: ${path}`);
    }

    // Revalidate by tag
    if (tag) {
      if (typeof tag !== "string") {
        return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
      }
      revalidateTag(tag, "page");
      console.log(`[Revalidation] Revalidated tag: ${tag}`);
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      path: path || null,
      tag: tag || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Revalidation] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
