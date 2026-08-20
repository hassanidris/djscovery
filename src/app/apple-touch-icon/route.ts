import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const svgPath = path.join(process.cwd(), "public", "dj-logo.svg");
    const svgContent = await readFile(svgPath, "utf-8");
    
    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Icon not found", { status: 404 });
  }
}
