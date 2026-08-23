import prisma from "@/lib/client";
import { geocodeCity } from "@/lib/actions/geocoding";

/**
 * Retroactively geocode existing DjVenue records that have no coordinates.
 *
 * This script is a one-time migration to fix venues added before the
 * geocoding fallback was implemented. It:
 * 1. Finds all DjVenue records with null latitude/longitude
 * 2. Geocodes their city to get approximate coordinates
 * 3. Updates the records with the city-level coordinates
 */

async function geocodeExistingVenues() {
  console.log("Finding venues without coordinates...");

  const venues = await prisma.djVenue.findMany({
    where: {
      OR: [{ latitude: null }, { longitude: null }],
    },
    include: {
      city: { include: { country: { select: { name: true } } } },
    },
  });

  console.log(`Found ${venues.length} venues without coordinates`);

  let successCount = 0;
  let failureCount = 0;

  for (const venue of venues) {
    try {
      console.log(
        `Geocoding: ${venue.venueName} in ${venue.city.name}, ${venue.city.country.name}`,
      );

      const coords = await geocodeCity(
        venue.city.name,
        venue.city.country.name,
      );

      if (coords) {
        await prisma.djVenue.update({
          where: { id: venue.id },
          data: {
            latitude: coords.lat,
            longitude: coords.lng,
            geocodedAt: new Date(),
          },
        });
        console.log(`  ✓ Updated with coordinates: ${coords.lat}, ${coords.lng}`);
        successCount++;
      } else {
        console.log(`  ✗ Failed to geocode city`);
        failureCount++;
      }

      // Rate limiting: 100ms delay between Mapbox API calls
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`  ✗ Error:`, error);
      failureCount++;
    }
  }

  console.log("\nSummary:");
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failureCount}`);
  console.log(`  Total: ${venues.length}`);
}

// Run the migration
geocodeExistingVenues()
  .then(() => {
    console.log("\nMigration complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
