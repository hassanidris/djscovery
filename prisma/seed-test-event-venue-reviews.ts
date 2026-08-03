import { config } from "dotenv";
config({ path: ".env.local" });
config();
import prisma from "@/lib/client";

async function createTestEventAndVenueReviews() {
  console.log("🌱 Creating test event and venue reviews...");

  // Find a test DJ
  const djProfile = await prisma.djProfile.findFirst({
    where: {
      status: "APPROVED" as any,
    },
    include: { user: true },
  });

  if (!djProfile) {
    console.log("❌ No active DJ profile found. Please create one first.");
    return;
  }

  console.log(`🎧 Using DJ: ${djProfile.stageName}`);

  // Create a test event
  const event = await prisma.event.create({
    data: {
      slug: `test-venue-review-event-${Date.now()}`,
      title: "Test Venue Review Event",
      eventType: "PUBLIC",
      category: "CLUB_NIGHT",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      status: "COMPLETED",
      venue: "Test Venue Club",
      description: "A test event for venue reviews",
      countryId: 1,
      cityId: 1,
      ownerDjId: djProfile.id,
      genres: ["House", "Techno"],
    },
  });

  console.log(`📅 Created event: ${event.title} (${event.slug})`);

  // Find or create venue record
  let venue = await prisma.venue.findFirst({
    where: {
      name: "Test Venue Club",
      cityId: 1,
    },
  });

  if (!venue) {
    venue = await prisma.venue.create({
      data: {
        name: "Test Venue Club",
        cityId: 1,
        countryId: 1,
        source: "test",
      },
    });
    console.log(`🏢 Created venue: ${venue.name}`);
  } else {
    console.log(`🏢 Using existing venue: ${venue.name}`);
  }

  // Find test users
  const users = await prisma.user.findMany({
    where: {
      email: { contains: "test" },
    },
    take: 3,
  });

  if (users.length === 0) {
    console.log("❌ No test users found. Creating test users...");

    // Create test users if none exist
    for (let i = 1; i <= 3; i++) {
      const userId = `test-user-${Date.now()}-${i}`;
      const user = await prisma.user.create({
        data: {
          id: userId,
          email: `test-user-${i}@example.com`,
          username: `testuser${i}`,
          name: `Test User ${i}`,
          status: "ACTIVE",
          onboardingComplete: true,
        },
      });

      // Create fan profile
      await prisma.fanProfile.create({
        data: {
          userId: user.id,
          name: `Test Fan ${i}`,
        },
      });

      users.push(user);
      console.log(`✅ Created test user: ${user.id}`);
    }
  }

  console.log(`👥 Found ${users.length} test users`);

  // Create attendance records
  for (const user of users) {
    await prisma.eventAttendance.create({
      data: {
        eventId: event.id,
        userId: user.id,
        status: "ATTENDED",
      },
    });
    console.log(`✅ Created attendance for user ${user.id}`);
  }

  // Create venue reviews
  const reviewTemplates = [
    {
      soundSystem: 5,
      atmosphere: 5,
      location: 4,
      accessibility: 5,
      review:
        "Amazing venue! The sound system was top-notch and the atmosphere was electric. Great location and very accessible.",
    },
    {
      soundSystem: 4,
      atmosphere: 4,
      location: 5,
      accessibility: 4,
      review:
        "Solid venue with excellent sound quality. Easy to get to and well-organized. Would definitely come back for another event.",
    },
    {
      soundSystem: 5,
      atmosphere: 4,
      location: 4,
      accessibility: 5,
      review:
        "The sound system here is incredible - crystal clear audio throughout. Staff was helpful and the venue layout is perfect for events.",
    },
  ];

  for (let i = 0; i < Math.min(users.length, reviewTemplates.length); i++) {
    const user = users[i];
    const template = reviewTemplates[i];

    const overallRating = Math.round(
      (template.soundSystem +
        template.atmosphere +
        template.location +
        template.accessibility) /
        4,
    );

    await prisma.venueReview.create({
      data: {
        eventId: event.id,
        venueId: venue.id,
        userId: user.id,
        soundSystem: template.soundSystem,
        atmosphere: template.atmosphere,
        location: template.location,
        accessibility: template.accessibility,
        rating: overallRating,
        review: template.review,
        ipAddress: "127.0.0.1",
        userAgent: "test-script",
      },
    });
    console.log(
      `⭐ Created venue review from user ${user.id} (${overallRating}/5)`,
    );
  }

  // Update venue reputation score
  const { updateVenueReputationScore } =
    await import("@/lib/reputation/venue-update");
  await updateVenueReputationScore(venue.id, "TEST_DATA" as any);
  console.log(`📊 Updated venue reputation score`);

  console.log("✅ Test event and venue reviews created successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   Event: ${event.title}`);
  console.log(`   Event URL: /events/${event.slug}`);
  console.log(`   Venue: ${venue.name}`);
  console.log(
    `   Reviews created: ${Math.min(users.length, reviewTemplates.length)}`,
  );
  console.log(`\n🔗 Visit the event page to see venue reviews:`);
  console.log(`   http://localhost:3000/events/${event.slug}`);
}

createTestEventAndVenueReviews()
  .catch((e) => {
    console.error("❌ Error creating test event and venue reviews:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
