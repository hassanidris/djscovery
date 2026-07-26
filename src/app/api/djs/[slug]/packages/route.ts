import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { notFound } from "next/navigation";
import { cacheGet, cacheSet } from "@/lib/cache";

export const revalidate = 300; // Cache for 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Check cache first
  const cacheKey = `dj_packages:${slug}`;
  const cached = await cacheGet<
    Array<{
      id: number;
      name: string;
      priceFrom: number;
      priceTo: number | null;
      currency: string;
      duration: string | null;
      features: string[];
      popular: boolean;
      sortOrder: number;
    }>
  >(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  // Get DJ profile ID
  const djProfile = await prisma.djProfile.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });

  if (!djProfile || djProfile.status === "REJECTED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch packages
  const packages = await prisma.djPackage.findMany({
    where: { djProfileId: djProfile.id },
    orderBy: { sortOrder: "asc" },
  });

  // Cache for 5 minutes
  await cacheSet(cacheKey, packages, 300);

  return NextResponse.json(packages);
}
