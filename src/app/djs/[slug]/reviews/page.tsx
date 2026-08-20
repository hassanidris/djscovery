import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/client";
import { Star, Calendar, User, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DjRatingHelpfulButton } from "@/components/reputation/DjRatingHelpfulButton";
import { DjRatingResponseDisplay } from "@/components/reputation/DjRatingResponseDisplay";
import JsonLd from "@/components/seo/JsonLd";
import { ReviewFilters } from "./ReviewFilters";
import { Suspense } from "react";
import { formatDate } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

interface ReviewsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: "recent" | "helpful" | "highest" | "lowest";
    type?: "all" | "direct" | "event";
  }>;
}

export async function generateMetadata({ params }: ReviewsPageProps) {
  const { slug } = await params;
  const djProfile = await prisma.djProfile.findUnique({
    where: { slug },
    select: { stageName: true },
  });

  if (!djProfile) return { title: "DJ Not Found" };

  return {
    title: `Reviews for ${djProfile.stageName} | Djscovery`,
    description: `Read all reviews for ${djProfile.stageName} on Djscovery. See what fans, event attendees, and organizers have to say.`,
  };
}

export default async function ReviewsPage({
  params,
  searchParams,
}: ReviewsPageProps) {
  const { slug } = await params;
  const { sort = "recent", type = "all" } = await searchParams;

  const djProfile = await prisma.djProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      stageName: true,
      avatar: true,
      bio: true,
      _count: {
        select: { ratings: true },
      },
    },
  });

  if (!djProfile) {
    notFound();
  }

  const ratingAgg = await prisma.djRating.aggregate({
    where: { djProfileId: djProfile.id },
    _avg: { rating: true },
  });

  const avgRating = ratingAgg._avg.rating || 0;

  let orderBy: any = { createdAt: "desc" };
  if (sort === "helpful") orderBy = { helpfulCount: "desc" };
  if (sort === "highest") orderBy = { rating: "desc" };
  if (sort === "lowest") orderBy = { rating: "asc" };

  let whereClause: any = { djProfileId: djProfile.id };
  if (type === "direct") whereClause.eventId = null;
  if (type === "event") whereClause.eventId = { not: null };

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
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
          startDate: true,
        },
      },
    },
    take: 50,
  });

  const ratingDistribution = await prisma.djRating.groupBy({
    by: ["rating"],
    where: { djProfileId: djProfile.id },
    _count: true,
  });

  const distribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: ratingDistribution.find((r) => r.rating === rating)?._count || 0,
    percentage:
      djProfile._count.ratings > 0
        ? ((ratingDistribution.find((r) => r.rating === rating)?._count || 0) /
            djProfile._count.ratings) *
          100
        : 0,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: djProfile.stageName,
    description: djProfile.bio,
    image: djProfile.avatar,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: djProfile._count.ratings,
      bestRating: "5",
      worstRating: "1",
    },
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
    })),
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-gray-950">
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <Link
            href={`/djs/${slug}`}
            className="mb-4 inline-flex items-center text-sm text-gray-400 hover:text-white"
          >
            ← Back to profile
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Reviews for {djProfile.stageName}
          </h1>
          <p className="text-gray-400">
            {djProfile._count.ratings} review
            {djProfile._count.ratings !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Rating Summary
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
                      {djProfile._count.ratings} reviews
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {distribution.reverse().map((d) => (
                    <div key={d.rating} className="flex items-center gap-2">
                      <span className="w-6 text-sm text-gray-400">
                        {d.rating}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-gray-800">
                        <div
                          className="h-2 rounded-full bg-amber-400"
                          style={{ width: `${d.percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm text-gray-400">
                        {d.count}
                      </span>
                    </div>
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
                  <ReviewFilters currentSort={sort} currentType={type} />
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
                            {formatDate(review.createdAt)}
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

                    {review.event && (
                      <div className="mb-3">
                        <Link
                          href={`/events/${review.event.slug}`}
                          className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
                        >
                          <User className="h-3 w-3" />
                          {review.event.title}
                        </Link>
                      </div>
                    )}

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
