import prisma from "@/lib/client";

/**
 * Helper functions for setting up test data for organizer review E2E tests
 * These should be called from test setup or individual tests
 */

export async function seedCompletedGigForOrganizerReview(
  djEmail: string,
  organizerEmail: string,
) {
  // Find DJ profile
  const djUser = await prisma.user.findUnique({
    where: { email: djEmail },
    include: { djProfile: true },
  });

  if (!djUser?.djProfile) {
    throw new Error(`DJ profile not found for email: ${djEmail}`);
  }

  // Find organizer profile
  const organizerUser = await prisma.user.findUnique({
    where: { email: organizerEmail },
    include: { organizerProfile: true },
  });

  if (!organizerUser?.organizerProfile) {
    throw new Error(`Organizer profile not found for email: ${organizerEmail}`);
  }

  // Create a gig
  const gig = await prisma.gig.create({
    data: {
      slug: `test-gig-${Date.now()}`,
      organizerProfileId: organizerUser.organizerProfile.id,
      title: "Test Gig for Organizer Review",
      gigType: "CLUB",
      description: "Test gig description",
      status: "FILLED",
      eventDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      countryId: 1, // Assuming country with ID 1 exists
      cityId: 1, // Assuming city with ID 1 exists
      currency: "USD",
      budgetType: "FIXED",
      budgetMin: 500,
    },
  });

  // Create application
  const application = await prisma.gigApplication.create({
    data: {
      gigId: gig.id,
      djProfileId: djUser.djProfile.id,
      status: "ACCEPTED",
      acceptedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    },
  });

  // Create completed hire
  const hire = await prisma.hire.create({
    data: {
      applicationId: application.id,
      status: "COMPLETED",
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  return { gig, application, hire };
}

export async function cleanupOrganizerReviewTestData(gigId: number) {
  // Delete in reverse order of dependencies
  await prisma.hire.deleteMany({
    where: {
      application: { gigId },
    },
  });

  await prisma.gigApplication.deleteMany({
    where: { gigId },
  });

  await prisma.organizerReview.deleteMany({
    where: { gigId },
  });

  await prisma.gig.delete({
    where: { id: gigId },
  });
}

export async function cleanupOrganizerReviewsByDj(djEmail: string) {
  const djUser = await prisma.user.findUnique({
    where: { email: djEmail },
    include: { djProfile: true },
  });

  if (djUser?.djProfile) {
    await prisma.organizerReview.deleteMany({
      where: { djProfileId: djUser.djProfile.id },
    });
  }
}