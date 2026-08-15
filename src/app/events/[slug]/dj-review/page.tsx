import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import ReviewWindowClient from "@/components/reviews/ReviewWindowClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: `Review DJs | DJcovery` };
}

export default async function EventDjReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      endDate: true,
      ownerDj: {
        select: {
          id: true,
          stageName: true,
          slug: true,
          avatar: true,
        },
      },
      participants: {
        select: {
          djProfile: {
            select: {
              id: true,
              stageName: true,
              slug: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!event) return notFound();

  if (event.status !== "COMPLETED") {
    return (
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-6 text-gray-400 hover:text-white"
          >
            <Link href={`/events/${slug}`}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to event
            </Link>
          </Button>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="py-5">
              <p className="text-sm text-amber-300">
                This event is not completed yet. You can leave a review once the
                event is marked as completed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const attendance = await prisma.eventAttendance.findUnique({
    where: {
      eventId_userId: {
        eventId: event.id,
        userId: user.id,
      },
    },
    select: { status: true },
  });

  if (!attendance || attendance.status !== "ATTENDED") {
    return (
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-6 text-gray-400 hover:text-white"
          >
            <Link href={`/events/${slug}`}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to event
            </Link>
          </Button>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="py-5">
              <p className="text-sm text-amber-300">
                You can only review DJs for events you have attended.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const allDjs = [event.ownerDj, ...event.participants.map((p) => p.djProfile)];

  const existingReviews = await prisma.djRating.findMany({
    where: {
      eventId: event.id,
      userId: user.id,
    },
    select: {
      djProfileId: true,
      rating: true,
      review: true,
    },
  });

  const completedAtIso = event.endDate?.toISOString() ?? null;

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-6 text-gray-400 hover:text-white"
        >
          <Link href={`/events/${slug}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to event
          </Link>
        </Button>

        <h1 className="mb-2 text-2xl font-bold text-white">
          Review DJs from {event.title}
        </h1>
        <p className="mb-6 text-sm text-gray-400">
          Share your experience with the performers
        </p>

        <ReviewWindowClient
          completedAt={completedAtIso}
          event={{
            id: event.id,
            title: event.title,
            slug: event.slug,
          }}
          allDjs={allDjs}
          existingReviews={existingReviews}
        />
      </div>
    </div>
  );
}
