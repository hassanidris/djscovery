import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const inheritedEnvKeys = new Set(Object.keys(process.env));
for (const file of [".env", ".env.local"]) {
  const filePath = resolve(process.cwd(), file);
  if (!existsSync(filePath)) continue;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (inheritedEnvKeys.has(key)) continue;
    process.env[key] = val;
  }
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DJ_EMAIL = process.env.DJ_EMAIL || "test-free-dj@example.com";
const ORGANIZER_EMAIL = process.env.ORGANIZER_EMAIL || "test-organizer@example.com";

async function main() {
  const djUser = await prisma.user.findUnique({
    where: { email: DJ_EMAIL },
    include: { djProfile: true },
  });
  if (!djUser?.djProfile) {
    throw new Error(`DJ profile not found for ${DJ_EMAIL}`);
  }

  const organizerUser = await prisma.user.findUnique({
    where: { email: ORGANIZER_EMAIL },
    include: { organizerProfile: true },
  });
  if (!organizerUser?.organizerProfile) {
    throw new Error(`Organizer profile not found for ${ORGANIZER_EMAIL}`);
  }

  const anyCity = await prisma.city.findFirst({
    select: { id: true, countryId: true },
  });
  if (!anyCity) throw new Error("No City records found — run `npm run seed` first.");

  // 1. Create a completed gig
  const gig = await prisma.gig.create({
    data: {
      slug: `reviewed-gig-${Date.now()}`,
      organizerProfileId: organizerUser.organizerProfile.id,
      title: "Sunset Beach Party",
      gigType: "CLUB",
      description:
        "A sunset beach party in Lisbon. Great crowd, smooth logistics, paid on time.",
      status: "FILLED",
      eventDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      countryId: anyCity.countryId,
      cityId: anyCity.id,
      currency: "USD",
      budgetType: "FIXED",
      budgetMin: 800,
    },
  });

  // 2. Accepted application from the DJ
  const application = await prisma.gigApplication.create({
    data: {
      gigId: gig.id,
      djProfileId: djUser.djProfile.id,
      status: "ACCEPTED",
      acceptedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  // 3. Completed hire
  const hire = await prisma.hire.create({
    data: {
      applicationId: application.id,
      status: "COMPLETED",
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  });

  // 4. The actual OrganizerReview (DJ reviewing the organizer)
  const review = await prisma.organizerReview.create({
    data: {
      gigId: gig.id,
      djProfileId: djUser.djProfile.id,
      organizerProfileId: organizerUser.organizerProfile.id,
      communication: 5,
      payment: 5,
      professionalism: 4,
      venueQuality: 5,
      rating: 5, // average of the four categories, rounded
      review:
        "Excellent organizer to work with. Clear communication from the start, payment was settled on the night, and the venue was well-equipped. The crowd was great and the whole set ran smoothly. Would happily play for them again.",
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
    },
  });

  console.log("Seeded completed gig + organizer review:");
  console.log({
    gigSlug: gig.slug,
    gigId: gig.id,
    applicationId: application.id,
    hireId: hire.id,
    reviewId: review.id,
    organizerSlug: organizerUser.organizerProfile.slug,
    djStageName: djUser.djProfile.stageName,
  });
  console.log(
    `\nView it on the organizer profile:\n  http://localhost:3000/organizers/${organizerUser.organizerProfile.slug}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
