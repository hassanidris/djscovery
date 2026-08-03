/**
 * Seed direct + event-anchored DjRating reviews for the test-premium-dj and
 * test-free-dj profiles, so the review UI (ProfileReviews, EventDjReviews,
 * ReviewModal) can be visually verified end-to-end.
 *
 * Usage: npx tsx scripts/seed-dj-rating-test-data.ts
 *
 * Idempotent-ish: re-running creates additional synthetic reviewer users
 * each time (timestamps keep ids unique), so run once per verification pass.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

const now = Date.now();

async function main() {
  const { default: prisma } = await import("../src/lib/client");

  async function getOrCreateTestLocation() {
    let country = await prisma.country.findFirst({
      where: { name: "Sweden" },
      select: { id: true },
    });
    if (!country) {
      country = await prisma.country.create({
        data: { name: "Sweden", code: "SE" },
      });
    }

    let city = await prisma.city.findFirst({
      where: { name: "Stockholm", countryId: country.id },
      select: { id: true },
    });
    if (!city) {
      city = await prisma.city.create({
        data: { name: "Stockholm", countryId: country.id },
      });
    }

    return { countryId: country.id, cityId: city.id };
  }

  async function createReviewer(label: string, index: number) {
    const id = `test-reviewer-${now}-${index}`;
    const user = await prisma.user.create({
      data: {
        id,
        email: `test-reviewer-${now}-${index}@example.com`,
        username: `test_reviewer_${now}_${index}`,
        name: label,
        status: "ACTIVE",
        onboardingComplete: true,
      },
    });
    await prisma.fanProfile.create({
      data: { userId: user.id, name: label },
    });
    return user;
  }

  async function ensureEventForDj(
    djId: number,
    daysAgo: number,
    titleSuffix: string,
    location: { countryId: number; cityId: number },
  ) {
    return prisma.event.create({
      data: {
        slug: `test-dj-rating-event-${titleSuffix}-${now}`,
        title: `Test DJ Rating Event (${titleSuffix})`,
        eventType: "PUBLIC",
        category: "CLUB_NIGHT",
        startDate: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
        status: "COMPLETED",
        venue: "Test Arena",
        description: "Seed event for DjRating verification",
        countryId: location.countryId,
        cityId: location.cityId,
        ownerDjId: djId,
        genres: ["House", "Techno"],
      },
    });
  }

  async function markAttended(eventId: number, userId: string) {
    await prisma.eventAttendance.upsert({
      where: { eventId_userId: { eventId, userId } },
      update: { status: "ATTENDED" },
      create: { eventId, userId, status: "ATTENDED" },
    });
  }

  const premiumDj = await prisma.djProfile.findUnique({
    where: { slug: "test-premium-dj" },
    select: { id: true, slug: true, stageName: true },
  });
  const freeDj = await prisma.djProfile.findUnique({
    where: { slug: "test-free-dj" },
    select: { id: true, slug: true, stageName: true },
  });

  if (!premiumDj || !freeDj) {
    throw new Error(
      "test-premium-dj or test-free-dj not found. Run `npm run seed:test-users` first.",
    );
  }

  console.log(`Premium DJ: ${premiumDj.stageName} (id=${premiumDj.id})`);
  console.log(`Free DJ: ${freeDj.stageName} (id=${freeDj.id})`);

  const location = await getOrCreateTestLocation();
  console.log(
    `Using location: countryId=${location.countryId}, cityId=${location.cityId}`,
  );

  // Create synthetic reviewer accounts
  const reviewers = await Promise.all([
    createReviewer("Alex Rivera", 1),
    createReviewer("Jordan Lee", 2),
    createReviewer("Sam Chen", 3),
    createReviewer("Morgan Taylor", 4),
    createReviewer("Casey Kim", 5),
    createReviewer("Riley Nguyen", 6),
  ]);
  console.log(`Created ${reviewers.length} synthetic reviewer accounts`);

  // ── Events ──────────────────────────────────────────────────────────────
  const premiumEvent = await ensureEventForDj(
    premiumDj.id,
    10,
    "premium",
    location,
  );
  const freeEvent = await ensureEventForDj(freeDj.id, 15, "free", location);
  console.log(`Created event for premium DJ: /events/${premiumEvent.slug}`);
  console.log(`Created event for free DJ: /events/${freeEvent.slug}`);

  // ── Premium DJ: direct reviews ──────────────────────────────────────────
  const premiumDirectReviews = [
    {
      user: reviewers[0],
      rating: 5,
      review:
        "Absolutely incredible set! The transitions were seamless and the energy never dropped. Booked again for our next event without hesitation.",
    },
    {
      user: reviewers[1],
      rating: 4,
      review:
        "Great professionalism and communication throughout the booking process. The music selection fit our venue perfectly all night long.",
    },
    {
      user: reviewers[2],
      rating: 5,
      review:
        "One of the best DJs we've worked with this year. Read the crowd perfectly and kept everyone dancing until closing time.",
    },
  ];
  for (const r of premiumDirectReviews) {
    await prisma.djRating.create({
      data: {
        userId: r.user.id,
        djProfileId: premiumDj.id,
        eventId: null,
        rating: r.rating,
        review: r.review,
        reviewType: "DIRECT",
      },
    });
  }
  console.log(
    `Created ${premiumDirectReviews.length} direct reviews for premium DJ`,
  );

  // ── Premium DJ: event-anchored reviews ──────────────────────────────────
  await markAttended(premiumEvent.id, reviewers[3].id);
  await markAttended(premiumEvent.id, reviewers[4].id);

  await prisma.djRating.create({
    data: {
      userId: reviewers[3].id,
      djProfileId: premiumDj.id,
      eventId: premiumEvent.id,
      rating: 5,
      review:
        "Saw this DJ live at the event and the performance was unforgettable. Perfect track selection and crowd engagement all night.",
      reviewType: "EVENT_ATTENDEE",
    },
  });
  await prisma.djRating.create({
    data: {
      userId: reviewers[4].id,
      djProfileId: premiumDj.id,
      eventId: premiumEvent.id,
      rating: 4,
      review:
        "As the event organizer, I was impressed by the punctuality, professionalism, and how well they adapted to our sound system setup.",
      reviewType: "EVENT_ORGANIZER",
    },
  });
  console.log(`Created 2 event-anchored reviews for premium DJ`);

  // ── Free DJ: direct reviews ──────────────────────────────────────────────
  const freeDirectReviews = [
    {
      user: reviewers[5],
      rating: 4,
      review:
        "Solid performance overall, great energy and good taste in music. Would recommend for smaller venue bookings and private parties.",
    },
    {
      user: reviewers[0],
      rating: 3,
      review:
        "Decent set but took a while to warm up the crowd. Communication before the event was clear and booking process was smooth enough.",
    },
  ];
  for (const r of freeDirectReviews) {
    await prisma.djRating.create({
      data: {
        userId: r.user.id,
        djProfileId: freeDj.id,
        eventId: null,
        rating: r.rating,
        review: r.review,
        reviewType: "DIRECT",
      },
    });
  }
  console.log(`Created ${freeDirectReviews.length} direct reviews for free DJ`);

  // ── Free DJ: event-anchored reviews ──────────────────────────────────────
  await markAttended(freeEvent.id, reviewers[1].id);
  await prisma.djRating.create({
    data: {
      userId: reviewers[1].id,
      djProfileId: freeDj.id,
      eventId: freeEvent.id,
      rating: 5,
      review:
        "Fantastic energy at this event, the crowd loved every track. Definitely one of the highlights of the night for us as attendees.",
      reviewType: "EVENT_ATTENDEE",
    },
  });
  console.log(`Created 1 event-anchored review for free DJ`);

  console.log("\nDone! Visit these URLs to verify:");
  console.log(`  http://localhost:3000/djs/${premiumDj.slug}`);
  console.log(`  http://localhost:3000/djs/${freeDj.slug}`);
  console.log(`  http://localhost:3000/events/${premiumEvent.slug}`);
  console.log(`  http://localhost:3000/events/${freeEvent.slug}`);

  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
