import { config } from "dotenv";
config({ path: ".env.local" });
config();
import prisma from "@/lib/client";

async function seedVenueReviews() {
  console.log("🌱 Seeding venue reviews...");

  // Find a test event with a venue
  const event = await prisma.event.findFirst({
    where: {
      venue: { not: null },
      status: "COMPLETED",
    },
    include: {
      ownerDj: true,
    },
  });

  if (!event) {
    console.log(
      "❌ No completed event with venue found. Please create one first.",
    );
    return;
  }

  console.log(`📅 Using event: ${event.title} at ${event.venue}`);

  // Find or create venue
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

  // Find test users (fans)
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: "test",
      },
    },
    take: 3,
  });

  if (users.length === 0) {
    console.log("❌ No test users found. Please create test users first.");
    return;
  }

  console.log(`👥 Found ${users.length} test users`);

  // Create attendance records for these users
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
      console.log(`✅ Created attendance for ${user.email}`);
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
      console.log(`⭐ Created venue review from ${user.email}`);
    } else {
      console.log(`⏭️  Review already exists for ${user.email}`);
    }
  }

  // Update venue reputation score
  const { updateVenueReputationScore } =
    await import("@/lib/reputation/venue-update");
  await updateVenueReputationScore(venue.id, "SEED_DATA" as any);
  console.log(`📊 Updated venue reputation score`);

  console.log("✅ Venue reviews seeded successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   Event: ${event.title}`);
  console.log(`   Venue: ${venue.name}`);
  console.log(
    `   Reviews created: ${Math.min(users.length, reviewTemplates.length)}`,
  );
}

seedVenueReviews()
  .catch((e) => {
    console.error("❌ Error seeding venue reviews:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
