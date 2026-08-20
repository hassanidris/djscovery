import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getOrganizerGigs } from "@/lib/queries/gigs";
import { MemoizedOrganizerGigCard } from "@/components/gigs/GigCard";

export const metadata: Metadata = { title: "My Gigs" };

export default async function OrganizerGigsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, deletedAt: true },
  });
  if (
    !orgProfile ||
    orgProfile.status !== "ACTIVE" ||
    orgProfile.deletedAt !== null
  )
    redirect("/become-organizer");

  const gigs = await getOrganizerGigs(orgProfile.id);

  const active = gigs.filter(
    (g) => g.status === "PUBLISHED" || g.status === "UNDER_REVIEW",
  );
  const drafts = gigs.filter((g) => g.status === "DRAFT");
  const closed = gigs.filter((g) =>
    ["FILLED", "CANCELLED", "EXPIRED"].includes(g.status),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">My Gigs</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {gigs.length === 0
              ? "No gigs yet — post your first one."
              : `${active.length} active · ${drafts.length} draft${drafts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/organizer/gigs/new"
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          Post a Gig
        </Link>
      </div>

      {/* Empty state */}
      {gigs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-20 text-center">
          <Briefcase className="mb-4 h-10 w-10 text-gray-700" />
          <p className="mb-1 font-semibold text-white">No gigs yet</p>
          <p className="text-muted-foreground text-sm">
            Use the <span className="text-white">Post a Gig</span> button above
            to get started.
          </p>
        </div>
      )}

      {/* Active gigs */}
      {active.length > 0 && (
        <section>
          <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Active
          </h3>
          <div className="flex flex-col gap-3">
            {active.map((gig) => (
              <MemoizedOrganizerGigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </section>
      )}

      {/* Drafts */}
      {drafts.length > 0 && (
        <section>
          <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Drafts
          </h3>
          <div className="flex flex-col gap-3">
            {drafts.map((gig) => (
              <MemoizedOrganizerGigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </section>
      )}

      {/* Closed / past */}
      {closed.length > 0 && (
        <section>
          <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Past
          </h3>
          <div className="flex flex-col gap-3">
            {closed.map((gig) => (
              <MemoizedOrganizerGigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
