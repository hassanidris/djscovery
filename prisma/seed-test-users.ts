import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TEST_USERS = {
  ADMIN: {
    email: process.env.E2E_TEST_ADMIN_EMAIL || "test-admin@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
    name: "Test Admin",
  },
  FAN: {
    email: process.env.E2E_TEST_FAN_EMAIL || "test-fan@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
    name: "Test Fan",
  },
};

/**
 * E2E sign-in flows authenticate through the real Supabase Auth email/password
 * form, so seeding must create actual Supabase Auth accounts (not just Prisma
 * `User` rows). We use the Supabase Admin API (service role key) to create or
 * reuse the auth user, then upsert the matching `User`/`UserRole` rows using
 * the auth user's id — mirroring what `src/app/api/webhooks/supabase/route.ts`
 * does for real sign-ups.
 */
async function ensureSupabaseAuthUser(
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
  password: string,
): Promise<string> {
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (!createError && created.user) {
    return created.user.id;
  }

  // User already exists in Supabase Auth — look it up and reset the password
  // so it matches what E2E tests expect, in case it drifted.
  const { data: list, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    throw new Error(
      `Failed to create or find Supabase Auth user for ${email}: ${createError?.message} / ${listError.message}`,
    );
  }

  const existing = list.users.find((u) => u.email === email);
  if (!existing) {
    throw new Error(
      `Failed to create Supabase Auth user for ${email}: ${createError?.message}`,
    );
  }

  await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });

  return existing.id;
}

async function main() {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const forceSeed = process.env.FORCE_SEED === "true";

  const PROD_MARKERS = ["unrqebwfdfumpjgvavbk"];
  const urlLooksProd = PROD_MARKERS.some((m) => databaseUrl.includes(m));
  const envIsProd = appEnv === "production";
  const isProd = envIsProd || urlLooksProd;

  if (isProd && !forceSeed) {
    console.error(`
❌  Seed blocked — production database detected

Reason: ${
      envIsProd
        ? "NEXT_PUBLIC_APP_ENV=production"
        : "DATABASE_URL contains a known production marker"
    }

To seed test users in production intentionally, run:
FORCE_SEED=true npm run seed:test-users
`);
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "❌  NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required " +
        "to create real Supabase Auth accounts for E2E test users.",
    );
    process.exit(1);
  }

  console.log("👤 Seeding test users (Supabase Auth + database records)...");

  console.log(`\n→ Ensuring Supabase Auth user: ${TEST_USERS.ADMIN.email}`);
  const adminAuthId = await ensureSupabaseAuthUser(
    supabaseUrl,
    serviceRoleKey,
    TEST_USERS.ADMIN.email,
    TEST_USERS.ADMIN.password,
  );

  const adminUser = await prisma.user.upsert({
    where: { id: adminAuthId },
    update: {
      email: TEST_USERS.ADMIN.email,
      name: TEST_USERS.ADMIN.name,
    },
    create: {
      id: adminAuthId,
      email: TEST_USERS.ADMIN.email,
      username: `test-admin-${adminAuthId.slice(0, 8)}`,
      name: TEST_USERS.ADMIN.name,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_role: { userId: adminUser.id, role: "ADMIN" } },
    update: {},
    create: {
      userId: adminUser.id,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin user ready: ${adminUser.email} (id: ${adminUser.id})`);

  console.log(`\n→ Ensuring Supabase Auth user: ${TEST_USERS.FAN.email}`);
  const fanAuthId = await ensureSupabaseAuthUser(
    supabaseUrl,
    serviceRoleKey,
    TEST_USERS.FAN.email,
    TEST_USERS.FAN.password,
  );

  const fanUser = await prisma.user.upsert({
    where: { id: fanAuthId },
    update: {
      email: TEST_USERS.FAN.email,
      name: TEST_USERS.FAN.name,
    },
    create: {
      id: fanAuthId,
      email: TEST_USERS.FAN.email,
      username: `test-fan-${fanAuthId.slice(0, 8)}`,
      name: TEST_USERS.FAN.name,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_role: { userId: fanUser.id, role: "FAN" } },
    update: {},
    create: {
      userId: fanUser.id,
      role: "FAN",
    },
  });

  console.log(`✅ Fan user ready: ${fanUser.email} (id: ${fanUser.id})`);

  console.log("\n✅ Test users seeded successfully!");
  console.log("\nTest credentials:");
  console.log(
    `  Admin: ${TEST_USERS.ADMIN.email} / ${TEST_USERS.ADMIN.password}`,
  );
  console.log(`  Fan: ${TEST_USERS.FAN.email} / ${TEST_USERS.FAN.password}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
