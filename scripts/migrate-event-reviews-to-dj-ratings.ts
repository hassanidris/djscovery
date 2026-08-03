/**
 * Migration Script: Migrate EventReview records to DjRating
 *
 * Copies existing EventReview records into the unified DjRating model with
 * proper reviewType mapping:
 *   - EventReview.reviewType "ATTENDEE"    -> DjRating.reviewType "EVENT_ATTENDEE"
 *   - EventReview.reviewType "GIG_OWNER"   -> DjRating.reviewType "EVENT_ORGANIZER"
 *   - EventReview.reviewType null          -> DjRating.reviewType "EVENT_ATTENDEE" (default)
 *
 * Conflict handling:
 *   - If a user already has a DjRating for the same (userId, djProfileId, eventId),
 *     the EventReview is skipped (already migrated).
 *   - If a user has a DIRECT DjRating for the same (userId, djProfileId) but no
 *     event-anchored one, the EventReview is still migrated (they are distinct
 *     records — one direct, one event-anchored).
 *
 * The script is idempotent: safe to run multiple times.
 *
 * Usage:
 *   npx tsx scripts/migrate-event-reviews-to-dj-ratings.ts          # dry-run (default)
 *   npx tsx scripts/migrate-event-reviews-to-dj-ratings.ts --apply   # execute migration
 *
 * Rollback:
 *   npx tsx scripts/rollback-dj-rating-event-migration.ts --apply
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

const IS_APPLY = process.argv.includes("--apply");

async function main() {
  const { default: prisma } = await import("../src/lib/client");

  console.log(`\n=== EventReview -> DjRating Migration ===`);
  console.log(`Mode: ${IS_APPLY ? "APPLY (write)" : "DRY-RUN (read-only)"}\n`);

  // 1. Fetch all EventReview records
  const eventReviews = await prisma.eventReview.findMany({
    select: {
      id: true,
      userId: true,
      eventId: true,
      djProfileId: true,
      rating: true,
      review: true,
      reviewType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log(`Found ${eventReviews.length} EventReview records to migrate.`);

  if (eventReviews.length === 0) {
    console.log("Nothing to migrate. Exiting.");
    await prisma.$disconnect();
    return;
  }

  // 2. Map reviewType: EventReview -> DjRating
  const mapReviewType = (
    rt: string | null,
  ): "EVENT_ATTENDEE" | "EVENT_ORGANIZER" => {
    if (rt === "GIG_OWNER") return "EVENT_ORGANIZER";
    // "ATTENDEE" or null -> EVENT_ATTENDEE (default)
    return "EVENT_ATTENDEE";
  };

  // 3. Check for already-migrated records (idempotency)
  const existingEventDjRatings = await prisma.djRating.findMany({
    where: { eventId: { not: null } },
    select: { userId: true, djProfileId: true, eventId: true },
  });

  const existingKeySet = new Set(
    existingEventDjRatings.map(
      (r) => `${r.userId}:${r.djProfileId}:${r.eventId}`,
    ),
  );

  // 4. Filter out already-migrated records
  const toMigrate = eventReviews.filter(
    (er) =>
      !existingKeySet.has(`${er.userId}:${er.djProfileId}:${er.eventId}`),
  );

  const alreadyMigrated = eventReviews.length - toMigrate.length;

  console.log(`Already migrated (skipped): ${alreadyMigrated}`);
  console.log(`To migrate:                 ${toMigrate.length}\n`);

  if (toMigrate.length === 0) {
    console.log("All records already migrated. Nothing to do.");
    await prisma.$disconnect();
    return;
  }

  // 5. Show preview of what will be migrated
  console.log("=== Migration Preview ===");
  const typeBreakdown = toMigrate.reduce(
    (acc, er) => {
      const mapped = mapReviewType(er.reviewType);
      acc[mapped] = (acc[mapped] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log("reviewType mapping:", typeBreakdown);

  // Show first 5 records as sample
  console.log("\nSample records (first 5):");
  toMigrate.slice(0, 5).forEach((er) => {
    console.log(
      `  EventReview id=${er.id} -> DjRating (userId=${er.userId.slice(0, 8)}..., eventId=${er.eventId}, djProfileId=${er.djProfileId}, rating=${er.rating}, reviewType=${mapReviewType(er.reviewType)})`,
    );
  });

  if (!IS_APPLY) {
    console.log("\n[DRY-RUN] No changes made. Run with --apply to execute.");
    await prisma.$disconnect();
    return;
  }

  // 6. Execute migration in batches
  console.log("\n=== Executing Migration ===");
  const BATCH_SIZE = 50;
  let migrated = 0;
  let errors = 0;

  for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
    const batch = toMigrate.slice(i, i + BATCH_SIZE);

    try {
      await prisma.$transaction(
        batch.map((er) =>
          prisma.djRating.create({
            data: {
              userId: er.userId,
              djProfileId: er.djProfileId,
              eventId: er.eventId,
              rating: er.rating,
              review: er.review,
              reviewType: mapReviewType(er.reviewType),
              createdAt: er.createdAt,
              updatedAt: er.updatedAt,
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

  // 7. Verify
  const newEventDjRatingCount = await prisma.djRating.count({
    where: { eventId: { not: null } },
  });
  const remainingEventReviews = await prisma.eventReview.count();

  console.log(`\n=== Verification ===`);
  console.log(`DjRating (event-anchored): ${newEventDjRatingCount}`);
  console.log(`EventReview (remaining):   ${remainingEventReviews}`);
  console.log(
    `\nNote: EventReview table is NOT dropped by this script. It remains as a backup until you confirm the migration is correct.`,
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
