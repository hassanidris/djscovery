/**
 * Check existing EventReview and DjRating data before migration.
 * Run with: npx tsx scripts/check-event-review-data.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

async function main() {
  const { default: prisma } = await import("../src/lib/client");

  const [
    eventReviewCount,
    djRatingCount,
    directDjRatingCount,
    eventDjRatingCount,
  ] = await Promise.all([
    prisma.eventReview.count(),
    prisma.djRating.count(),
    prisma.djRating.count({ where: { eventId: null } }),
    prisma.djRating.count({ where: { eventId: { not: null } } }),
  ]);

  console.log("=== Current Data State ===");
  console.log(`EventReview records:        ${eventReviewCount}`);
  console.log(`DjRating records (total):   ${djRatingCount}`);
  console.log(`  - Direct (eventId=null):  ${directDjRatingCount}`);
  console.log(`  - Event-anchored:         ${eventDjRatingCount}`);

  // Check for conflicts: users who have both a direct DjRating AND an EventReview for the same DJ
  const directRatings = await prisma.djRating.findMany({
    where: { eventId: null },
    select: { userId: true, djProfileId: true },
  });

  const eventReviews = await prisma.eventReview.findMany({
    select: { userId: true, djProfileId: true, eventId: true },
  });

  const directKeySet = new Set(
    directRatings.map((r) => `${r.userId}:${r.djProfileId}`),
  );

  const conflicts = eventReviews.filter((er) =>
    directKeySet.has(`${er.userId}:${er.djProfileId}`),
  );

  console.log(`\n=== Conflict Analysis ===`);
  console.log(
    `Potential conflicts (user has both direct + event review for same DJ): ${conflicts.length}`,
  );

  if (conflicts.length > 0) {
    console.log("\nSample conflicts:");
    conflicts.slice(0, 5).forEach((c) => {
      console.log(
        `  userId=${c.userId}, djProfileId=${c.djProfileId}, eventId=${c.eventId}`,
      );
    });
  }

  // Check EventReview reviewType distribution
  const attendeeReviews = await prisma.eventReview.count({
    where: { reviewType: "ATTENDEE" },
  });
  const gigOwnerReviews = await prisma.eventReview.count({
    where: { reviewType: "GIG_OWNER" },
  });
  const nullTypeReviews = await prisma.eventReview.count({
    where: { reviewType: null },
  });

  console.log(`\n=== EventReview reviewType Distribution ===`);
  console.log(`ATTENDEE:   ${attendeeReviews}`);
  console.log(`GIG_OWNER:  ${gigOwnerReviews}`);
  console.log(`NULL:       ${nullTypeReviews}`);

  // Sample EventReview records
  const sampleReviews = await prisma.eventReview.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      eventId: true,
      djProfileId: true,
      rating: true,
      reviewType: true,
      createdAt: true,
    },
  });

  console.log(`\n=== Sample EventReview Records ===`);
  sampleReviews.forEach((r) => {
    console.log(
      `  id=${r.id}, userId=${r.userId.slice(0, 8)}..., eventId=${r.eventId}, djProfileId=${r.djProfileId}, rating=${r.rating}, reviewType=${r.reviewType}`,
    );
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
