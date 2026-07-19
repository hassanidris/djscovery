import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Test user credentials for E2E tests
 *
 * These users should be pre-created in the database via a seed script or manual setup.
 * For local development, you can create them via the sign-up flow.
 */
export const TEST_USERS = {
  PREMIUM_DJ: {
    email:
      process.env.E2E_TEST_PREMIUM_DJ_EMAIL || "test-premium-dj@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
  },
  FREE_DJ: {
    email: process.env.E2E_TEST_FREE_DJ_EMAIL || "test-free-dj@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
  },
  ORGANIZER: {
    email: process.env.E2E_TEST_ORGANIZER_EMAIL || "test-organizer@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
  },
  FAN: {
    email: process.env.E2E_TEST_FAN_EMAIL || "test-fan@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
  },
} as const;

let prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prisma) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

/**
 * Deletes all career highlights for a DJ (by email). Use this in beforeAll/
 * beforeEach hooks to reset shared test-user state between spec runs, since
 * the DB persists across test invocations.
 */
export async function resetDjHighlights(email: string): Promise<void> {
  const db = getPrisma();
  const profile = await db.djProfile.findFirst({
    where: { user: { email } },
    select: { id: true },
  });
  if (!profile) return;
  await db.djCareerHighlight.deleteMany({
    where: { djProfileId: profile.id },
  });
}

export async function disconnectTestPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
