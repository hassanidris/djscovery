import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/client";
import { Star, Calendar, User, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DjRatingHelpfulButton } from "@/components/reputation/DjRatingHelpfulButton";
import { DjRatingResponseDisplay } from "@/components/reputation/DjRatingResponseDisplay";
import JsonLd from "@/components/seo/JsonLd";
import { ReviewFilters } from "./ReviewFilters";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface EventReviewsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: "recent" | "helpful" | "highest" | "lowest";
    dj?: string;
  }>;
}

export async function generateMetadata({ params }: EventReviewsPageProps) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { title: true },
  });

  if (!event) return { title: "Event Not Found" };

  return {
    title: `Reviews for ${event.title} | Djscovery`,
    description: `Read all DJ reviews from ${event.title} on Djscovery. See what attendees thought about the performances.`,
  };
}

export default async function EventReviewsPage({
  params,
  searchParams,
}: EventReviewsPageProps) {
  const { slug } = await params;
  const { sort = "recent", dj: djFilter } = await searchParams;

  const event = await prisma.event.findUnique({
    where: { slug, deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      startDate: true,
      venue: true,
      city: {
        select: { name: true },
      },
      country: {
        select: { name: true },
      },
      ownerDj: {
        select: {
          id: true,
          slug: true,
          stageName: true,
          avatar: true,
        },
      },
      participants: {
        select: {
          djProfile: {
            select: {
              id: true,
              slug: true,
              stageName: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const allDjs = [event.ownerDj, ...event.participants.map((p) => p.djProfile)];

  let orderBy: any = { createdAt: "desc" };
  if (sort === "helpful") orderBy = { helpfulCount: "desc" };
  if (sort === "highest") orderBy = { rating: "desc" };
  if (sort === "lowest") orderBy = { rating: "asc" };

  let whereClause: any = { eventId: event.id };
  if (djFilter) {
    whereClause.djProfileId = parseInt(djFilter);
  }

  const reviews = await prisma.djRating.findMany({
    where: whereClause,
    orderBy,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
      djProfile: {
        select: {
          id: true,
          slug: true,
          stageName: true,
          avatar: true,
        },
      },
    },
    take: 50,
  });

  const ratingAgg = await prisma.djRating.aggregate({
    where: { eventId: event.id },
    _avg: { rating: true },
  });

  const avgRating = ratingAgg._avg.rating || 0;

  const djStats = await Promise.all(
    allDjs.map(async (dj) => {
      const stats = await prisma.djRating.aggregate({
        where: {
          eventId: event.id,
          djProfileId: dj.id,
        },
        _avg: { rating: true },
        _count: true,
      });
      return {
        ...dj,
        avgRating: stats._avg.rating || 0,
        reviewCount: stats._count,
      };
    }),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startDate.toISOString(),
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city?.name,
        addressCountry: event.country?.name,
      },
    },
    performer: allDjs.map((dj) => ({
      "@type": "Person",
      name: dj.stageName,
    })),
    review: reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.user.username,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: review.review,
      datePublished: review.createdAt.toISOString(),
      itemReviewed: {
        "@type": "Person",
        name: review.djProfile.stageName,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-gray-950">
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <Link
            href={`/events/${slug}`}
            className="mb-4 inline-flex items-center text-sm text-gray-400 hover:text-white"
          >
            ← Back to event
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Reviews for {event.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin className="h-4 w-4" />
            {event.venue}
            {event.city && <span>· {event.city.name}</span>}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Event Rating
                </h2>
                <div className="mb-4 flex items-center gap-3">
                  <div className="text-4xl font-bold text-amber-400">
                    {avgRating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(avgRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-400">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">
                  DJ Ratings
                </h2>
                <div className="space-y-3">
                  {djStats.map((dj) => (
                    <Link
                      key={dj.id}
                      href={`/djs/${dj.slug}`}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-800/50"
                    >
                      {dj.avatar && (
                        <Image
                          src={dj.avatar}
                          alt={dj.stageName}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          {dj.stageName}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {dj.avgRating.toFixed(1)} ({dj.reviewCount})
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Filter Reviews
                </h2>
                <Suspense
                  fallback={
                    <div className="text-gray-400">Loading filters...</div>
                  }
                >
                  <ReviewFilters
                    currentSort={sort}
                    currentDj={djFilter || ""}
                    allDjs={allDjs.map((dj) => ({
                      id: dj.id,
                      stageName: dj.stageName,
                    }))}
                  />
                </Suspense>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8 text-center">
                  <p className="text-gray-400">No reviews yet</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-gray-800 bg-gray-900/50 p-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {review.user.image && (
                          <Image
                            src={review.user.image}
                            alt={review.user.username}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-white">
                            {review.user.username}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <Link
                        href={`/djs/${review.djProfile.slug}`}
                        className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
                      >
                        <User className="h-3 w-3" />
                        Review for {review.djProfile.stageName}
                      </Link>
                    </div>

                    {review.review && (
                      <p className="mb-4 text-gray-300">{review.review}</p>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                      <DjRatingHelpfulButton
                        ratingId={review.id}
                        initialHelpfulCount={review.helpfulCount}
                      />
                      {review.response && (
                        <DjRatingResponseDisplay
                          response={review.response}
                          respondedAt={review.respondedAt}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
