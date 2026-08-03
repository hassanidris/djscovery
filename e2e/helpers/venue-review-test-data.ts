import prisma from "@/lib/client";

/**
 * Helper functions for setting up test data for venue review E2E tests
 * These should be called from test setup or individual tests
 */

export async function seedCompletedEventForVenueReview(
  fanEmail: string,
  djEmail: string,
) {
  // Find fan user
  const fanUser = await prisma.user.findUnique({
    where: { email: fanEmail },
  });

  if (!fanUser) {
    throw new Error(`Fan user not found for email: ${fanEmail}`);
  }

  // Find DJ profile
  const djUser = await prisma.user.findUnique({
    where: { email: djEmail },
    include: { djProfile: true },
  });

  if (!djUser?.djProfile) {
    throw new Error(`DJ profile not found for email: ${djEmail}`);
  }

  // Create a completed event
  const event = await prisma.event.create({
    data: {
      slug: `test-event-${Date.now()}`,
      title: "Test Event for Venue Review",
      eventType: "PUBLIC",
      category: "CLUB_NIGHT",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      status: "COMPLETED",
      venue: "Test Venue",
      countryId: 1, // Assuming country with ID 1 exists
      cityId: 1, // Assuming city with ID 1 exists
      ownerDjId: djUser.djProfile.id,
    },
  });

  // Create venue record
  const venue = await prisma.venue.create({
    data: {
      name: "Test Venue",
      cityId: 1,
      countryId: 1,
      source: "test",
    },
  });

  // Create attendance record
  const attendance = await prisma.eventAttendance.create({
    data: {
      eventId: event.id,
      userId: fanUser.id,
      status: "ATTENDED",
    },
  });

  return { event, venue, attendance };
}

export async function cleanupVenueReviewTestData(eventId: number) {
  // Delete in reverse order of dependencies
  await prisma.eventAttendance.deleteMany({
    where: { eventId },
  });

  await prisma.venueReview.deleteMany({
    where: { eventId },
  });

  await prisma.event.delete({
    where: { id: eventId },
  });
}

export async function cleanupVenueReviewsByUser(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (user) {
    await prisma.venueReview.deleteMany({
      where: { userId: user.id },
    });
  }
}