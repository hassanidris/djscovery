import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

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
    if (inheritedEnvKeys.has(key)) continue; // keep explicitly provided env vars
    process.env[key] = val; // allow .env.local to override .env
  }
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createAdminClient } from "../src/lib/supabase/admin";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TEST_USERS = {
  PREMIUM_DJ: {
    email:
      process.env.E2E_TEST_PREMIUM_DJ_EMAIL || "test-premium-dj@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
    role: "DJ",
    plan: "PREMIUM",
  },
  FREE_DJ: {
    email: process.env.E2E_TEST_FREE_DJ_EMAIL || "test-free-dj@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
    role: "DJ",
    plan: "FREE",
  },
  ORGANIZER: {
    email: process.env.E2E_TEST_ORGANIZER_EMAIL || "test-organizer@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
    role: "ORGANIZER",
  },
  FAN: {
    email: process.env.E2E_TEST_FAN_EMAIL || "test-fan@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
    role: "FAN",
  },
  ADMIN: {
    email: process.env.E2E_TEST_ADMIN_EMAIL || "test-admin@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
    role: "ADMIN",
  },
} as const;

async function createTestUser(
  email: string,
  password: string,
  role: "DJ" | "ORGANIZER" | "FAN" | "ADMIN",
  plan?: "FREE" | "PREMIUM",
  stageName?: string,
  slug?: string,
) {
  console.log(
    `Creating test user: ${email} (${role}${plan ? ` - ${plan}` : ""})`,
  );

  const admin = createAdminClient();

  // Check if user already exists
  const {
    data: { users },
  } = await admin.auth.admin.listUsers();
  const existingUser = users.find((u) => u.email === email);

  let userId: string;

  if (existingUser) {
    console.log(`  User already exists, resetting password`);
    userId = existingUser.id;
    // Ensure the password matches what the E2E tests expect, in case the
    // user was previously created with a different password.
    const { error: pwError } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (pwError) {
      throw new Error(`Failed to reset password: ${pwError.message}`);
    }
  } else {
    // Create Supabase user
    const { data: userData, error: userError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for tests
        user_metadata: { role },
      });

    if (userError || !userData.user) {
      throw new Error(`Failed to create test user: ${userError?.message}`);
    }

    userId = userData.user.id;
    console.log(`  Created Supabase user: ${userId}`);
  }

  // Create/update database records
  await prisma.$transaction(async (tx) => {
    // Create User record
    await tx.user.upsert({
      where: { id: userId },
      update: { onboardingComplete: true },
      create: {
        id: userId,
        email,
        username: email.split("@")[0],
        onboardingComplete: true,
      },
    });

    // Create role
    await tx.userRole.upsert({
      where: { userId_role: { userId, role } },
      update: {},
      create: { userId, role },
    });

    // Create role-specific profile
    if (role === "DJ") {
      // DjProfile requires a country/city; grab any existing one for test data.
      const anyCity = await tx.city.findFirst({
        select: { id: true, countryId: true },
      });
      if (!anyCity) {
        throw new Error(
          "No City records found. Seed geography data (Country/City) before seeding test users.",
        );
      }

      const djSlug = slug || `test-dj-${userId.slice(0, 6)}`;
      await tx.djProfile.upsert({
        where: { userId },
        update: {
          plan: plan || "FREE",
          ...(stageName ? { stageName } : {}),
          slug: djSlug,
        },
        create: {
          userId,
          stageName: stageName || `Test DJ ${userId.slice(0, 6)}`,
          slug: djSlug,
          plan: plan || "FREE",
          bio: "Test DJ profile for E2E tests",
          countryId: anyCity.countryId,
          cityId: anyCity.id,
          status: "APPROVED",
        },
      });
    } else if (role === "ORGANIZER") {
      const anyCity = await tx.city.findFirst({
        select: { id: true, countryId: true },
      });
      if (!anyCity) {
        throw new Error(
          "No City records found. Seed geography data (Country/City) before seeding test users.",
        );
      }

      await tx.organizerProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          displayName: "Test Organizer",
          slug: `test-organizer-${userId.slice(0, 6)}`,
          countryId: anyCity.countryId,
          cityId: anyCity.id,
        },
      });
    } else if (role === "FAN") {
      await tx.fanProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          name: "Test Fan",
        },
      });
    }
  });

  console.log(`  Database records created/updated`);
}

async function main() {
  // Environment guard: only allow seeding in local, test, or staging environments
  const nodeEnv = process.env.NODE_ENV;
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const databaseUrl = process.env.DATABASE_URL;

  const isLocal = nodeEnv === "development" || nodeEnv === "test";
  const isStaging =
    appEnv === "staging" ||
    databaseUrl?.includes("jarmybsjvztwrmsdcnje.supabase.co");
  const isTest =
    databaseUrl?.includes("test") || databaseUrl?.includes("localhost");

  if (!isLocal && !isStaging && !isTest) {
    console.error(
      "❌ Aborting: Test user seeding is only permitted in local, test, or staging environments.",
    );
    console.error(`   NODE_ENV: ${nodeEnv}`);
    console.error(`   NEXT_PUBLIC_APP_ENV: ${appEnv}`);
    console.error(`   DATABASE_URL: ${databaseUrl?.substring(0, 50)}...`);
    process.exit(1);
  }

  console.log("Seeding test users for E2E tests...\n");

  try {
    await createTestUser(
      TEST_USERS.PREMIUM_DJ.email,
      TEST_USERS.PREMIUM_DJ.password,
      TEST_USERS.PREMIUM_DJ.role,
      TEST_USERS.PREMIUM_DJ.plan,
      "Test Premium DJ",
      "test-premium-dj",
    );

    await createTestUser(
      TEST_USERS.FREE_DJ.email,
      TEST_USERS.FREE_DJ.password,
      TEST_USERS.FREE_DJ.role,
      TEST_USERS.FREE_DJ.plan,
      "Test Free DJ",
      "test-free-dj",
    );

    await createTestUser(
      TEST_USERS.ORGANIZER.email,
      TEST_USERS.ORGANIZER.password,
      TEST_USERS.ORGANIZER.role,
    );

    await createTestUser(
      TEST_USERS.FAN.email,
      TEST_USERS.FAN.password,
      TEST_USERS.FAN.role,
    );

    await createTestUser(
      TEST_USERS.ADMIN.email,
      TEST_USERS.ADMIN.password,
      TEST_USERS.ADMIN.role,
    );

    console.log("\n✅ Test users seeded successfully!");
  } catch (error) {
    console.error("\n❌ Error seeding test users:", error);
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
