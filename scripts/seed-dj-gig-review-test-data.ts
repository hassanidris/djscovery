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

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TEST_EMAILS = {
  PREMIUM_DJ:
    process.env.E2E_TEST_PREMIUM_DJ_EMAIL || "test-premium-dj@example.com",
  FREE_DJ: process.env.E2E_TEST_FREE_DJ_EMAIL || "test-free-dj@example.com",
  ORGANIZER:
    process.env.E2E_TEST_ORGANIZER_EMAIL || "test-organizer@example.com",
};

// Sample review texts
const SAMPLE_REVIEWS = [
  "Great experience! The organizer was very professional and communicated clearly throughout the process.",
  "Excellent gig! Everything was well-organized and the payment was prompt. Would definitely work with them again.",
  "Good overall experience. Clear instructions and fair compensation. Minor delays in setup but nothing major.",
  "Outstanding professionalism! The venue was perfect and the organizer was very supportive. Highly recommend.",
  "Solid experience. Good communication and fair terms. A bit chaotic during setup but resolved quickly.",
  "Fantastic to work with! Very organized and respectful of the DJ's time. Payment was immediate.",
  "Professional and reliable. Clear expectations and good support throughout the event.",
  "Great opportunity! The organizer was responsive and the event was well-managed. Looking forward to future collaborations.",
];

