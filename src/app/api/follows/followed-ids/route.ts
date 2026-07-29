import { NextResponse } from "next/server";
import { getFollowedDjIds } from "@/lib/actions/follows";

// Intentionally dynamic (uses cookies/auth). Must never be called from
// within an ISR-cached page render. /directory stays a static shell; this
// route supplies the current viewer's followed-DJ ids via a client fetch.

export async function GET() {
  const followedDjIds = await getFollowedDjIds();
  return NextResponse.json({ followedDjIds });
}
