/**
 * Seed script for creating E2E test users.
 *
 * Creates the following users in Supabase Auth + Prisma:
 *  - test-organizer@example.com  (ORGANIZER role + active OrganizerProfile)
 *  - test-admin@example.com       (ADMIN role)
 *  - test-free-dj@example.com     (DJ role + approved DjProfile)
 *
 * Usage:
 *   npx tsx scripts/seed-test-users.ts
 *
 * Requirements:
 *  - DATABASE_URL env var (loaded from .env.local / .env)
 *  - NEXT_PUBLIC_SUPABASE_URL env var
 *  - SUPABASE_SERVICE_ROLE_KEY env var
 *
 * Idempotent: re-running updates existing users instead of failing.
 */
import { config } from "dotenv";
// Load .env.local first (overrides .env), mirroring Next.js behavior
config({ path: ".env.local" });
config({ path: ".env" });
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || "TestPassword123!";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars",
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL env var");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type TestUserDef = {
  email: string;
  username: string;
  name: string;
  role: "ADMIN" | "ORGANIZER" | "DJ" | "FAN";
  organizerProfile?: { displayName: string; slug: string };
  djProfile?: { stageName: string; slug: string };
  fanProfile?: { name: string };
};

const TEST_USERS: TestUserDef[] = [
  {
    email: "test-organizer@example.com",
    username: "test_organizer",
    name: "Test Organizer",
    role: "ORGANIZER",
    organizerProfile: {
      displayName: "Test Organizer",
      slug: "test-organizer",
    },
  },
  {
    email: "test-admin@example.com",
    username: "test_admin",
    name: "Test Admin",
    role: "ADMIN",
  },
  {
    email: "test-free-dj@example.com",
    username: "test_free_dj",
    name: "Test Free DJ",
    role: "DJ",
    djProfile: {
      stageName: "Test Free DJ",
      slug: "test-free-dj",
    },
  },
  {
    email: "test-fan@example.com",
    username: "test_fan",
    name: "Test Fan",
    role: "FAN",
    fanProfile: {
      name: "Test Fan",
    },
  },
];

async function upsertAuthUser(email: string, password: string) {
  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === email);

  if (found) {
    // Update password and confirm email
    await supabase.auth.admin.updateUserById(found.id, {
      password,
      email_confirm: true,
    });
    console.log(`  ✓ Updated existing auth user: ${email}`);
    return found.id;
  }

  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error)
    throw new Error(`Failed to create auth user ${email}: ${error.message}`);
  console.log(`  ✓ Created auth user: ${email}`);
  return data.user.id;
}

async function upsertPrismaUser(userDef: TestUserDef, authId: string) {
  // Ensure a country exists (pick first or create Sweden)
  let country = await prisma.country.findFirst({
    where: { name: "Sweden" },
    select: { id: true, name: true },
  });
  if (!country) {
    country = await prisma.country.create({
      data: { name: "Sweden", code: "SE" },
    });
    console.log(`  ✓ Created country: Sweden`);
  }

  let city = await prisma.city.findFirst({
    where: { name: "Stockholm", countryId: country.id },
    select: { id: true },
  });
  if (!city) {
    city = await prisma.city.create({
      data: { name: "Stockholm", countryId: country.id },
    });
    console.log(`  ✓ Created city: Stockholm`);
  }

  // Upsert User record
  await prisma.user.upsert({
    where: { id: authId },
    update: {
      email: userDef.email,
      username: userDef.username,
      name: userDef.name,
      status: "ACTIVE",
      onboardingComplete: true,
      countryId: country.id,
    },
    create: {
      id: authId,
      email: userDef.email,
      username: userDef.username,
      name: userDef.name,
      status: "ACTIVE",
      onboardingComplete: true,
      countryId: country.id,
    },
  });
  console.log(`  ✓ Upserted Prisma user: ${userDef.email}`);

  // Upsert UserRole
  await prisma.userRole.upsert({
    where: { userId_role: { userId: authId, role: userDef.role } },
    update: {},
    create: { userId: authId, role: userDef.role },
  });
  console.log(`  ✓ Upserted role: ${userDef.role}`);

  // Create OrganizerProfile if needed
  if (userDef.organizerProfile) {
    await prisma.organizerProfile.upsert({
      where: { userId: authId },
      update: {
        displayName: userDef.organizerProfile.displayName,
        slug: userDef.organizerProfile.slug,
        status: "ACTIVE",
      },
      create: {
        userId: authId,
        displayName: userDef.organizerProfile.displayName,
        slug: userDef.organizerProfile.slug,
        status: "ACTIVE",
        countryId: country.id,
        cityId: city.id,
      },
    });
    console.log(`  ✓ Upserted OrganizerProfile`);
  }

  // Create DjProfile if needed
  if (userDef.djProfile) {
    await prisma.djProfile.upsert({
      where: { userId: authId },
      update: {
        stageName: userDef.djProfile.stageName,
        slug: userDef.djProfile.slug,
        status: "APPROVED",
        countryId: country.id,
        cityId: city.id,
      },
      create: {
        userId: authId,
        stageName: userDef.djProfile.stageName,
        slug: userDef.djProfile.slug,
        status: "APPROVED",
        countryId: country.id,
        cityId: city.id,
      },
    });
    console.log(`  ✓ Upserted DjProfile`);
  }

  // Create FanProfile if needed
  if (userDef.fanProfile) {
    await prisma.fanProfile.upsert({
      where: { userId: authId },
      update: {
        name: userDef.fanProfile.name,
      },
      create: {
        userId: authId,
        name: userDef.fanProfile.name,
      },
    });
    console.log(`  ✓ Upserted FanProfile`);
  }
}

async function main() {
  console.log("Seeding E2E test users...\n");

  for (const userDef of TEST_USERS) {
    console.log(`\n→ Processing ${userDef.email}`);
    try {
      const authId = await upsertAuthUser(userDef.email, TEST_PASSWORD);
      await upsertPrismaUser(userDef, authId);
      console.log(`  ✅ Done: ${userDef.email}`);
    } catch (err) {
      console.error(`  ❌ Failed: ${userDef.email}`, err);
    }
  }

  console.log("\nSeed complete!");
  console.log("\nTest credentials (password configured via E2E_TEST_PASSWORD):");
  for (const u of TEST_USERS) {
    console.log(`  ${u.role.padEnd(10)} → ${u.email}`);
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
