/**
 * Rollback Script: Reset reviewType to NULL for DIRECT DjRating records
 *
 * This script reverses the migration performed by migrate-dj-rating-direct-type.ts.
 * It sets reviewType back to NULL for all DjRating records where reviewType = "DIRECT".
 * This is useful if you need to revert to the previous schema before the reviewType field
 * was added.
 *
 * IMPORTANT: This only affects records with reviewType = "DIRECT". Event-anchored
 * reviews (reviewType = "EVENT_ATTENDEE" or "EVENT_ORGANIZER") are NOT affected.
 *
 * Usage:
 *   npx tsx scripts/rollback-dj-rating-direct-type.ts          # dry-run (default)
 *   npx tsx scripts/rollback-dj-rating-direct-type.ts --apply   # execute rollback
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

const IS_APPLY = process.argv.includes("--apply");

async function main() {
  const { default: prisma } = await import("../src/lib/client");

  console.log(`\n=== DjRating DIRECT Type Rollback ===`);
  console.log(`Mode: ${IS_APPLY ? "APPLY (write)" : "DRY-RUN (read-only)"}\n`);

  // 1. Count records by reviewType
  const totalCount = await prisma.djRating.count();
  const directCount = await prisma.djRating.count({
    where: { reviewType: "DIRECT" },
  });
  const attendeeCount = await prisma.djRating.count({
    where: { reviewType: "EVENT_ATTENDEE" },
  });
  const organizerCount = await prisma.djRating.count({
    where: { reviewType: "EVENT_ORGANIZER" },
  });
  const nullCount = await prisma.djRating.count({
    where: { reviewType: null },
  });

  console.log(`Current DjRating state:`);
  console.log(`  - Total records:           ${totalCount}`);
  console.log(`  - reviewType=DIRECT:       ${directCount} (will be reset to NULL)`);
  console.log(`  - reviewType=EVENT_ATTENDEE:  ${attendeeCount} (preserved)`);
  console.log(`  - reviewType=EVENT_ORGANIZER: ${organizerCount} (preserved)`);
  console.log(`  - reviewType=NULL:         ${nullCount}`);

  if (directCount === 0) {
    console.log("\nNo DIRECT records to roll back. Exiting.");
    await prisma.$disconnect();
    return;
  }

  // 2. Show breakdown
  console.log(`\nRecords that will be affected: ${directCount}`);

  if (!IS_APPLY) {
    console.log("\n[DRY-RUN] Would reset reviewType to NULL for DIRECT records.");
    console.log(`Run with --apply to execute.`);
    await prisma.$disconnect();
    return;
  }

  // 3. Execute rollback — reset reviewType to NULL for DIRECT records
  console.log(`\n=== Executing Rollback ===`);
  const result = await prisma.djRating.updateMany({
    where: { reviewType: "DIRECT" },
    data: { reviewType: null },
  });

  console.log(`Reset reviewType to NULL for ${result.count} DIRECT records.`);

  // 4. Verify
  const remainingDirect = await prisma.djRating.count({
    where: { reviewType: "DIRECT" },
  });
  const newNullCount = await prisma.djRating.count({
    where: { reviewType: null },
  });

  console.log(`\n=== Verification ===`);
  console.log(`Records with reviewType=DIRECT: ${remainingDirect} (should be 0)`);
  console.log(`Records with reviewType=NULL:   ${newNullCount}`);
  console.log(`Records with reviewType=EVENT_ATTENDEE:  ${attendeeCount} (preserved)`);
  console.log(`Records with reviewType=EVENT_ORGANIZER: ${organizerCount} (preserved)`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Rollback failed:", e);
  process.exit(1);
});
