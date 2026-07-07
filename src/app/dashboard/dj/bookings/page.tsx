import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import {
  BookingInquiryCard,
  type BookingInquiryViewModel,
  type BookingMessage,
} from "@/components/booking/BookingInquiryCard";
import { Badge } from "@/components/ui/badge";

const prismaUnsafe = prisma as Record<string, any>;

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

  const inquiries = (await prismaUnsafe.bookingInquiry.findMany({
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
  })) as any[];

  const viewModels: BookingInquiryViewModel[] = inquiries.map((inquiry) => {
    const organizerProfile = inquiry.organizer.organizerProfile;
    const organizerDisplayName =
      organizerProfile?.displayName ?? inquiry.organizer.name ?? "Organizer";
    const contactVisible = Boolean(inquiry.contactReleasedAt);
    const organizerEmail = contactVisible
      ? (organizerProfile?.contactEmail ?? inquiry.organizer.email ?? undefined)
      : undefined;

    const messages: BookingMessage[] = (inquiry.messages ?? []).map(
      (message: any) => {
        const fallbackRoleName =
          message.senderRole === "DJ" ? "DJ" : "Organizer";
        const senderName =
          message.sender?.name?.trim() !== ""
            ? message.sender.name
            : fallbackRoleName;

        return {
          id: message.id,
          body: message.body,
          senderRole: message.senderRole,
          senderName,
          createdAt: message.createdAt.toISOString(),
        } satisfies BookingMessage;
      },
    );

    return {
      id: inquiry.id,
      status: inquiry.status,
      eventName: inquiry.eventName,
      eventDate: inquiry.eventDate
        ? new Date(inquiry.eventDate).toISOString()
        : null,
      venue: inquiry.venue,
      city: [inquiry.cityName, inquiry.countryName].filter(Boolean).join(", "),
      createdAt: inquiry.createdAt.toISOString(),
      lastRespondedAt: inquiry.lastRespondedAt
        ? inquiry.lastRespondedAt.toISOString()
        : null,
      counterpartyName: organizerDisplayName,
      counterpartyEmail: organizerEmail,
      contactVisible,
      messages,
      packageName: inquiry.packageName,
      packagePrice: inquiry.packagePrice,
      packagePriceTo: inquiry.packagePriceTo,
    };
  });

  const pending = viewModels.filter((i) => i.status === "PENDING");
  const accepted = viewModels.filter((i) => i.status === "ACCEPTED");
  const declined = viewModels.filter(
    (i) => i.status === "DECLINED" || i.status === "CANCELLED",
  );

  const emptyState = viewModels.length === 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <div className="mb-8 space-y-2">
          <Badge className="bg-h_red/20 text-h_red text-xs tracking-widest uppercase">
            Bookings
          </Badge>
          <h1 className="text-2xl font-bold text-white">Booking Requests</h1>
          <p className="text-sm text-gray-400">
            Manage inbound booking inquiries, respond to organizers, and keep
            the conversation flowing in one place.
          </p>
        </div>

        {emptyState ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-24 text-center">
            <h2 className="text-lg font-semibold text-white">
              No booking inquiries yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              When organizers send a booking request it will appear here for you
              to accept, decline, or message back.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold tracking-wider text-amber-300 uppercase">
                  Pending ({pending.length})
                </h2>
                <div className="space-y-5">
                  {pending.map((inquiry) => (
                    <BookingInquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      viewerRole="DJ"
                    />
                  ))}
                </div>
              </section>
            )}

            {accepted.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold tracking-wider text-emerald-300 uppercase">
                  Accepted ({accepted.length})
                </h2>
                <div className="space-y-5">
                  {accepted.map((inquiry) => (
                    <BookingInquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      viewerRole="DJ"
                    />
                  ))}
                </div>
              </section>
            )}

            {declined.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                  Past ({declined.length})
                </h2>
                <div className="space-y-5">
                  {declined.map((inquiry) => (
                    <BookingInquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      viewerRole="DJ"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
