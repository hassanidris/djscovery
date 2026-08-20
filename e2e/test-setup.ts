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
  ADMIN: {
    email: process.env.E2E_TEST_ADMIN_EMAIL || "test-admin@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
  },
} as const;

let prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prisma) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. The Playwright test runner does not auto-load .env files; " +
          "ensure playwright.config.ts loads them (e.g. via dotenv) before tests run.",
      );
    }
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

/**
 * Helper function to create test gig for hiring tests
 */
export async function createTestGig(organizerEmail: string) {
  const db = getPrisma();
  const organizer = await db.organizerProfile.findFirst({
    where: { user: { email: organizerEmail } },
    select: { id: true },
  });
  if (!organizer) throw new Error("Organizer not found");

  const country = await db.country.findFirst({ select: { id: true } });
  if (!country) throw new Error("No country found");

  const gig = await db.gig.create({
    data: {
      organizerProfileId: organizer.id,
      title: "Test Gig for Hiring",
      slug: `test-gig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      gigType: "CLUB",
      description: "Test gig description",
      status: "PUBLISHED",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      countryId: country.id,
      budgetType: "NEGOTIABLE",
      requiredGenres: ["House", "Techno"],
    },
  });

  return gig;
}

/**
 * Helper function to create test DJ application
 */
export async function createTestApplication(gigId: number, djEmail: string) {
  const db = getPrisma();
  const dj = await db.djProfile.findFirst({
    where: { user: { email: djEmail } },
    select: { id: true },
  });
  if (!dj) throw new Error("DJ not found");

  const application = await db.gigApplication.create({
    data: {
      gigId,
      djProfileId: dj.id,
      status: "APPLIED",
      message: "I'm interested in this gig",
    },
  });

  return application;
}

/**
 * Helper function to reset application status to APPLIED
 */
export async function resetApplicationStatus(
  gigId: number,
  djEmail: string,
): Promise<void> {
  const db = getPrisma();
  const dj = await db.djProfile.findFirst({
    where: { user: { email: djEmail } },
    select: { id: true },
  });
  if (!dj) throw new Error("DJ not found");

  await db.gigApplication.updateMany({
    where: {
      gigId,
      djProfileId: dj.id,
    },
    data: {
      status: "APPLIED",
    },
  });
}

/**
 * Helper function to create test hire
 */
export async function createTestHire(
  applicationId: number,
  agreedRate?: number,
) {
  const db = getPrisma();
  const hire = await db.hire.create({
    data: {
      applicationId,
      agreedRate: agreedRate ? agreedRate.toString() : null,
      status: "ACTIVE",
    },
  });

  return hire;
}

/**
 * Cleanup function to remove test hiring data.
 *
 * By default, only removes test data older than 24 hours so you can
 * manually inspect the flow after tests run. Pass `force: true` to
 * remove all test data immediately (e.g. for CI).
 */
export async function cleanupHiringTestData(
  organizerEmail: string,
  djEmail: string,
  options: { force?: boolean } = {},
) {
  const db = getPrisma();

  const organizer = await db.organizerProfile.findFirst({
    where: { user: { email: organizerEmail } },
    select: { id: true },
  });

  const dj = await db.djProfile.findFirst({
    where: { user: { email: djEmail } },
    select: { id: true },
  });

  if (!organizer || !dj) return;

  // When force=true, delete everything immediately.
  // Otherwise, only delete test gigs older than 24 hours so the
  // data stays around for manual inspection after a test run.
  const cutoff = options.force
    ? undefined
    : new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find test gigs to clean up (old ones, or all if force)
  const gigsToDelete = await db.gig.findMany({
    where: {
      organizerProfileId: organizer.id,
      title: { startsWith: "Test Gig" },
      ...(cutoff ? { createdAt: { lt: cutoff } } : {}),
    },
    select: { id: true },
  });
  const gigIds = gigsToDelete.map((g) => g.id);

  if (gigIds.length === 0) return;

  // Delete hires for applications on those gigs
  await db.hire.deleteMany({
    where: {
      application: {
        djProfileId: dj.id,
        gigId: { in: gigIds },
      },
    },
  });

  // Delete applications on those gigs
  await db.gigApplication.deleteMany({
    where: {
      djProfileId: dj.id,
      gigId: { in: gigIds },
    },
  });

  // Delete the test gigs
  await db.gig.deleteMany({
    where: { id: { in: gigIds } },
  });
}
