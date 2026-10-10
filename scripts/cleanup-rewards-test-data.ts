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
  const forceCleanup = process.env.FORCE_CLEANUP === "true";

  const PROD_MARKERS = ["unrqebwfdfumpjgvavbk"];
  const urlLooksProd = PROD_MARKERS.some((m) => databaseUrl.includes(m));
  const envIsProd = appEnv === "production";
  const isProd = envIsProd || urlLooksProd;

  if (isProd && !forceCleanup) {
    console.error("❌ Cleanup blocked — production database detected");
    console.log(
      "To cleanup test data, run: FORCE_CLEANUP=true npm run cleanup:rewards-test",
    );
    process.exit(1);
  }

  console.log("🧹 Cleaning up rewards system test data...\n");

  const testEmails = [
    "founding-dj-1@test.com",
    "founding-dj-2@test.com",
    "founding-dj-3@test.com",
    "premium-dj@test.com",
    "free-dj@test.com",
  ];

  const testSlugs = [
    "dj-alpha",
    "dj-beta",
    "dj-gamma",
    "dj-premium",
    "dj-free",
  ];

  // Delete media items
  console.log("📸 Deleting test media items...");
  const mediaDelete = await prisma.media.deleteMany({
    where: {
      djProfile: {
        slug: { in: testSlugs },
      },
    },
  });
  console.log(`  ✅ Deleted ${mediaDelete.count} media items`);

  // Delete FoundingMember records
  console.log("\n👑 Deleting FoundingMember records...");
  const foundingDelete = await prisma.foundingMember.deleteMany({
    where: {
      djProfile: {
        slug: { in: testSlugs },
      },
    },
  });
  console.log(`  ✅ Deleted ${foundingDelete.count} FoundingMember records`);

  // Delete DJ profiles
  console.log("\n🎧 Deleting DJ profiles...");
  const profileDelete = await prisma.djProfile.deleteMany({
    where: {
      slug: { in: testSlugs },
    },
  });
  console.log(`  ✅ Deleted ${profileDelete.count} DJ profiles`);

  // Delete test users
  console.log("\n👤 Deleting test users...");
  const userDelete = await prisma.user.deleteMany({
    where: {
      email: { in: testEmails },
    },
  });
  console.log(`  ✅ Deleted ${userDelete.count} test users`);

  console.log("\n✅ Rewards system test data cleaned up successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
