import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function addVenueReviewsToExistingEvent() {
  console.log("🌱 Adding venue reviews to existing event...");

  // Find any completed event with a venue
  const event = await prisma.event.findFirst({
    where: {
      venue: { not: null },
      status: "COMPLETED",
    },
  });

  if (!event) {
    console.log(
      "❌ No completed event with venue found. Creating a test event instead...",
    );

    // Find a DJ profile
    const djProfile = await prisma.djProfile.findFirst({
      where: { status: "APPROVED" as any },
      include: { user: true },
    });

    if (!djProfile) {
      console.log("❌ No DJ profile found. Please create one first.");
      return;
    }

    // Create a test event
    const newEvent = await prisma.event.create({
      data: {
        slug: `test-venue-review-${Date.now()}`,
        title: "Test Venue Review Event",
        eventType: "PUBLIC",
        category: "CLUB_NIGHT",
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: "COMPLETED",
        venue: "Test Venue Club",
        description: "A test event for venue reviews",
        countryId: 1,
        cityId: 1,
        ownerDjId: djProfile.id,
        genres: ["House", "Techno"],
      },
    });

    console.log(`📅 Created test event: ${newEvent.title} (${newEvent.slug})`);
    console.log(`🎧 Using DJ: ${djProfile.stageName}`);

    // Create venue record
    const venue = await prisma.venue.create({
      data: {
        name: "Test Venue Club",
        cityId: 1,
        countryId: 1,
        source: "test",
      },
    });

    console.log(`🏢 Created venue: ${venue.name}`);

    // Find existing users
    const users = await prisma.user.findMany({
      take: 3,
    });

    if (users.length === 0) {
      console.log("❌ No users found. Please create users first.");
      return;
    }

    console.log(`👥 Found ${users.length} users`);

    // Create attendance records
    for (const user of users) {
      await prisma.eventAttendance.create({
        data: {
          eventId: newEvent.id,
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
          eventId: newEvent.id,
          venueId: venue.id,
          userId: user.id,
          soundSystem: template.soundSystem,
          atmosphere: template.atmosphere,
          location: template.location,
          accessibility: template.accessibility,
          rating: overallRating,
          review: template.review,
          ipAddress: "127.0.0.1",
          userAgent: "seed-script",
        },
      });
      console.log(
        `⭐ Created venue review from user ${user.id} (${overallRating}/5)`,
      );
    }

    console.log("✅ Test event and venue reviews created successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   Event: ${newEvent.title}`);
    console.log(`   Event URL: /events/${newEvent.slug}`);
    console.log(`   Venue: ${venue.name}`);
    console.log(
      `   Reviews created: ${Math.min(users.length, reviewTemplates.length)}`,
    );
    console.log(`\n🔗 Visit the event page to see venue reviews:`);
    console.log(`   http://localhost:3000/events/${newEvent.slug}`);
    return;
  }

  console.log(`📅 Using event: ${event.title} (${event.slug})`);
  console.log(`🏢 Venue: ${event.venue}`);

  // Find or create venue record
  let venue = await prisma.venue.findFirst({
    where: {
      name: event.venue!,
      cityId: event.cityId || undefined,
    },
  });

  if (!venue) {
    venue = await prisma.venue.create({
      data: {
        name: event.venue!,
        cityId: event.cityId || 1,
        countryId: event.countryId || 1,
        source: "seed",
      },
    });
    console.log(`🏢 Created venue: ${venue.name}`);
  }

  // Find existing users
  const users = await prisma.user.findMany({
    take: 3,
  });

  if (users.length === 0) {
    console.log("❌ No users found in database. Please create users first.");
    return;
  }

  console.log(`👥 Found ${users.length} users`);

  // Create attendance records
  for (const user of users) {
    const existingAttendance = await prisma.eventAttendance.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
    });

    if (!existingAttendance) {
      await prisma.eventAttendance.create({
        data: {
          eventId: event.id,
          userId: user.id,
          status: "ATTENDED",
        },
      });
      console.log(`✅ Created attendance for user ${user.id}`);
    }
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

  let createdCount = 0;
  for (let i = 0; i < Math.min(users.length, reviewTemplates.length); i++) {
    const user = users[i];
    const template = reviewTemplates[i];

    const existingReview = await prisma.venueReview.findUnique({
      where: {
        eventId_venueId_userId: {
          eventId: event.id,
          venueId: venue.id,
          userId: user.id,
        },
      },
    });

    if (!existingReview) {
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
          userAgent: "seed-script",
        },
      });
      console.log(
        `⭐ Created venue review from user ${user.id} (${overallRating}/5)`,
      );
      createdCount++;
    } else {
      console.log(`⏭️  Review already exists for user ${user.id}`);
    }
  }

  console.log("✅ Venue reviews added successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   Event: ${event.title}`);
  console.log(`   Event URL: /events/${event.slug}`);
  console.log(`   Venue: ${venue.name}`);
  console.log(`   Reviews created: ${createdCount}`);
  console.log(`\n🔗 Visit the event page to see venue reviews:`);
  console.log(`   http://localhost:3000/events/${event.slug}`);
}

addVenueReviewsToExistingEvent()
  .catch((e) => {
    console.error("❌ Error adding venue reviews:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
