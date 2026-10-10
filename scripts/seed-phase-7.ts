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
    console.log("To seed test data, run: FORCE_SEED=true npm run seed:phase-7");
    process.exit(1);
  }

  console.log(
    "🎯 Seeding Phase 7 (Admin Member Management + Analytics) test data...\n",
  );

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

  // Get or create test admin user
  console.log("👤 Ensuring admin user exists...");
  let adminUser = await prisma.user.findFirst({
    where: { email: "admin@test.com" },
  });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        id: "admin-user-test",
        username: "admin",
        email: "admin@test.com",
        name: "Test Admin",
      },
    });
    console.log("  ✅ Created admin user");
  } else {
    console.log("  ⏭️  Admin user exists");
  }

  // Get DJ profiles for founding members
  console.log("\n🎧 Getting DJ profiles...");
  const djProfiles = await prisma.djProfile.findMany({
    where: {
      slug: {
        in: ["dj-alpha", "dj-beta", "dj-gamma", "dj-premium", "dj-free"],
      },
    },
    include: {
      user: true,
    },
  });

  if (djProfiles.length === 0) {
    console.log("⚠️  No DJ profiles found. Run seed:rewards-test-data first.");
    process.exit(1);
  }

  // Create/update FoundingMember records with different statuses
  console.log("\n👑 Creating FoundingMember records with various statuses...");
  const memberConfigs = [
    {
      slug: "dj-alpha",
      foundingNumber: 1,
      status: "ACTIVE" as const,
      launchedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      slug: "dj-beta",
      foundingNumber: 2,
      status: "ACTIVE" as const,
      launchedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      slug: "dj-gamma",
      foundingNumber: 3,
      status: "SUSPENDED" as const,
      launchedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      slug: "dj-premium",
      foundingNumber: null,
      status: "PENDING_ONBOARDING" as const,
      launchedAt: null,
    },
    {
      slug: "dj-free",
      foundingNumber: 4,
      status: "REVOKED" as const,
      launchedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      revokedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      revocationReason: "Terms of service violation",
    },
  ];

  for (const config of memberConfigs) {
    const profile = djProfiles.find((p) => p.slug === config.slug);
    if (!profile) continue;

    const existing = await prisma.foundingMember.findUnique({
      where: { djProfileId: profile.id },
    });

    if (!existing) {
      await prisma.foundingMember.create({
        data: {
          djProfileId: profile.id,
          foundingNumber: config.foundingNumber,
          status: config.status,
          launchedAt: config.launchedAt,
          revokedAt: config.revokedAt,
          revocationReason: config.revocationReason,
        },
      });
      console.log(
        `  ✅ Created FoundingMember: ${profile.stageName} (${config.status})`,
      );
    } else {
      await prisma.foundingMember.update({
        where: { id: existing.id },
        data: {
          foundingNumber: config.foundingNumber,
          status: config.status,
          launchedAt: config.launchedAt,
          revokedAt: config.revokedAt,
          revocationReason: config.revocationReason,
        },
      });
      console.log(
        `  ⏭️  Updated FoundingMember: ${profile.stageName} (${config.status})`,
      );
    }

    // Update DJ profile with founding number
    await prisma.djProfile.update({
      where: { id: profile.id },
      data: {
        isFoundingMember: config.status !== "REVOKED",
        foundingNumber: config.foundingNumber,
      },
    });
  }

  // Create invitation tokens
  console.log("\n📧 Creating invitation tokens...");
  const invitationConfigs = [
    {
      email: "new-dj-1@test.com",
      status: "PENDING" as const,
      daysUntilExpiry: 14,
    },
    {
      email: "new-dj-2@test.com",
      status: "ACCEPTED" as const,
      daysUntilExpiry: 7,
    },
    {
      email: "new-dj-3@test.com",
      status: "EXPIRED" as const,
      daysUntilExpiry: -5,
    },
    {
      email: "new-dj-4@test.com",
      status: "REVOKED" as const,
      daysUntilExpiry: 10,
    },
  ];

  for (const config of invitationConfigs) {
    const existing = await prisma.invitationToken.findFirst({
      where: { email: config.email, type: "FOUNDING_MEMBER" },
    });

    if (!existing) {
      const expiresAt = new Date(
        Date.now() + config.daysUntilExpiry * 24 * 60 * 60 * 1000,
      );
      await prisma.invitationToken.create({
        data: {
          tokenHash: "test-hash-" + config.email,
          type: "FOUNDING_MEMBER",
          email: config.email,
          status: config.status,
          expiresAt,
          acceptedAt: config.status === "ACCEPTED" ? new Date() : null,
        },
      });
      console.log(
        `  ✅ Created invitation: ${config.email} (${config.status})`,
      );
    } else {
      console.log(`  ⏭️  Invitation exists: ${config.email}`);
    }
  }

  // Create waitlist entries with UTM parameters
  console.log("\n📋 Creating waitlist entries...");
  const waitlistEntries = [
    {
      email: "waitlist-dj-1@test.com",
      name: "Henry DJ",
      isDj: true,
      utmSource: "instagram",
      utmMedium: "social",
      utmCampaign: "launch-2024",
    },
    {
      email: "waitlist-dj-2@test.com",
      name: "Irene DJ",
      isDj: true,
      utmSource: "twitter",
      utmMedium: "social",
      utmCampaign: "founding-program",
    },
    {
      email: "waitlist-fan-1@test.com",
      name: "Jack Fan",
      isDj: false,
      utmSource: "google",
      utmMedium: "search",
      utmCampaign: "dj-discovery",
    },
    {
      email: "waitlist-fan-2@test.com",
      name: "Karen Fan",
      isDj: false,
      utmSource: "facebook",
      utmMedium: "social",
      utmCampaign: "launch-2024",
    },
    {
      email: "waitlist-dj-3@test.com",
      name: "Leo DJ",
      isDj: true,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    },
  ];

  for (const entry of waitlistEntries) {
    const existing = await prisma.waitlistEntry.findFirst({
      where: { email: entry.email },
    });

    if (!existing) {
      await prisma.waitlistEntry.create({
        data: entry,
      });
      console.log(`  ✅ Created waitlist entry: ${entry.email}`);
    } else {
      console.log(`  ⏭️  Waitlist entry exists: ${entry.email}`);
    }
  }

  // Create admin action logs
  console.log("\n📝 Creating admin action logs...");
  const actionLogs = [
    {
      action: "SUSPEND_FOUNDING_MEMBER",
      targetType: "FoundingMember",
      targetId: "3",
      metadata: { reason: "Account review required" },
    },
    {
      action: "REVOKE_FOUNDING_MEMBER",
      targetType: "FoundingMember",
      targetId: "5",
      metadata: { reason: "Terms of service violation" },
    },
    {
      action: "UPDATE_FOUNDING_REWARDS",
      targetType: "FoundingMember",
      targetId: "1",
      metadata: { priorityBoost: 2, homepageFeatured: true },
    },
    {
      action: "ACTIVATE_FOUNDING_MEMBER",
      targetType: "FoundingMember",
      targetId: "4",
      metadata: null,
    },
  ];

  for (const log of actionLogs) {
    const existing = await prisma.adminActionLog.findFirst({
      where: {
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
      },
    });

    if (!existing) {
      const createData: any = {
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        adminId: adminUser.id,
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ),
      };
      if (log.metadata !== null) {
        createData.metadata = log.metadata;
      }
      await prisma.adminActionLog.create({
        data: createData,
      });
      console.log(`  ✅ Created action log: ${log.action}`);
    } else {
      console.log(`  ⏭️  Action log exists: ${log.action}`);
    }
  }

  console.log("\n✅ Phase 7 test data seeded successfully!\n");
  console.log("Test data created:");
  console.log("  Founding Members:");
  console.log("    - DJ Alpha (ACTIVE, #1, launched)");
  console.log("    - DJ Beta (ACTIVE, #2, launched)");
  console.log("    - DJ Gamma (SUSPENDED, #3, launched)");
  console.log("    - DJ Premium (PENDING_ONBOARDING, no number)");
  console.log("    - DJ Free (REVOKED, #4, with reason)");
  console.log("  Invitations:");
  console.log("    - new-dj-1@test.com (PENDING)");
  console.log("    - new-dj-2@test.com (ACCEPTED)");
  console.log("    - new-dj-3@test.com (EXPIRED)");
  console.log("    - new-dj-4@test.com (REVOKED)");
  console.log("  Waitlist:");
  console.log("    - 3 DJs with UTM tracking");
  console.log("    - 2 non-DJs with UTM tracking");
  console.log("  Admin Action Logs:");
  console.log("    - Suspend, Revoke, Update Rewards, Activate actions\n");
  console.log("Next steps:");
  console.log(
    "  1. Navigate to /admin/founding/members to test member management",
  );
  console.log(
    "  2. Navigate to /admin/founding/invitations to test invitation actions",
  );
  console.log(
    "  3. Navigate to /admin/founding/waitlist to test waitlist export",
  );
  console.log(
    "  4. Navigate to /admin/founding/analytics to view funnel metrics",
  );
  console.log("  5. Test bulk actions on /admin/founding/applications\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