async function main() {
  // Environment guard
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
      "❌ Aborting: DJ gig review test data seeding is only permitted in local, test, or staging environments.",
    );
    process.exit(1);
  }

  console.log("Seeding DJ gig review test data...\n");

  try {
    // Find test users
    const premiumDj = await prisma.user.findUnique({
      where: { email: TEST_EMAILS.PREMIUM_DJ },
      include: { djProfile: true },
    });

    const freeDj = await prisma.user.findUnique({
      where: { email: TEST_EMAILS.FREE_DJ },
      include: { djProfile: true },
    });

    const organizer = await prisma.user.findUnique({
      where: { email: TEST_EMAILS.ORGANIZER },
      include: { organizerProfile: true },
    });

    if (
      !premiumDj?.djProfile ||
      !freeDj?.djProfile ||
      !organizer?.organizerProfile
    ) {
      console.error("❌ Test users not found. Run seed-test-users.ts first.");
      process.exit(1);
    }

    console.log("✓ Found test users");

    // Create multiple completed gigs for the organizer
    const anyCity = await prisma.city.findFirst({
      select: { id: true, countryId: true },
    });
    if (!anyCity) {
      console.error("❌ No City records found.");
      process.exit(1);
    }

    const gigTypes = [
      "CLUB",
      "WEDDING",
      "FESTIVAL",
      "PRIVATE_PARTY",
      "CORPORATE_EVENT",
    ];
    const gigTitles = [
      "Test Completed Gig for DJ Reviews",
      "Summer Festival DJ Set",
      "Wedding Reception",
      "Corporate Event",
      "Private Party",
    ];

    const gigs = [];
    for (let i = 0; i < 5; i++) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - (15 + i * 5)); // Stagger dates

      const gig = await prisma.gig.create({
        data: {
          slug: `test-gig-${Date.now()}-${i}`,
          organizerProfileId: organizer.organizerProfile.id,
          title: gigTitles[i],
          gigType: gigTypes[i] as any,
          description: `Test gig ${i + 1} for DJ review functionality`,
          status: "COMPLETED",
          eventDate,
          countryId: anyCity.countryId,
          cityId: anyCity.id,
          budgetType: i % 2 === 0 ? "FIXED" : "NEGOTIABLE",
          budgetMin: 500 + i * 100,
          currency: "SEK",
        },
      });

      gigs.push(gig);
      console.log(`✓ Created test completed gig ${i + 1}: ${gig.title}`);
    }

    // Create accepted applications and completed hires for DJs on each gig
    const djs = [premiumDj.djProfile, freeDj.djProfile];
    for (let gigIndex = 0; gigIndex < gigs.length; gigIndex++) {
      const gig = gigs[gigIndex];
      // Assign different DJs to different gigs for variety
      const assignedDjs =
        gigIndex % 2 === 0 ? djs : [djs[gigIndex % djs.length]];

      for (const djProfile of assignedDjs) {
        let application = await prisma.gigApplication.findUnique({
          where: {
            gigId_djProfileId: {
              gigId: gig.id,
              djProfileId: djProfile.id,
            },
          },
          include: { hire: true },
        });

        if (!application) {
          application = await prisma.gigApplication.create({
            data: {
              gigId: gig.id,
              djProfileId: djProfile.id,
              status: "ACCEPTED",
              acceptedAt: new Date(),
            },
            include: { hire: true },
          });

          // Create completed hire
          await prisma.hire.create({
            data: {
              applicationId: application.id,
              status: "COMPLETED",
              completedAt: new Date(),
            },
          });

          console.log(
            `✓ Created application and hire for ${djProfile.stageName} on ${gig.title}`,
          );
        } else if (!application.hire) {
          // Create hire if missing
          await prisma.hire.create({
            data: {
              applicationId: application.id,
              status: "COMPLETED",
              completedAt: new Date(),
            },
          });
          console.log(
            `✓ Created hire for ${djProfile.stageName} on ${gig.title}`,
          );
        } else if (application.hire.status !== "COMPLETED") {
          // Update hire to completed
          await prisma.hire.update({
            where: { id: application.hire.id },
            data: { status: "COMPLETED", completedAt: new Date() },
          });
          console.log(
            `✓ Updated hire to COMPLETED for ${djProfile.stageName} on ${gig.title}`,
          );
        }
      }
    }

    // Create DJ gig reviews for each gig
    let totalReviewsCreated = 0;
    for (let gigIndex = 0; gigIndex < gigs.length; gigIndex++) {
      const gig = gigs[gigIndex];
      const assignedDjs =
        gigIndex % 2 === 0 ? djs : [djs[gigIndex % djs.length]];

      for (const djProfile of assignedDjs) {
        const existingReview = await prisma.djGigReview.findUnique({
          where: {
            gigId_djProfileId: {
              gigId: gig.id,
              djProfileId: djProfile.id,
            },
          },
        });

        if (!existingReview) {
          const randomRating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
          const randomReview =
            SAMPLE_REVIEWS[Math.floor(Math.random() * SAMPLE_REVIEWS.length)];

          await prisma.djGigReview.create({
            data: {
              gigId: gig.id,
              djProfileId: djProfile.id,
              organizerId: organizer.id,
              rating: randomRating,
              review: randomReview,
              ipAddress: "127.0.0.1",
              userAgent: "Test Script",
            },
          });

          totalReviewsCreated++;
          console.log(
            `✓ Created DJ gig review for ${djProfile.stageName} on ${gig.title} (${randomRating} stars)`,
          );
        } else {
          console.log(
            `✓ DJ gig review already exists for ${djProfile.stageName} on ${gig.title}`,
          );
        }
      }
    }

    // Create one more gig with a recent completion for testing review window
    const recentGig = await prisma.gig.create({
      data: {
        slug: `test-recent-gig-${Date.now()}`,
        organizerProfileId: organizer.organizerProfile.id,
        title: "Test Recent Gig for Review Window",
        gigType: "WEDDING",
        description: "Test gig for review window functionality",
        status: "COMPLETED",
        eventDate: new Date(),
        countryId: organizer.organizerProfile.countryId!,
        cityId: organizer.organizerProfile.cityId!,
        budgetType: "NEGOTIABLE",
        currency: "SEK",
      },
    });

    const recentApplication = await prisma.gigApplication.create({
      data: {
        gigId: recentGig.id,
        djProfileId: premiumDj.djProfile.id,
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    await prisma.hire.create({
      data: {
        applicationId: recentApplication.id,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    console.log("✓ Created recent completed gig for review window testing");

    console.log("\n✅ DJ gig review test data seeded successfully!");
    console.log("\nTest data summary:");
    console.log(`- Completed gigs: ${gigs.length}`);
    console.log(`- Recent gig: ${recentGig.slug}`);
    console.log(`- DJ reviews: ${totalReviewsCreated}`);
    console.log(`- Test users: ${Object.values(TEST_EMAILS).join(", ")}`);
  } catch (error) {
    console.error("❌ Error seeding DJ gig review test data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
