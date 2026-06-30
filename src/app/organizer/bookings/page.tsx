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

export const metadata = { title: "My Booking Threads — DJcovery" };

export default async function OrganizerBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!organizerProfile) redirect("/become-organizer");

  const inquiries = (await prismaUnsafe.bookingInquiry.findMany({
    where: { organizerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      djProfile: {
        select: {
          id: true,
          stageName: true,
          slug: true,
          bookingEmail: true,
          user: { select: { id: true, email: true, name: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, email: true } } },
      },
    },
  })) as any[];

  const viewModels: BookingInquiryViewModel[] = inquiries.map((inquiry) => {
    const djContactEmail =
      inquiry.djProfile.bookingEmail ?? inquiry.djProfile.user.email;
    const contactVisible = Boolean(inquiry.contactReleasedAt);

    const messages: BookingMessage[] = (inquiry.messages ?? []).map(
      (message: any) => ({
        id: message.id,
        body: message.body,
        senderRole: message.senderRole,
        senderName:
          message.sender?.name ??
          message.sender?.email ??
          (message.senderRole === "DJ"
            ? inquiry.djProfile.stageName
            : "Organizer"),
        createdAt: message.createdAt.toISOString(),
      }),
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
      counterpartyName: inquiry.djProfile.stageName,
      counterpartyEmail: contactVisible ? djContactEmail : undefined,
      contactVisible,
      messages,
    };
  });

  const active = viewModels.filter(
    (i) => i.status === "PENDING" || i.status === "ACCEPTED",
  );
  const archived = viewModels.filter(
    (i) => i.status === "DECLINED" || i.status === "CANCELLED",
  );

  const emptyState = viewModels.length === 0;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Badge className="bg-h_red/20 text-h_red text-xs tracking-widest uppercase">
          Bookings
        </Badge>
        <h1 className="text-2xl font-bold text-white">Booking Threads</h1>
        <p className="text-sm text-gray-400">
          Follow up with DJs, track responses, and keep all pre-event logistics
          in one conversation.
        </p>
      </div>

      {emptyState ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-24 text-center">
          <h2 className="text-lg font-semibold text-white">
            No booking conversations yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Submit a booking request from a DJ profile and the thread will
            appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold tracking-wider text-emerald-300 uppercase">
                Active ({active.length})
              </h2>
              <div className="space-y-5">
                {active.map((inquiry) => (
                  <BookingInquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    viewerRole="ORGANIZER"
                  />
                ))}
              </div>
            </section>
          )}

          {archived.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                Archived ({archived.length})
              </h2>
              <div className="space-y-5">
                {archived.map((inquiry) => (
                  <BookingInquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    viewerRole="ORGANIZER"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
