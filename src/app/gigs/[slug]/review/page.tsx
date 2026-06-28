import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getGigReviewContextBySlug } from "@/lib/queries/gigs";
import { GigReviewForm } from "@/components/reputation/GigReviewForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: `Review Gig | DJcovery` };
}

export default async function GigReviewPage({
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

  const context = await getGigReviewContextBySlug(slug, user.id);
  if (!context) return notFound();

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-6 text-gray-500 hover:text-white"
        >
          <Link href={`/gigs/${slug}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to gig
          </Link>
        </Button>

        <h1 className="mb-2 text-2xl font-bold text-white">
          Review {context.djName}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          for <span className="text-gray-300">{context.gigTitle}</span>
        </p>

        {!context.isCompleted && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="py-5">
              <p className="text-sm text-amber-300">
                This gig is not completed yet. You can leave a review once the
                gig and the hire are both marked as completed.
              </p>
            </CardContent>
          </Card>
        )}

        {context.isCompleted && context.alreadyReviewed && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="py-5">
              <p className="text-sm font-medium text-green-300">
                You have already reviewed this gig.
              </p>
            </CardContent>
          </Card>
        )}

        {context.isCompleted && !context.alreadyReviewed && (
          <>
            {context.daysRemaining !== null && context.daysRemaining <= 7 && (
              <div className="mb-4 flex items-center gap-2 text-xs text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                {context.daysRemaining} days left to review
              </div>
            )}
            <GigReviewForm
              gigId={context.gigId}
              djProfileId={context.djProfileId}
              djName={context.djName}
              gigTitle={context.gigTitle}
            />
          </>
        )}
      </div>
    </div>
  );
}
