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
    console.log("To cleanup test data, run: FORCE_CLEANUP=true npm run cleanup:founding-applications");
    process.exit(1);
  }

  console.log("🧹 Cleaning up founding applications test data...\n");

  const testEmails = [
    "applicant-pending-1@test.com",
    "applicant-pending-2@test.com",
    "applicant-email-verified@test.com",
    "applicant-under-review@test.com",
    "applicant-approved@test.com",
    "applicant-rejected@test.com",
    "applicant-withdrawn@test.com",
  ];

  // Delete status logs
  console.log("📋 Deleting status logs...");
  const statusLogsDelete = await prisma.foundingApplicationStatusLog.deleteMany({
    where: {
      foundingApplication: {
        email: { in: testEmails },
      },
    },
  });
  console.log(`  ✅ Deleted ${statusLogsDelete.count} status logs`);

  // Delete invitation tokens
  console.log("\n🎫 Deleting invitation tokens...");
  const invitationsDelete = await prisma.invitationToken.deleteMany({
    where: {
      foundingApplication: {
        email: { in: testEmails },
      },
    },
  });
  console.log(`  ✅ Deleted ${invitationsDelete.count} invitation tokens`);

  // Delete founding applications
  console.log("\n📝 Deleting founding applications...");
  const applicationsDelete = await prisma.foundingApplication.deleteMany({
    where: {
      email: { in: testEmails },
    },
  });
  console.log(`  ✅ Deleted ${applicationsDelete.count} founding applications`);

  console.log("\n✅ Founding applications test data cleaned up successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
