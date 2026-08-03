import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

// Load .env and .env.local relative to the project root (cwd)
const inheritedEnvKeys = new Set(Object.keys(process.env));
for (const file of [".env", ".env.local"]) {
  const filePath = resolve(process.cwd(), file);
  if (!existsSync(filePath)) continue;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (inheritedEnvKeys.has(key)) continue;
    process.env[key] = val;
  }
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createAdminClient } from "../src/lib/supabase/admin";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Test data constants
const PREMIUM_DJ_EMAIL =
  process.env.E2E_TEST_PREMIUM_DJ_EMAIL || "test-premium-dj@example.com";
const FREE_DJ_EMAIL =
  process.env.E2E_TEST_FREE_DJ_EMAIL || "test-free-dj@example.com";
const FAN_EMAIL = process.env.E2E_TEST_FAN_EMAIL || "test-fan@example.com";

// Genre mapping - ensure these exist in the database
const GENRE_NAMES = [
  "House",
  "Techno",
  "Deep House",
  "Tech House",
  "Progressive House",
  "Melodic Techno",
  "Hip-Hop",
  "R&B",
  "Afrobeats",
  "Amapiano",
];

// DJ types
const DJ_TYPES = ["CLUB", "FESTIVAL", "WEDDING", "CORPORATE", "BAR_LOUNGE"];

// Social platforms
const SOCIAL_PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "spotify",
  "soundcloud",
  "website",
];

async function getOrCreateTestUser(
  email: string,
  role: "DJ" | "FAN",
  password: string = "TestPassword123!",
) {
  const admin = createAdminClient();

  let userId: string;

  // First check if user exists in our database
  const existingDbUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingDbUser) {
    userId = existingDbUser.id;
    console.log(`  Found existing user in database: ${userId}`);
  } else {
    // Try to create the user in Supabase
    const { data: userData, error: userError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role },
      });

    if (userError) {
      throw new Error(`Failed to create test user: ${userError.message}`);
    }

    if (!userData.user) {
      throw new Error(`Failed to create test user: No user data returned`);
    }

    userId = userData.user.id;
    console.log(`  Created Supabase user: ${userId}`);
  }

  // Create/update database records
  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { id: userId },
      update: { onboardingComplete: true },
      create: {
        id: userId,
        email,
        username: email.split("@")[0],
        onboardingComplete: true,
      },
    });

    await tx.userRole.upsert({
      where: { userId_role: { userId, role } },
      update: {},
      create: { userId, role },
    });

    if (role === "FAN") {
      await tx.fanProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          name: "Test Fan",
        },
      });
    }
  });

  return userId;
}

