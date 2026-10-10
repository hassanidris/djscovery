import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Load .env and .env.local relative to the project root (cwd)
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const forceSeed = process.env.FORCE_SEED === "true";

  const PROD_MARKERS = ["unrqebwfdfumpjgvavbk"];
  const urlLooksProd = PROD_MARKERS.some((m) => databaseUrl.includes(m));
  const envIsProd = appEnv === "production";
  const isProd = envIsProd || urlLooksProd;

  if (isProd && !forceSeed) {
    console.error("❌ Seed blocked — production database detected");
    console.log(
      "To seed test data, run: FORCE_SEED=true npm run seed:founding-applications",
    );
    process.exit(1);
  }

  console.log("📝 Seeding founding applications test data...\n");

  // Get or create test country and city
  let country = await prisma.country.findFirst({
    where: { code: "US" },
  });
  if (!country) {
    console.log("🌍 Creating US country...");
    country = await prisma.country.create({
      data: { name: "United States", code: "US" },
    });
  }

  let city = await prisma.city.findFirst({
    where: { countryId: country.id, name: "New York" },
  });
  if (!city) {
    console.log("🏙️  Creating New York city...");
    city = await prisma.city.create({
      data: { name: "New York", countryId: country.id },
    });
  }

  // Get genres
  const genres = await prisma.genre.findMany({ take: 5 });
  const genreNames = genres.map((g) => g.name);

  // Create test applications in different statuses
  console.log("📝 Creating founding applications...");
  const testApplications = [
    {
      email: "applicant-pending-1@test.com",
      name: "Alice Johnson",
      stageName: "DJ Alice",
      phone: "+1234567890",
      experienceYears: 5,
      genres: genreNames.slice(0, 2),
      experienceLevel: "PROFESSIONAL" as const,
      portfolioLinks: ["https://soundcloud.com/djalice"],
      bio: "Professional DJ with 5 years experience in house and techno.",
      status: "PENDING" as const,
    },
    {
      email: "applicant-pending-2@test.com",
      name: "Bob Smith",
      stageName: "DJ Bob",
      phone: "+1234567891",
      experienceYears: 3,
      genres: genreNames.slice(1, 3),
      experienceLevel: "INTERMEDIATE" as const,
      portfolioLinks: ["https://mixcloud.com/djbob"],
      bio: "Intermediate DJ specializing in hip-hop and R&B.",
      status: "PENDING" as const,
    },
    {
      email: "applicant-email-verified@test.com",
      name: "Carol Davis",
      stageName: "DJ Carol",
      phone: "+1234567892",
      experienceYears: 7,
      genres: genreNames.slice(2, 4),
      experienceLevel: "PROFESSIONAL" as const,
      portfolioLinks: ["https://soundcloud.com/djcarol"],
      bio: "Professional DJ with 7 years experience in trance and progressive.",
      status: "EMAIL_VERIFIED" as const,
      emailVerifiedAt: new Date(),
    },
    {
      email: "applicant-under-review@test.com",
      name: "David Wilson",
      stageName: "DJ David",
      phone: "+1234567893",
      experienceYears: 4,
      genres: genreNames.slice(0, 3),
      experienceLevel: "INTERMEDIATE" as const,
      portfolioLinks: ["https://mixcloud.com/djdavid"],
      bio: "Intermediate DJ with diverse genre experience.",
      status: "UNDER_REVIEW" as const,
      emailVerifiedAt: new Date(),
      reviewedAt: new Date(),
    },
    {
      email: "applicant-approved@test.com",
      name: "Eva Martinez",
      stageName: "DJ Eva",
      phone: "+1234567894",
      experienceYears: 10,
      genres: genreNames.slice(0, 2),
      experienceLevel: "EXPERT" as const,
      portfolioLinks: ["https://soundcloud.com/djeva"],
      bio: "Expert DJ with 10 years experience in house music.",
      status: "APPROVED" as const,
      emailVerifiedAt: new Date(),
      reviewedAt: new Date(),
    },
    {
      email: "applicant-rejected@test.com",
      name: "Frank Brown",
      stageName: "DJ Frank",
      phone: "+1234567895",
      experienceYears: 1,
      genres: genreNames.slice(3, 5),
      experienceLevel: "BEGINNER" as const,
      portfolioLinks: ["https://soundcloud.com/djfrank"],
      bio: "Beginner DJ looking to build experience.",
      status: "REJECTED" as const,
      emailVerifiedAt: new Date(),
      reviewedAt: new Date(),
      rejectionReason: "Insufficient experience for founding program",
    },
    {
      email: "applicant-withdrawn@test.com",
      name: "Grace Lee",
      stageName: "DJ Grace",
      phone: "+1234567896",
      experienceYears: 2,
      genres: genreNames.slice(1, 3),
      experienceLevel: "INTERMEDIATE" as const,
      portfolioLinks: ["https://mixcloud.com/djgrace"],
      bio: "Intermediate DJ who withdrew application.",
      status: "WITHDRAWN" as const,
      emailVerifiedAt: new Date(),
    },
  ];

  for (const appData of testApplications) {
    const existing = await prisma.foundingApplication.findFirst({
      where: { email: appData.email },
    });
    if (!existing) {
      await prisma.foundingApplication.create({
        data: {
          ...appData,
          countryId: country.id,
          cityId: city.id,
        },
      });
      console.log(
        `  ✅ Created application: ${appData.name} (${appData.status})`,
      );
    } else {
      console.log(`  ⏭️  Application exists: ${appData.name}`);
    }
  }

  console.log("\n✅ Founding applications test data seeded successfully!\n");
  console.log("Test applications:");
  console.log("  - applicant-pending-1@test.com (PENDING)");
  console.log("  - applicant-pending-2@test.com (PENDING)");
  console.log("  - applicant-email-verified@test.com (EMAIL_VERIFIED)");
  console.log("  - applicant-under-review@test.com (UNDER_REVIEW)");
  console.log("  - applicant-approved@test.com (APPROVED)");
  console.log("  - applicant-rejected@test.com (REJECTED)");
  console.log("  - applicant-withdrawn@test.com (WITHDRAWN)\n");
  console.log("Next steps:");
  console.log(
    "  1. Navigate to /admin/founding/applications to view applications",
  );
  console.log("  2. Test status transitions (approve, reject, withdraw)");
  console.log("  3. Test email verification flow\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
