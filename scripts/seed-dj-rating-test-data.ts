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
  // Environment guard — only permit seeding in local, test, or staging.
  const nodeEnv = process.env.NODE_ENV;
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const databaseUrl = process.env.DATABASE_URL;

  const isLocal = nodeEnv === "development" || nodeEnv === "test";
  const isStaging =
    appEnv === "staging" ||
    databaseUrl?.includes("jarmybsjvztwrmsdcnje.supabase.co");
  const isTest =
    databaseUrl?.includes("test") || databaseUrl?.includes("localhost");

  if (!isLocal && !isStaging && !isTest) {
    console.error(
      "❌ Aborting: DJ rating test data seeding is only permitted in local, test, or staging environments.",
    );
    process.exit(1);
  }

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

  const TEST_AVATARS_FOR_REVIEWERS = [
    "/rated-1.webp",
    "/rated-2.webp",
    "/rated-3.webp",
    "/rated-4.webp",
    "/rated-5.webp",
    "/rated-6.webp",
    "/rated-7.webp",
    "/rated-8.webp",
    "/rated-9.webp",
    "/rated-10.webp",
  ];

  async function createReviewer(
    label: string,
    index: number,
    role: "FAN" | "ORGANIZER" | "DJ" = "FAN",
  ) {
    const id = `test-reviewer-${now}-${index}`;
    const avatar =
      TEST_AVATARS_FOR_REVIEWERS[
        (index - 1) % TEST_AVATARS_FOR_REVIEWERS.length
      ];
    const user = await prisma.user.create({
      data: {
        id,
        email: `test-reviewer-${now}-${index}@example.com`,
        username: `test_reviewer_${now}_${index}`,
        name: label,
        image: avatar,
        status: "ACTIVE",
        onboardingComplete: true,
        roles: {
          create: [{ role }],
        },
      },
    });
    if (role === "FAN") {
      await prisma.fanProfile.create({
        data: { userId: user.id, name: label },
      });
    }
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

  // ── Delete the first 6 reviews for each test DJ (old data without proper fields) ──
  for (const dj of [premiumDj, freeDj]) {
    const oldestReviews = await prisma.djRating.findMany({
      where: { djProfileId: dj.id },
      orderBy: { id: "asc" },
      take: 6,
      select: { id: true },
    });
    if (oldestReviews.length > 0) {
      await prisma.djRating.deleteMany({
        where: { id: { in: oldestReviews.map((r) => r.id) } },
      });
      console.log(
        `Deleted ${oldestReviews.length} old reviews for ${dj.stageName}`,
      );
    }
  }

  // ── Fix existing direct reviews with null review text ──────────────────
  const nullReviewFixes = [
    "Amazing energy and seamless transitions! The crowd was engaged all night.",
    "Professional from start to finish. Great communication and an incredible set.",
    "One of the best bookings we've made. Would definitely hire again.",
    "Fantastic DJ - read the room perfectly and kept everyone on the dance floor.",
    "Solid performance with great track selection. Highly recommended.",
    "Exceeded our expectations. The music was perfect for our event vibe.",
    "Reliable, professional, and talented. A pleasure to work with.",
    "Great set! The energy was electric and everyone had a fantastic time.",
  ];
  const nullReviews = await prisma.djRating.findMany({
    where: {
      review: null,
      eventId: null,
      djProfileId: { in: [premiumDj.id, freeDj.id] },
    },
    select: { id: true },
  });
  for (let i = 0; i < nullReviews.length; i++) {
    await prisma.djRating.update({
      where: { id: nullReviews[i].id },
      data: {
        review: nullReviewFixes[i % nullReviewFixes.length],
        reviewType: "DIRECT",
      },
    });
  }
  if (nullReviews.length > 0) {
    console.log(
      `Updated ${nullReviews.length} direct reviews with review text`,
    );
  }

  // ── Fix existing event reviews with null review text ───────────────────
  const nullEventReviews = await prisma.djRating.findMany({
    where: {
      review: null,
      eventId: { not: null },
      djProfileId: { in: [premiumDj.id, freeDj.id] },
    },
    select: { id: true },
  });
  for (let i = 0; i < nullEventReviews.length; i++) {
    await prisma.djRating.update({
      where: { id: nullEventReviews[i].id },
      data: {
        review:
          "Incredible live performance at the event! The DJ kept the crowd energized throughout the entire set.",
      },
    });
  }
  if (nullEventReviews.length > 0) {
    console.log(
      `Updated ${nullEventReviews.length} event reviews with review text`,
    );
  }

  // ── Fix existing reviews with null reviewType ──────────────────────────
  const nullTypeReviews = await prisma.djRating.findMany({
    where: {
      reviewType: null,
      eventId: null,
      djProfileId: { in: [premiumDj.id, freeDj.id] },
    },
    select: { id: true },
  });
  for (const r of nullTypeReviews) {
    await prisma.djRating.update({
      where: { id: r.id },
      data: { reviewType: "DIRECT" },
    });
  }
  if (nullTypeReviews.length > 0) {
    console.log(`Fixed ${nullTypeReviews.length} reviews with null reviewType`);
  }

  // ── Fix existing users with no roles ───────────────────────────────────
  const usersWithoutRoles = await prisma.user.findMany({
    where: {
      roles: { none: {} },
      OR: [
        { username: { contains: "fan-rater" } },
        { username: { contains: "organizer-reviewer" } },
        { username: { contains: "attendee-reviewer" } },
        { username: { contains: "test_reviewer" } },
        { username: { contains: "test-fan" } },
        { username: { equals: "test-organizer" } },
        { email: { equals: "test-organizer@example.com" } },
      ],
    },
    select: { id: true, username: true },
  });
  for (const u of usersWithoutRoles) {
    // Assign FAN role as default for users without any role
    await prisma.userRole
      .create({ data: { userId: u.id, role: "FAN" } })
      .catch(() => {
        // Ignore if already exists (race condition)
      });
  }
  if (usersWithoutRoles.length > 0) {
    console.log(`Assigned FAN role to ${usersWithoutRoles.length} users`);
  }

  // ── Add avatars and display names to all test reviewer users ───────────
  const TEST_AVATARS = [
    "/rated-1.webp",
    "/rated-2.webp",
    "/rated-3.webp",
    "/rated-4.webp",
    "/rated-5.webp",
    "/rated-6.webp",
    "/rated-7.webp",
    "/rated-8.webp",
    "/rated-9.webp",
    "/rated-10.webp",
  ];

  // Generate a friendly display name from username
  function nameFromUsername(username: string): string {
    // e.g. "fan-rater-3-test-premium-dj" -> "Fan Rater 3"
    const parts = username.split("-");
    if (parts.length >= 2) {
      const label = parts.slice(0, -3).join(" "); // drop "test-premium-dj" suffix
      return label
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
    return username;
  }

  // Update all test reviewer users (those with test-related usernames)
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: "fan-rater" } },
        { username: { contains: "organizer-reviewer" } },
        { username: { contains: "attendee-reviewer" } },
        { username: { contains: "test_reviewer" } },
        { username: { contains: "test-fan" } },
        { username: { equals: "test-organizer" } },
        { email: { equals: "test-organizer@example.com" } },
      ],
    },
    select: { id: true, username: true, name: true, image: true },
  });

  let avatarCount = 0;
  for (let i = 0; i < testUsers.length; i++) {
    const u = testUsers[i];
    const avatar = TEST_AVATARS[i % TEST_AVATARS.length];
    const name = u.name || nameFromUsername(u.username);
    // Only update if missing image or name
    if (!u.image || !u.name) {
      await prisma.user.update({
        where: { id: u.id },
        data: { image: avatar, name },
      });
      avatarCount++;
    }
  }
  if (avatarCount > 0) {
    console.log(`Added avatars and names to ${avatarCount} test users`);
  }

  console.log(`Premium DJ: ${premiumDj.stageName} (id=${premiumDj.id})`);
  console.log(`Free DJ: ${freeDj.stageName} (id=${freeDj.id})`);

  const location = await getOrCreateTestLocation();
  console.log(
    `Using location: countryId=${location.countryId}, cityId=${location.cityId}`,
  );

  // Create synthetic reviewer accounts with different roles
  const reviewers = await Promise.all([
    createReviewer("Alex Rivera", 1, "FAN"),
    createReviewer("Jordan Lee", 2, "FAN"),
    createReviewer("Sam Chen", 3, "ORGANIZER"),
    createReviewer("Morgan Taylor", 4, "ORGANIZER"),
    createReviewer("Casey Kim", 5, "FAN"),
    createReviewer("Riley Nguyen", 6, "DJ"),
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
