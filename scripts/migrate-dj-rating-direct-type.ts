/**
 * Migration Script: Set reviewType to DIRECT for existing DjRating records
 *
 * This script migrates existing DjRating records to the new schema by:
 *   - Setting reviewType to "DIRECT" for all records where reviewType is NULL
 *   - Ensuring eventId is NULL for all existing records (direct reviews)
 *
 * This is needed because the schema was updated to support both direct reviews
 * (eventId = null, reviewType = "DIRECT") and event-anchored reviews
 * (eventId != null, reviewType = "EVENT_ATTENDEE" or "EVENT_ORGANIZER").
 *
 * The script is idempotent: safe to run multiple times.
 *
 * Usage:
 *   npx tsx scripts/migrate-dj-rating-direct-type.ts          # dry-run (default)
 *   npx tsx scripts/migrate-dj-rating-direct-type.ts --apply   # execute migration
 *
 * Rollback:
 *   npx tsx scripts/rollback-dj-rating-direct-type.ts --apply
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

const IS_APPLY = process.argv.includes("--apply");

async function main() {
  const { default: prisma } = await import("../src/lib/client");

  console.log(`\n=== DjRating DIRECT Type Migration ===`);
  console.log(`Mode: ${IS_APPLY ? "APPLY (write)" : "DRY-RUN (read-only)"}\n`);

  // 1. Count existing DjRating records
  const totalCount = await prisma.djRating.count();
  const withReviewType = await prisma.djRating.count({
    where: { reviewType: { not: null } },
  });
  const withoutReviewType = await prisma.djRating.count({
    where: { reviewType: null },
  });

  const withEventId = await prisma.djRating.count({
    where: { eventId: { not: null } },
  });
  const withoutEventId = await prisma.djRating.count({
    where: { eventId: null },
  });

  console.log(`Current DjRating state:`);
  console.log(`  - Total records:           ${totalCount}`);
  console.log(`  - With reviewType set:     ${withReviewType}`);
  console.log(`  - Without reviewType:      ${withoutReviewType}`);
  console.log(`  - With eventId:            ${withEventId}`);
  console.log(`  - Without eventId:         ${withoutEventId}`);

  if (withoutReviewType === 0) {
    console.log("\nAll records already have reviewType set. Nothing to migrate.");
    await prisma.$disconnect();
    return;
  }

  // 2. Check for records that have eventId but no reviewType (edge case)
  const withEventIdNoReviewType = await prisma.djRating.count({
    where: { eventId: { not: null }, reviewType: null },
  });

  if (withEventIdNoReviewType > 0) {
    console.log(
      `\n⚠️  WARNING: ${withEventIdNoReviewType} records have eventId but no reviewType.`,
    );
    console.log(
      `   These records may be event-anchored reviews that were created before the schema update.`,
    );
    console.log(
      `   This script will set them to reviewType="DIRECT" which may be incorrect.`,
    );
    console.log(
      `   Please review these records manually before proceeding.`,
    );

    if (!IS_APPLY) {
      console.log("\n[DRY-RUN] No changes made. Review the records above.");
      await prisma.$disconnect();
      return;
    }
  }

  // 3. Fetch records that need migration
  const toMigrate = await prisma.djRating.findMany({
    where: { reviewType: null },
    select: {
      id: true,
      userId: true,
      djProfileId: true,
      eventId: true,
      rating: true,
      review: true,
    },
  });

  console.log(`\nRecords to migrate: ${toMigrate.length}`);

  if (!IS_APPLY) {
    console.log("\n=== Migration Preview ===");
    console.log("Sample records (first 5):");
    toMigrate.slice(0, 5).forEach((r) => {
      console.log(
        `  DjRating id=${r.id} (userId=${r.userId.slice(0, 8)}..., djProfileId=${r.djProfileId}, eventId=${r.eventId}) -> reviewType=DIRECT`,
      );
    });

    console.log("\n[DRY-RUN] No changes made. Run with --apply to execute.");
    await prisma.$disconnect();
    return;
  }

  // 4. Execute migration in batches
  console.log("\n=== Executing Migration ===");
  const BATCH_SIZE = 50;
  let migrated = 0;
  let errors = 0;

  for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
    const batch = toMigrate.slice(i, i + BATCH_SIZE);

    try {
      await prisma.$transaction(
        batch.map((r) =>
          prisma.djRating.update({
            where: { id: r.id },
            data: {
              reviewType: "DIRECT",
              eventId: null, // Ensure eventId is null for direct reviews
            },
          }),
        ),
      );
      migrated += batch.length;
      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: migrated ${batch.length} records (total: ${migrated})`);
    } catch (err) {
      errors += batch.length;
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: FAILED`, err);
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Successfully migrated: ${migrated}`);
  console.log(`Errors:                ${errors}`);

  // 5. Verify
  const remainingWithoutReviewType = await prisma.djRating.count({
    where: { reviewType: null },
  });
  const directCount = await prisma.djRating.count({
    where: { reviewType: "DIRECT" },
  });

  console.log(`\n=== Verification ===`);
  console.log(`Records without reviewType: ${remainingWithoutReviewType} (should be 0)`);
  console.log(`Records with reviewType=DIRECT: ${directCount}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
