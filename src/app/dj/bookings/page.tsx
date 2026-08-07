import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import {
  type BookingInquiryViewModel,
  type BookingMessage,
} from "@/components/booking/BookingInquiryCard";
import DjBookingsTabs from "@/components/dj/DjBookingsTabs";

export const metadata = { title: "Booking Requests — DJcovery" };

export default async function DjBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!djProfile) redirect("/become-dj");

  const inquiries = await prisma.bookingInquiry.findMany({
    where: { djProfileId: djProfile.id },
    orderBy: { createdAt: "desc" },
    include: {
      organizer: {
        select: {
          id: true,
          email: true,
          name: true,
          organizerProfile: {
            select: { displayName: true, contactEmail: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  const viewModels: BookingInquiryViewModel[] = inquiries.map((inquiry) => {
    const organizerProfile = inquiry.organizer.organizerProfile;
    const organizerDisplayName =
      organizerProfile?.displayName ?? inquiry.organizer.name ?? "Organizer";
    const contactVisible = Boolean(inquiry.contactReleasedAt);
    const organizerEmail = contactVisible
      ? (organizerProfile?.contactEmail ?? inquiry.organizer.email ?? undefined)
      : undefined;

    const messages: BookingMessage[] = inquiry.messages.map((message) => {
      const fallbackRoleName = message.senderRole === "DJ" ? "DJ" : "Organizer";
      const senderName = message.sender?.name?.trim() || fallbackRoleName;

      return {
        id: message.id,
        body: message.body,
        senderRole: message.senderRole,
        senderName,
        createdAt: message.createdAt.toISOString(),
      };
    });

    return {
      id: inquiry.id,
      status: inquiry.status,
      eventName: inquiry.eventName,
      eventDate: inquiry.eventDate?.toISOString() ?? null,
      venue: inquiry.venue,
      city: [inquiry.cityName, inquiry.countryName].filter(Boolean).join(", "),
      createdAt: inquiry.createdAt.toISOString(),
      lastRespondedAt: inquiry.lastRespondedAt?.toISOString() ?? null,
      counterpartyName: organizerDisplayName,
      counterpartyEmail: organizerEmail,
      contactVisible,
      messages,
      packageName: inquiry.packageName,
      packagePrice: inquiry.packagePrice,
      packagePriceTo: inquiry.packagePriceTo,
    };
  });

  const emptyState = viewModels.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 space-y-2">
        <h1 className="text-2xl font-bold text-white">Booking Requests</h1>
        <p className="text-sm text-gray-400">
          Manage inbound booking inquiries, respond to organizers, and keep the
          conversation flowing in one place.
        </p>
      </div>

      {emptyState ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-24 text-center">
          <h2 className="text-lg font-semibold text-white">
            No booking inquiries yet
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            When organizers send a booking request it will appear here for you
            to accept, decline, or message back.
          </p>
        </div>
      ) : (
        <DjBookingsTabs inquiries={viewModels} />
      )}
    </div>
  );
}
