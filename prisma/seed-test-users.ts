import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TEST_USERS = {
  ADMIN: {
    email: process.env.E2E_TEST_ADMIN_EMAIL || "test-admin@example.com",
    name: "Test Admin",
  },
  FAN: {
    email: process.env.E2E_TEST_FAN_EMAIL || "test-fan@example.com",
    name: "Test Fan",
  },
};

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

  console.log("👤 Seeding test users (database records only)...");

  const adminUser = await prisma.user.upsert({
    where: { email: TEST_USERS.ADMIN.email },
    update: {
      name: TEST_USERS.ADMIN.name,
    },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      email: TEST_USERS.ADMIN.email,
      username: "test-admin",
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

  console.log(`✅ Admin user created/updated: ${adminUser.email}`);

  const fanUser = await prisma.user.upsert({
    where: { email: TEST_USERS.FAN.email },
    update: {
      name: TEST_USERS.FAN.name,
    },
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      email: TEST_USERS.FAN.email,
      username: "test-fan",
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

  console.log(`✅ Fan user created/updated: ${fanUser.email}`);

  console.log("\n✅ Test users seeded successfully!");
  console.log("\n⚠️  Note: This project uses Supabase Auth.");
  console.log("   You need to sign up these users via the Supabase auth flow");
  console.log("   to get proper auth sessions for E2E tests.");
  console.log("\nTest email addresses:");
  console.log(`  Admin: ${TEST_USERS.ADMIN.email}`);
  console.log(`  Fan: ${TEST_USERS.FAN.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
