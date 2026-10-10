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
      "To seed test data, run: FORCE_SEED=true npm run seed:rewards-test",
    );
    process.exit(1);
  }

  console.log("🎯 Seeding rewards system test data...\n");

  // Create test genres if they don't exist
  const testGenres = ["House", "Techno", "Hip-Hop"];
  console.log("🎵 Ensuring test genres exist...");
  for (const genreName of testGenres) {
    const existing = await prisma.genre.findFirst({
      where: { name: genreName },
    });
    if (!existing) {
      await prisma.genre.create({
        data: { name: genreName },
      });
    }
  }

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

  // Create test users
  console.log("👤 Creating test users...");
  const testUsers = [
    {
      id: "test-user-1",
      username: "founding-dj-1",
      email: "founding-dj-1@test.com",
      name: "Founding DJ One",
    },
    {
      id: "test-user-2",
      username: "founding-dj-2",
      email: "founding-dj-2@test.com",
      name: "Founding DJ Two",
    },
    {
      id: "test-user-3",
      username: "founding-dj-3",
      email: "founding-dj-3@test.com",
      name: "Founding DJ Three",
    },
    {
      id: "test-user-4",
      username: "premium-dj",
      email: "premium-dj@test.com",
      name: "Premium DJ",
    },
    {
      id: "test-user-5",
      username: "free-dj",
      email: "free-dj@test.com",
      name: "Free DJ",
    },
  ];

  for (const userData of testUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (!existing) {
      await prisma.user.create({
        data: userData,
      });
      console.log(`  ✅ Created user: ${userData.email}`);
    } else {
      console.log(`  ⏭️  User exists: ${userData.email}`);
    }
  }

  // Get created users
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: testUsers.map((u) => u.email),
      },
    },
  });

  // Create DJ profiles
  console.log("\n🎧 Creating DJ profiles...");
  const profiles = [
    {
      userId: users.find((u) => u.email === "founding-dj-1@test.com")!.id,
      stageName: "DJ Alpha",
      slug: "dj-alpha",
      plan: "FOUNDING" as const,
      priorityBoost: 1,
      searchScore: 500,
      reputationScore: 750,
    },
    {
      userId: users.find((u) => u.email === "founding-dj-2@test.com")!.id,
      stageName: "DJ Beta",
      slug: "dj-beta",
      plan: "FOUNDING" as const,
      priorityBoost: 1,
      searchScore: 450,
      reputationScore: 700,
    },
    {
      userId: users.find((u) => u.email === "founding-dj-3@test.com")!.id,
      stageName: "DJ Gamma",
      slug: "dj-gamma",
      plan: "FOUNDING" as const,
      priorityBoost: 1,
      searchScore: 400,
      reputationScore: 650,
    },
    {
      userId: users.find((u) => u.email === "premium-dj@test.com")!.id,
      stageName: "DJ Premium",
      slug: "dj-premium",
      plan: "PREMIUM" as const,
      priorityBoost: 2,
      searchScore: 600,
      reputationScore: 800,
      premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
      userId: users.find((u) => u.email === "free-dj@test.com")!.id,
      stageName: "DJ Free",
      slug: "dj-free",
      plan: "FREE" as const,
      priorityBoost: 0,
      searchScore: 300,
      reputationScore: 500,
    },
  ];

  for (const profileData of profiles) {
    const existing = await prisma.djProfile.findUnique({
      where: { slug: profileData.slug },
    });
    if (!existing) {
      await prisma.djProfile.create({
        data: {
          ...profileData,
          countryId: country.id,
          cityId: city.id,
          status: "APPROVED",
          bio: `Test profile for ${profileData.stageName}`,
          avatar: "https://via.placeholder.com/150",
          coverImage: "https://via.placeholder.com/1200x400",
          bookingEmail: profileData.userId,
        },
      });
      console.log(
        `  ✅ Created profile: ${profileData.stageName} (${profileData.plan})`,
      );
    } else {
      console.log(`  ⏭️  Profile exists: ${profileData.stageName}`);
    }
  }

  // Get created profiles
  const djProfiles = await prisma.djProfile.findMany({
    where: {
      slug: {
        in: profiles.map((p) => p.slug),
      },
    },
  });

  // Create FoundingMember records
  console.log("\n👑 Creating FoundingMember records...");
  const foundingProfiles = djProfiles.filter((p) => p.plan === "FOUNDING");

  for (let i = 0; i < foundingProfiles.length; i++) {
    const profile = foundingProfiles[i];
    const existing = await prisma.foundingMember.findUnique({
      where: { djProfileId: profile.id },
    });
    if (!existing) {
      await prisma.foundingMember.create({
        data: {
          djProfileId: profile.id,
          foundingNumber: i + 1,
          status: "ACTIVE",
        },
      });
      console.log(
        `  ✅ Created FoundingMember: ${profile.stageName} (#${i + 1})`,
      );
    } else {
      console.log(`  ⏭️  FoundingMember exists: ${profile.stageName}`);
    }
  }

  // Update DjProfile with founding number
  for (const profile of foundingProfiles) {
    const foundingMember = await prisma.foundingMember.findUnique({
      where: { djProfileId: profile.id },
    });
    if (foundingMember) {
      await prisma.djProfile.update({
        where: { id: profile.id },
        data: {
          isFoundingMember: true,
          foundingNumber: foundingMember.foundingNumber,
        },
      });
    }
  }

  // Create test media items
  console.log("\n📸 Creating test media items...");
  const freeProfile = djProfiles.find((p) => p.slug === "dj-free");
  if (freeProfile) {
    // Add 6 photos (at limit for FREE)
    for (let i = 1; i <= 6; i++) {
      await prisma.media.create({
        data: {
          djProfileId: freeProfile.id,
          type: "IMAGE",
          url: `https://via.placeholder.com/800x600?text=Photo+${i}`,
          path: `test/photo-${i}.jpg`,
          bucket: "test-bucket",
          title: `Test Photo ${i}`,
          sortOrder: i,
        },
      });
    }
    console.log(
      `  ✅ Created 6 photos for ${freeProfile.stageName} (at FREE limit)`,
    );

    // Add 2 video/audio items (at limit for FREE)
    await prisma.media.create({
      data: {
        djProfileId: freeProfile.id,
        type: "VIDEO",
        url: "https://youtube.com/test",
        path: "test/video-1",
        bucket: "external",
        title: "Test Video 1",
        sortOrder: 7,
      },
    });
    await prisma.media.create({
      data: {
        djProfileId: freeProfile.id,
        type: "AUDIO",
        url: "https://soundcloud.com/test",
        path: "test/audio-1",
        bucket: "external",
        title: "Test Audio 1",
        sortOrder: 8,
      },
    });
    console.log(
      `  ✅ Created 2 video/audio items for ${freeProfile.stageName} (at FREE limit)`,
    );
  }

  console.log("\n✅ Rewards system test data seeded successfully!\n");
  console.log("Test accounts:");
  console.log("  - founding-dj-1@test.com (DJ Alpha - FOUNDING #1)");
  console.log("  - founding-dj-2@test.com (DJ Beta - FOUNDING #2)");
  console.log("  - founding-dj-3@test.com (DJ Gamma - FOUNDING #3)");
  console.log("  - premium-dj@test.com (DJ Premium - PREMIUM)");
  console.log("  - free-dj@test.com (DJ Free - FREE, at media limits)\n");
  console.log("Next steps:");
  console.log("  1. Navigate to /admin/founding/members to test activation");
  console.log("  2. Test media limits with free-dj@test.com");
  console.log("  3. Test FoundingBadge component on founding DJ profiles\n");
  console.log(
    "To test premium expiry cron, manually set a DJ's premiumUntil to a past date in the database.",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