async function seedDjProfile(
  email: string,
  plan: "FREE" | "PREMIUM",
  stageName: string,
  slug: string,
) {
  console.log(`\nSeeding DJ profile: ${stageName} (${plan})`);

  const userId = await getOrCreateTestUser(email, "DJ");

  // Get any city for location
  const anyCity = await prisma.city.findFirst({
    select: { id: true, countryId: true, name: true },
  });
  if (!anyCity) {
    throw new Error("No City records found. Run seed.ts first.");
  }

  // Get genres
  const genres = await prisma.genre.findMany({
    where: { name: { in: GENRE_NAMES } },
  });

  // Create/update DJ profile
  const djProfile = await prisma.djProfile.upsert({
    where: { userId },
    update: {
      plan,
      stageName,
      slug,
      bio:
        plan === "PREMIUM"
          ? `Award-winning ${stageName} with over 10 years of experience rocking dance floors across Europe. Known for seamless transitions and reading the crowd perfectly. Specialized in House and Techno with influences from Detroit and Berlin.`
          : `Passionate ${stageName} bringing good vibes to every event. Love playing House, Hip-Hop, and everything in between. Available for bookings.`,
      experienceYears: plan === "PREMIUM" ? 12 : 3,
      experienceLevel: plan === "PREMIUM" ? "EXPERT" : "INTERMEDIATE",
      status: "APPROVED",
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face`,
      coverImage: `https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1200&h=400&fit=crop`,
      bookingEmail: email,
      feeMin: plan === "PREMIUM" ? 500 : 200,
      feeMax: plan === "PREMIUM" ? 2000 : 500,
      feeCurrency: "USD",
      searchScore: plan === "PREMIUM" ? 850 : 600,
      reputationScore: plan === "PREMIUM" ? 750 : 450,
      featured: plan === "PREMIUM",
      monthlyViews: plan === "PREMIUM" ? 1500 : 300,
    },
    create: {
      userId,
      plan,
      stageName,
      slug,
      bio:
        plan === "PREMIUM"
          ? `Award-winning ${stageName} with over 10 years of experience rocking dance floors across Europe. Known for seamless transitions and reading the crowd perfectly. Specialized in House and Techno with influences from Detroit and Berlin.`
          : `Passionate ${stageName} bringing good vibes to every event. Love playing House, Hip-Hop, and everything in between. Available for bookings.`,
      experienceYears: plan === "PREMIUM" ? 12 : 3,
      experienceLevel: plan === "PREMIUM" ? "EXPERT" : "INTERMEDIATE",
      status: "APPROVED",
      countryId: anyCity.countryId,
      cityId: anyCity.id,
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face`,
      coverImage: `https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1200&h=400&fit=crop`,
      bookingEmail: email,
      feeMin: plan === "PREMIUM" ? 500 : 200,
      feeMax: plan === "PREMIUM" ? 2000 : 500,
      feeCurrency: "USD",
      searchScore: plan === "PREMIUM" ? 850 : 600,
      reputationScore: plan === "PREMIUM" ? 750 : 450,
      featured: plan === "PREMIUM",
      monthlyViews: plan === "PREMIUM" ? 1500 : 300,
    },
  });

  console.log(`  Created DJ profile: ${djProfile.id}`);

  // Clear existing related data
  await prisma.djGenre.deleteMany({ where: { djProfileId: djProfile.id } });
  await prisma.djProfileType.deleteMany({
    where: { djProfileId: djProfile.id },
  });
  await prisma.socialLink.deleteMany({ where: { djProfileId: djProfile.id } });
  await prisma.media.deleteMany({ where: { djProfileId: djProfile.id } });
  await prisma.djRating.deleteMany({ where: { djProfileId: djProfile.id } });
  await prisma.djComment.deleteMany({ where: { djProfileId: djProfile.id } });
  await prisma.djFollow.deleteMany({ where: { djProfileId: djProfile.id } });
  await prisma.djPackage.deleteMany({ where: { djProfileId: djProfile.id } });
  await prisma.djCareerHighlight.deleteMany({
    where: { djProfileId: djProfile.id },
  });
  await prisma.djEndorsement.deleteMany({
    where: { djProfileId: djProfile.id },
  });
  await prisma.djPress.deleteMany({ where: { djProfileId: djProfile.id } });
  await prisma.djVenue.deleteMany({ where: { djProfileId: djProfile.id } });
  await prisma.profileView.deleteMany({ where: { djProfileId: djProfile.id } });
  await prisma.event.deleteMany({ where: { ownerDjId: djProfile.id } });

  // Seed genres
  const selectedGenres = genres.slice(0, plan === "PREMIUM" ? 5 : 3);
  await prisma.djGenre.createMany({
    data: selectedGenres.map((genre) => ({
      djProfileId: djProfile.id,
      genreId: genre.id,
    })),
    skipDuplicates: true,
  });
  console.log(`  Added ${selectedGenres.length} genres`);

  // Seed DJ types
  const selectedTypes = DJ_TYPES.slice(0, plan === "PREMIUM" ? 4 : 2);
  await prisma.djProfileType.createMany({
    data: selectedTypes.map((type) => ({
      djProfileId: djProfile.id,
      type: type as any,
    })),
    skipDuplicates: true,
  });
  console.log(`  Added ${selectedTypes.length} DJ types`);

  // Seed social links
  await prisma.socialLink.createMany({
    data: SOCIAL_PLATFORMS.map((platform, index) => ({
      djProfileId: djProfile.id,
      platform,
      url: `https://${platform}.com/${slug}`,
    })),
    skipDuplicates: true,
  });
  console.log(`  Added ${SOCIAL_PLATFORMS.length} social links`);

  // Seed media
  const mediaItems = [
    {
      type: "IMAGE" as const,
      url: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800",
      bucket: "external",
      path: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800",
      sortOrder: 0,
      isSpotlight: true,
    },
    {
      type: "IMAGE" as const,
      url: "https://images.unsplash.com/photo-1574399366867-1b7b0b0b0b0b?w=800",
      bucket: "external",
      path: "https://images.unsplash.com/photo-1574399366867-1b7b0b0b0b0b?w=800",
      sortOrder: 1,
      isSpotlight: true,
    },
    {
      type: "VIDEO" as const,
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      bucket: "external",
      path: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      sortOrder: 2,
      isSpotlight: false,
      title: "Live Set at Club XYZ",
      duration: "1:30:00",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    },
    {
      type: "AUDIO" as const,
      url: "https://soundcloud.com/artist/mix-1",
      bucket: "external",
      path: "https://soundcloud.com/artist/mix-1",
      sortOrder: 3,
      isSpotlight: false,
      title: "Summer Mix 2024",
      duration: "58:30",
    },
  ];

  const mediaCount = plan === "PREMIUM" ? mediaItems.length : 2;
  await prisma.media.createMany({
    data: mediaItems.slice(0, mediaCount).map((item) => ({
      ...item,
      djProfileId: djProfile.id,
    })),
    skipDuplicates: true,
  });
  console.log(`  Added ${mediaCount} media items`);

  // Seed ratings
  const fanUserId = await getOrCreateTestUser(FAN_EMAIL, "FAN");
  const ratingCount = plan === "PREMIUM" ? 15 : 5;
  const ratings = [];
  for (let i = 0; i < ratingCount; i++) {
    ratings.push({
      djProfileId: djProfile.id,
      userId: fanUserId,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      review:
        i === 0
          ? "Absolutely incredible set! Had everyone dancing all night long. Will definitely book again!"
          : i < 3
            ? "Great energy and track selection. Really knows how to read the crowd."
            : null,
    });
  }
  await prisma.djRating.createMany({
    data: ratings,
    skipDuplicates: true,
  });
  console.log(`  Added ${ratingCount} ratings`);

  // Seed comments
  const comments = [
    {
      djProfileId: djProfile.id,
      userId: fanUserId,
      content: "Your latest set was amazing! When's your next gig?",
    },
    {
      djProfileId: djProfile.id,
      userId: fanUserId,
      content: "Thanks for the great music recommendation!",
    },
  ];
  await prisma.djComment.createMany({
    data: comments,
    skipDuplicates: true,
  });
  console.log(`  Added ${comments.length} comments`);

  // Seed followers
  const followerCount = plan === "PREMIUM" ? 50 : 15;
  const followers = [];
  for (let i = 0; i < followerCount; i++) {
    const followerEmail = `follower-${i}-${slug}@example.com`;
    try {
      const followerId = await getOrCreateTestUser(followerEmail, "FAN");
      followers.push({
        djProfileId: djProfile.id,
        userId: followerId,
      });
    } catch (e) {
      // Skip if user creation fails
    }
  }
  await prisma.djFollow.createMany({
    data: followers,
    skipDuplicates: true,
  });
  console.log(`  Added ${followers.length} followers`);

  // Seed premium features
  if (plan === "PREMIUM") {
    // Packages
    await prisma.djPackage.createMany({
      data: [
        {
          djProfileId: djProfile.id,
          name: "Club Set",
          priceFrom: 500,
          priceTo: 800,
          currency: "USD",
          duration: "2 hours",
          features: [
            "2-hour performance",
            "Sound equipment included",
            "Custom playlist",
          ],
          popular: true,
          sortOrder: 0,
        },
        {
          djProfileId: djProfile.id,
          name: "Festival Set",
          priceFrom: 1500,
          priceTo: 2500,
          currency: "USD",
          duration: "1.5 hours",
          features: [
            "1.5-hour performance",
            "Professional setup",
            "Meet & greet",
          ],
          popular: false,
          sortOrder: 1,
        },
        {
          djProfileId: djProfile.id,
          name: "Private Event",
          priceFrom: 1000,
          priceTo: 2000,
          currency: "USD",
          duration: "4 hours",
          features: ["4-hour performance", "MC services", "Lighting included"],
          popular: false,
          sortOrder: 2,
        },
      ],
      skipDuplicates: true,
    });
    console.log(`  Added 3 packages`);

    // Career highlights
    await prisma.djCareerHighlight.createMany({
      data: [
        {
          djProfileId: djProfile.id,
          year: "2023",
          title: "Headlined Tomorrowland Main Stage",
          description:
            "Performed for 50,000+ attendees at one of the world's biggest festivals",
        },
        {
          djProfileId: djProfile.id,
          year: "2022",
          title: "Released Debut Album on Spinnin' Records",
          description: "Album reached #5 on Beatport charts",
        },
        {
          djProfileId: djProfile.id,
          year: "2021",
          title: "Won Best Emerging DJ at DJ Mag Awards",
          description:
            "Recognized for outstanding contribution to the electronic music scene",
        },
      ],
      skipDuplicates: true,
    });
    console.log(`  Added 3 career highlights`);

    // Endorsements
    await prisma.djEndorsement.createMany({
      data: [
        {
          djProfileId: djProfile.id,
          name: "John Smith",
          role: "Festival Director",
          company: "Tomorrowland",
          quote:
            "One of the most talented DJs I've worked with. Absolutely professional and incredible performance.",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        },
        {
          djProfileId: djProfile.id,
          name: "Sarah Johnson",
          role: "Club Manager",
          company: "Berghain",
          quote:
            "Consistently delivers amazing sets that keep our crowd coming back. Highly recommended!",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        },
      ],
      skipDuplicates: true,
    });
    console.log(`  Added 2 endorsements`);

    // Press
    await prisma.djPress.createMany({
      data: [
        {
          djProfileId: djProfile.id,
          source: "DJ Mag",
          type: "Feature",
          title: "Rising Star: Meet the DJ Taking Over Europe",
          date: "2023-06-15",
          url: "https://djmag.com/features/rising-star-meet-dj-taking-over-europe",
        },
        {
          djProfileId: djProfile.id,
          source: "Mixmag",
          type: "Interview",
          title:
            "In Conversation: My Journey from Bedroom DJ to Festival Headliner",
          date: "2023-04-20",
          url: "https://mixmag.net/feature/conversation-journey-bedroom-dj-festival-headliner",
        },
        {
          djProfileId: djProfile.id,
          source: "Resident Advisor",
          type: "Podcast",
          title: "RA Podcast: Exclusive 1-Hour Mix",
          date: "2023-02-10",
          url: "https://ra.co/podcasts/exclusive-1-hour-mix",
        },
      ],
      skipDuplicates: true,
    });
    console.log(`  Added 3 press items`);

    // Venues (where they've played)
    await prisma.djVenue.createMany({
      data: [
        {
          djProfileId: djProfile.id,
          venueName: "Berghain",
          eventDate: "2023-12-31",
          description: "New Year's Eve special set",
          countryId: anyCity.countryId,
          cityId: anyCity.id,
        },
        {
          djProfileId: djProfile.id,
          venueName: "Fabric",
          eventDate: "2023-11-15",
          description: "Friday night main room",
          countryId: anyCity.countryId,
          cityId: anyCity.id,
        },
        {
          djProfileId: djProfile.id,
          venueName: "Amnesia",
          eventDate: "2023-08-20",
          description: "Ibiza summer residency closing party",
          countryId: anyCity.countryId,
          cityId: anyCity.id,
        },
        {
          djProfileId: djProfile.id,
          venueName: "Output",
          eventDate: "2023-07-04",
          description: "Independence Day celebration",
          countryId: anyCity.countryId,
          cityId: anyCity.id,
        },
      ],
      skipDuplicates: true,
    });
    console.log(`  Added 4 venues`);

    // Premium-specific fields
    await prisma.djProfile.update({
      where: { id: djProfile.id },
      data: {
        managerName: "Alex Thompson",
        managerEmail: "alex@management.com",
        managerPhone: "+1-555-0101",
        agentName: "Jessica Williams",
        agentAgency: "Global Talent Agency",
        agentEmail: "jessica@globaltalent.com",
        availabilityTimezone: "Europe/Berlin",
        availabilityMonth: "2025-01",
        availabilityDays: [
          { day: 1, status: "available" },
          { day: 2, status: "booked" },
          { day: 3, status: "available" },
          { day: 4, status: "available" },
          { day: 5, status: "booked" },
          { day: 6, status: "available" },
          { day: 7, status: "available" },
        ],
        featuredPerformanceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        featuredPerformanceContext: "Live at Tomorrowland 2023",
      },
    });
    console.log(`  Added premium team contacts and availability`);
  }

  // Events (upcoming and past) — for both FREE and PREMIUM plans
  const now = new Date();
  const upcomingEventDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const pastEventDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  const events = [
    // Upcoming events
    {
      slug: `${slug}-upcoming-1`,
      title: "Summer Festival 2025",
      description: "Main stage performance at the biggest summer festival",
      eventType: "PUBLIC" as const,
      category: "FESTIVAL",
      posterUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
      posterPath:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
      venue: "Central Park Arena",
      startDate: upcomingEventDate,
      endDate: new Date(upcomingEventDate.getTime() + 4 * 60 * 60 * 1000),
      startTime: "22:00",
      endTime: "02:00",
      timezone: "Europe/Berlin",
      ticketUrl: "https://example.com/tickets",
      genres: ["House", "Techno"],
      status: "PUBLISHED" as const,
      featured: true,
      ownerDjId: djProfile.id,
      countryId: anyCity.countryId,
      cityId: anyCity.id,
    },
    {
      slug: `${slug}-upcoming-2`,
      title: "Club Night Special",
      description: "Exclusive set at the city's premier nightclub",
      eventType: "PUBLIC" as const,
      category: "CLUB",
      posterUrl:
        "https://images.unsplash.com/photo-1574399366867-1b7b0b0b0b0b?w=800",
      posterPath:
        "https://images.unsplash.com/photo-1574399366867-1b7b0b0b0b0b?w=800",
      venue: "Neon Club",
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(
        now.getTime() + 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000,
      ),
      startTime: "23:00",
      endTime: "04:00",
      timezone: "Europe/Berlin",
      ticketUrl: "https://example.com/tickets",
      genres: ["Tech House", "Deep House"],
      status: "PUBLISHED" as const,
      featured: false,
      ownerDjId: djProfile.id,
      countryId: anyCity.countryId,
      cityId: anyCity.id,
    },
    // Past events
    {
      slug: `${slug}-past-1`,
      title: "New Year's Eve Gala",
      description: "Celebrated NYE with an unforgettable 4-hour set",
      eventType: "PUBLIC" as const,
      category: "CLUB",
      posterUrl:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
      posterPath:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
      venue: "Grand Hotel Ballroom",
      startDate: pastEventDate,
      endDate: new Date(pastEventDate.getTime() + 4 * 60 * 60 * 1000),
      startTime: "21:00",
      endTime: "01:00",
      timezone: "Europe/Berlin",
      genres: ["House", "Hip-Hop"],
      status: "COMPLETED" as const,
      featured: false,
      recap:
        "An incredible night with over 500 attendees. The energy was amazing!",
      audioLink: "https://soundcloud.com/artist/nye-2024-mix",
      ownerDjId: djProfile.id,
      countryId: anyCity.countryId,
      cityId: anyCity.id,
    },
    {
      slug: `${slug}-past-2`,
      title: "Warehouse Sessions",
      description: "Underground techno event in an industrial warehouse",
      eventType: "PUBLIC" as const,
      category: "CLUB",
      posterUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      posterPath:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      venue: "Old Warehouse District",
      startDate: new Date(pastEventDate.getTime() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(
        pastEventDate.getTime() - 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000,
      ),
      startTime: "22:00",
      endTime: "04:00",
      timezone: "Europe/Berlin",
      genres: ["Techno", "Industrial"],
      status: "COMPLETED" as const,
      featured: false,
      ownerDjId: djProfile.id,
      countryId: anyCity.countryId,
      cityId: anyCity.id,
    },
  ];

  // Premium gets all 4 events; Free gets 2 (1 upcoming + 1 past)
  const selectedEvents = plan === "PREMIUM" ? events : [events[0], events[2]];
  await prisma.event.createMany({
    data: selectedEvents,
    skipDuplicates: true,
  });
  console.log(`  Added ${selectedEvents.length} events`);

  // Connect DJ to events via EventDj junction table
  const createdEventsList = await prisma.event.findMany({
    where: { ownerDjId: djProfile.id },
    select: { id: true },
  });
  await prisma.eventDj.createMany({
    data: createdEventsList.map((event) => ({
      eventId: event.id,
      djProfileId: djProfile.id,
      role: "Headliner",
    })),
    skipDuplicates: true,
  });
  console.log(`  Connected DJ to ${createdEventsList.length} events`);

  // Seed profile views
  const viewCount = plan === "PREMIUM" ? 100 : 30;
  const views = [];
  for (let i = 0; i < viewCount; i++) {
    views.push({
      djProfileId: djProfile.id,
      viewerId: i % 2 === 0 ? fanUserId : null,
      viewerIp: `192.168.1.${i % 255}`,
      source: ["direct", "search", "social", "referral"][
        Math.floor(Math.random() * 4)
      ],
      city: anyCity.name,
      country: "Test Country",
    });
  }
  await prisma.profileView.createMany({
    data: views,
    skipDuplicates: true,
  });
  console.log(`  Added ${viewCount} profile views`);

  console.log(`✅ Successfully seeded ${stageName} profile with all sections`);
  return djProfile;
}

async function main() {
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
      "❌ Aborting: DJ profile seeding is only permitted in local, test, or staging environments.",
    );
    process.exit(1);
  }

  console.log("🎧 Starting DJ profile seeding...\n");

  try {
    // Seed premium DJ profile
    await seedDjProfile(
      PREMIUM_DJ_EMAIL,
      "PREMIUM",
      "Test Premium DJ",
      "test-premium-dj",
    );

    // Seed free DJ profile
    await seedDjProfile(FREE_DJ_EMAIL, "FREE", "Test Free DJ", "test-free-dj");

    console.log("\n✅ All DJ profiles seeded successfully!");
    console.log("\n📋 Summary:");
    console.log("  - Premium DJ: Full profile with all premium features");
    console.log("  - Free DJ: Basic profile with essential features");
    console.log("\n🔐 Test credentials:");
    console.log(`  Premium DJ: ${PREMIUM_DJ_EMAIL} / TestPassword123!`);
    console.log(`  Free DJ: ${FREE_DJ_EMAIL} / TestPassword123!`);
    console.log(`  Fan: ${FAN_EMAIL} / TestPassword123!`);
  } catch (error) {
    console.error("\n❌ Error seeding DJ profiles:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
