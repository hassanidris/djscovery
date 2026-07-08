import prisma from "../src/lib/client";

/**
 * Migration script to convert featuredMix/featuredVideo data from DjProfile to Media table
 * IMPORTANT: This must be run BEFORE pushing the schema changes that remove the featured fields
 * Run with: npx tsx prisma/migrate-featured-to-media.ts
 *
 * If the schema has already been pushed, this script will fail because the columns no longer exist.
 * In that case, you need to restore from a database backup that still has the old columns.
 */

async function migrateFeaturedToMedia() {
  console.log(
    "Starting migration of featuredMix/featuredVideo to Media table...",
  );

  // Use raw SQL to query the old columns before they're removed
  const profiles = await prisma.$queryRaw<
    Array<{
      id: number;
      stageName: string;
      featuredMixAudioUrl: string | null;
      featuredMixTitle: string | null;
      featuredMixDuration: string | null;
      featuredVideoUrl: string | null;
      featuredVideoTitle: string | null;
      featuredVideoDuration: string | null;
      featuredVideoThumbnail: string | null;
    }>
  >`
    SELECT
      id,
      stageName,
      "featuredMixAudioUrl",
      "featuredMixTitle",
      "featuredMixDuration",
      "featuredVideoUrl",
      "featuredVideoTitle",
      "featuredVideoDuration",
      "featuredVideoThumbnail"
    FROM "DjProfile"
    WHERE "featuredMixAudioUrl" IS NOT NULL OR "featuredVideoUrl" IS NOT NULL
  `;

  console.log(`Found ${profiles.length} profiles with featured content`);

  if (profiles.length === 0) {
    console.log("No profiles with featured content found. Migration complete.");
    return;
  }

  let migratedMixes = 0;
  let migratedVideos = 0;
  let errors = 0;

  for (const profile of profiles) {
    try {
      const mediaToCreate = [];
      let sortOrder = 0;

      // Migrate featured mix
      if (profile.featuredMixAudioUrl) {
        mediaToCreate.push({
          type: "AUDIO" as const,
          url: profile.featuredMixAudioUrl,
          bucket: "external",
          path: profile.featuredMixAudioUrl,
          djProfileId: profile.id,
          sortOrder: sortOrder++,
          isSpotlight: true,
          title: profile.featuredMixTitle,
          duration: profile.featuredMixDuration,
          thumbnail: null,
        });
        migratedMixes++;
      }

      // Migrate featured video
      if (profile.featuredVideoUrl) {
        mediaToCreate.push({
          type: "VIDEO" as const,
          url: profile.featuredVideoUrl,
          bucket: "external",
          path: profile.featuredVideoUrl,
          djProfileId: profile.id,
          sortOrder: sortOrder++,
          isSpotlight: true,
          title: profile.featuredVideoTitle,
          duration: profile.featuredVideoDuration,
          thumbnail: profile.featuredVideoThumbnail,
        });
        migratedVideos++;
      }

      if (mediaToCreate.length > 0) {
        await prisma.media.createMany({
          data: mediaToCreate,
          skipDuplicates: true,
        });
        console.log(
          `✓ Migrated ${mediaToCreate.length} items for profile: ${profile.stageName}`,
        );
      }
    } catch (error) {
      console.error(`✗ Error migrating profile ${profile.stageName}:`, error);
      errors++;
    }
  }

  console.log("\n=== Migration Summary ===");
  console.log(`Migrated mixes: ${migratedMixes}`);
  console.log(`Migrated videos: ${migratedVideos}`);
  console.log(`Errors: ${errors}`);
  console.log("\nMigration complete!");
  console.log(
    "\nNow you can safely push the schema changes to remove the old featured fields.",
  );
}

migrateFeaturedToMedia()
  .then(() => {
    console.log("Script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    console.error("\nIf the script failed because the columns don't exist,");
    console.error(
      "you need to restore from a database backup that still has the old schema.",
    );
    process.exit(1);
  });
