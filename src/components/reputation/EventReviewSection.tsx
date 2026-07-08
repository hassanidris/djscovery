import { EventReviewForm } from "./EventReviewForm";

export type ReviewableDj = {
  djProfileId: number;
  slug: string;
  stageName: string;
  avatar: string | null;
};

export function EventReviewSection({
  eventId,
  djs,
  reviewedDjIds,
  isOrganizer = false,
}: {
  eventId: number;
  djs: ReviewableDj[];
  reviewedDjIds: number[];
  isOrganizer?: boolean;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
        Review the DJs
      </h2>
      <div className="space-y-4">
        {djs.map((dj) => (
          <EventReviewForm
            key={dj.djProfileId}
            eventId={eventId}
            djProfileId={dj.djProfileId}
            djName={dj.stageName}
            djAvatar={dj.avatar}
            alreadyReviewed={reviewedDjIds.includes(dj.djProfileId)}
            isOrganizer={isOrganizer}
          />
        ))}
      </div>
    </section>
  );
}
