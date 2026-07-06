import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Load .env.local so Prisma picks up Supabase credentials
config({ path: resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * One-time backfill script to assign FAN role to existing users who have a FanProfile
 * but currently have no UserRole entries.
 *
 * Run with: npx tsx prisma/backfill-fan-roles.ts
 *
 * This script targets the database specified in DATABASE_URL.
 * - Staging: djscovery-staging Supabase project
 * - Production: djscovery-prod Supabase project
 */

async function backfillFanRoles() {
  console.log("🔍 Finding users with FanProfile but no roles...");

  const usersWithoutRoles = await prisma.user.findMany({
    where: {
      deletedAt: null,
      fanProfile: { isNot: null },
      roles: { none: {} },
    },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });

  console.log(`📊 Found ${usersWithoutRoles.length} users to backfill`);

  if (usersWithoutRoles.length === 0) {
    console.log("✅ No backfill needed — all fans already have the FAN role");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const user of usersWithoutRoles) {
    try {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: "FAN",
        },
      });
      console.log(`✅ Added FAN role to: ${user.email} (${user.username})`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to add FAN role to ${user.email}:`, err);
      errorCount++;
    }
  }

  console.log("\n📋 Summary:");
  console.log(`- Successfully backfilled: ${successCount}`);
  console.log(`- Failed: ${errorCount}`);
  console.log(`- Total processed: ${usersWithoutRoles.length}`);
}

backfillFanRoles()
  .then(() => {
    console.log("\n✅ Backfill complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Backfill failed:", err);
    process.exit(1);
  });
