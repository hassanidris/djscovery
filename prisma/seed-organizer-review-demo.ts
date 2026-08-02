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

  const gig = await prisma.gig.create({
    data: {
      slug: `demo-organizer-review-${Date.now()}`,
      organizerProfileId: organizerUser.organizerProfile.id,
      title: "Demo Gig for Organizer Review",
      gigType: "CLUB",
      description: "Demo gig used to test the organizer review flow end-to-end.",
      status: "FILLED",
      eventDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      countryId: anyCity.countryId,
      cityId: anyCity.id,
      currency: "USD",
      budgetType: "FIXED",
      budgetMin: 500,
    },
  });

  const application = await prisma.gigApplication.create({
    data: {
      gigId: gig.id,
      djProfileId: djUser.djProfile.id,
      status: "ACCEPTED",
      acceptedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  });

  const hire = await prisma.hire.create({
    data: {
      applicationId: application.id,
      status: "COMPLETED",
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Created demo gig for organizer review testing:");
  console.log({ gigSlug: gig.slug, gigId: gig.id, applicationId: application.id, hireId: hire.id });
  console.log(`\nSign in as ${DJ_EMAIL} and visit /gigs/${gig.slug}/organizer-review to leave a review.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
