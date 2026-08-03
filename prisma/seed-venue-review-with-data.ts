import { config } from "dotenv";
config({ path: ".env.local" });
config();
import prisma from "@/lib/client";

interface SeedVenueReviewOptions {
  eventSlug?: string;
  venueName?: string;
  userEmails?: string[];
}

async function seedVenueReviewsWithOptions(
  options: SeedVenueReviewOptions = {},
) {
  console.log("🌱 Seeding venue reviews with custom options...");

  // Find event by slug or use first completed event with venue
  let event;
  if (options.eventSlug) {
    event = await prisma.event.findUnique({
      where: { slug: options.eventSlug },
      include: { ownerDj: true },
    });
  } else {
    event = await prisma.event.findFirst({
      where: {
        venue: { not: null },
        status: "COMPLETED",
      },
      include: { ownerDj: true },
    });
  }

  if (!event) {
    console.log(
      "❌ No event found. Please provide a valid eventSlug or create a completed event with a venue.",
    );
    return;
  }

  const venueName = options.venueName || event.venue;
  if (!venueName) {
    console.log("❌ Event has no venue and no venueName provided.");
    return;
  }

  console.log(`📅 Using event: ${event.title} at ${venueName}`);

  // Find or create venue
  let venue = await prisma.venue.findFirst({
    where: {
      name: venueName,
      cityId: event.cityId || undefined,
    },
  });

  if (!venue) {
    venue = await prisma.venue.create({
      data: {
        name: venueName,
        cityId: event.cityId || 1,
        countryId: event.countryId || 1,
        source: "seed",
      },
    });
    console.log(`🏢 Created venue: ${venue.name}`);
  }

  // Find users
  let users;
  if (options.userEmails && options.userEmails.length > 0) {
    users = await prisma.user.findMany({
      where: {
        email: { in: options.userEmails },
      },
    });
  } else {
    users = await prisma.user.findMany({
      where: {
        email: { contains: "test" },
      },
      take: 5,
    });
  }

  if (users.length === 0) {
    console.log(
      "❌ No users found. Please provide valid userEmails or create test users.",
    );
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

  // Create diverse venue reviews
  const reviewTemplates = [
    {
      soundSystem: 5,
      atmosphere: 5,
      location: 5,
      accessibility: 5,
      review:
        "Absolutely incredible venue! The sound system is state-of-the-art with crystal clear audio at every corner. The atmosphere was electric and the crowd energy was amazing. Perfect location and very accessible with great parking options. This is now my favorite venue in the city!",
    },
    {
      soundSystem: 4,
      atmosphere: 4,
      location: 5,
      accessibility: 4,
      review:
        "Great venue overall. The sound quality is solid and the atmosphere is welcoming. Location is super convenient with easy access to public transport. Staff was friendly and the venue layout works well for events. Would definitely attend another event here.",
    },
    {
      soundSystem: 5,
      atmosphere: 4,
      location: 4,
      accessibility: 5,
      review:
        "The sound system here is phenomenal - one of the best I've experienced. The venue has good accessibility features and the staff is helpful. Atmosphere is nice but could be improved with better lighting. Still, highly recommended for music events.",
    },
    {
      soundSystem: 4,
      atmosphere: 5,
      location: 4,
      accessibility: 4,
      review:
        "Fantastic atmosphere! The venue has a great vibe and the crowd is always energetic. Sound system is good though not the absolute best. Location is decent and accessibility is satisfactory. The overall experience makes up for any minor issues.",
    },
    {
      soundSystem: 3,
      atmosphere: 4,
      location: 5,
      accessibility: 5,
      review:
        "Solid venue with excellent location and accessibility. The sound system is adequate but could use some upgrades. Atmosphere is pleasant and the venue is well-maintained. Great for smaller events and intimate gatherings.",
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

  // Update venue reputation score
  const { updateVenueReputationScore } =
    await import("@/lib/reputation/venue-update");
  await updateVenueReputationScore(venue.id, "SEED_DATA" as any);
  console.log(`📊 Updated venue reputation score`);

  console.log("✅ Venue reviews seeded successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   Event: ${event.title} (${event.slug})`);
  console.log(`   Venue: ${venue.name} (ID: ${venue.id})`);
  console.log(`   Reviews created: ${createdCount}`);
  console.log(
    `   Total reviews for venue: ${createdCount + (users.length - createdCount)}`,
  );
}

// Run with custom options or defaults
const options: SeedVenueReviewOptions = {
  // eventSlug: "your-event-slug", // Uncomment to specify event
  // venueName: "Custom Venue Name", // Uncomment to specify venue
  // userEmails: ["test1@example.com", "test2@example.com"], // Uncomment to specify users
};

seedVenueReviewsWithOptions(options)
  .catch((e) => {
    console.error("❌ Error seeding venue reviews:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
