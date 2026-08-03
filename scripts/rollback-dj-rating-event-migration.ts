/**
 * Rollback Script: Remove event-anchored DjRating records created by migration
 *
 * This script reverses the migration performed by migrate-event-reviews-to-dj-ratings.ts.
 * It deletes all DjRating records where eventId IS NOT NULL (the event-anchored
 * reviews that were migrated from EventReview). The original EventReview records
 * remain untouched in the EventReview table.
 *
 * IMPORTANT: This only removes event-anchored DjRating records. Direct DjRating
 * records (eventId IS NULL) are NOT affected.
 *
 * Usage:
 *   npx tsx scripts/rollback-dj-rating-event-migration.ts          # dry-run (default)
 *   npx tsx scripts/rollback-dj-rating-event-migration.ts --apply   # execute rollback
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

const IS_APPLY = process.argv.includes("--apply");

async function main() {
  const { default: prisma } = await import("../src/lib/client");

  console.log(`\n=== DjRating Event Migration Rollback ===`);
  console.log(`Mode: ${IS_APPLY ? "APPLY (write)" : "DRY-RUN (read-only)"}\n`);

  // 1. Count event-anchored DjRating records
  const eventDjRatingCount = await prisma.djRating.count({
    where: { eventId: { not: null } },
  });

  const directDjRatingCount = await prisma.djRating.count({
    where: { eventId: null },
  });

  console.log(`Current DjRating state:`);
  console.log(`  - Event-anchored (will be deleted): ${eventDjRatingCount}`);
  console.log(`  - Direct (will be preserved):       ${directDjRatingCount}`);

  if (eventDjRatingCount === 0) {
    console.log("\nNo event-anchored DjRating records to roll back. Exiting.");
    await prisma.$disconnect();
    return;
  }

  // 2. Show breakdown by reviewType
  const attendeeCount = await prisma.djRating.count({
    where: { eventId: { not: null }, reviewType: "EVENT_ATTENDEE" },
  });
  const organizerCount = await prisma.djRating.count({
    where: { eventId: { not: null }, reviewType: "EVENT_ORGANIZER" },
  });

  console.log(`\nEvent-anchored breakdown:`);
  console.log(`  - EVENT_ATTENDEE:   ${attendeeCount}`);
  console.log(`  - EVENT_ORGANIZER:  ${organizerCount}`);

  // 3. Verify EventReview table still has the original data
  const eventReviewCount = await prisma.eventReview.count();
  console.log(`\nEventReview table (original data): ${eventReviewCount} records`);

  if (eventReviewCount === 0 && eventDjRatingCount > 0) {
    console.log(
      `\n⚠️  WARNING: EventReview table is empty but ${eventDjRatingCount} event-anchored DjRating records exist.`,
    );
    console.log(
      `   Rolling back will DELETE these records with no backup. Proceed with caution.`,
    );
  }

  if (!IS_APPLY) {
    console.log(
      `\n[DRY-RUN] Would delete ${eventDjRatingCount} event-anchored DjRating records.`,
    );
    console.log(`Run with --apply to execute.`);
    await prisma.$disconnect();
    return;
  }

  // 4. Execute rollback — delete all event-anchored DjRating records
  console.log(`\n=== Executing Rollback ===`);
  const result = await prisma.djRating.deleteMany({
    where: { eventId: { not: null } },
  });

  console.log(`Deleted ${result.count} event-anchored DjRating records.`);

  // 5. Verify
  const remainingEventDjRatings = await prisma.djRating.count({
    where: { eventId: { not: null } },
  });
  const remainingDirectDjRatings = await prisma.djRating.count({
    where: { eventId: null },
  });

  console.log(`\n=== Verification ===`);
  console.log(`DjRating (event-anchored): ${remainingEventDjRatings} (should be 0)`);
  console.log(`DjRating (direct):         ${remainingDirectDjRatings} (preserved)`);
  console.log(`EventReview (untouched):   ${eventReviewCount}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Rollback failed:", e);
  process.exit(1);
});
