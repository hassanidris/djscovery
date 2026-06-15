import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getOrganizerGigs } from "@/lib/queries/gigs";
import { OrganizerGigCard } from "@/components/gigs/GigCard";

export default async function OrganizerGigListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, deletedAt: true },
  });
  if (!orgProfile || orgProfile.status !== "ACTIVE" || orgProfile.deletedAt !== null)
    redirect("/become-organizer");

  const gigs = await getOrganizerGigs(orgProfile.id);

  const active = gigs.filter((g) => g.status === "PUBLISHED" || g.status === "UNDER_REVIEW");
  const drafts = gigs.filter((g) => g.status === "DRAFT");
  const closed = gigs.filter((g) =>
    ["FILLED", "CANCELLED", "EXPIRED"].includes(g.status),
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Gigs</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {gigs.length === 0
                ? "No gigs yet — post your first one."
                : `${active.length} active · ${drafts.length} draft${drafts.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            href="/dashboard/organizer/gigs/new"
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
            <p className="text-muted-foreground mb-6 text-sm">
              Post your first gig to start finding DJs.
            </p>
            <Link
              href="/dashboard/organizer/gigs/new"
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              <Plus className="h-4 w-4" />
              Post a Gig
            </Link>
          </div>
        )}

        {/* Active gigs */}
        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
              Active
            </h2>
            <div className="flex flex-col gap-3">
              {active.map((gig) => (
                <OrganizerGigCard key={gig.id} gig={gig} />
              ))}
            </div>
          </section>
        )}

        {/* Drafts */}
        {drafts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
              Drafts
            </h2>
            <div className="flex flex-col gap-3">
              {drafts.map((gig) => (
                <OrganizerGigCard key={gig.id} gig={gig} />
              ))}
            </div>
          </section>
        )}

        {/* Closed / past */}
        {closed.length > 0 && (
          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
              Past
            </h2>
            <div className="flex flex-col gap-3">
              {closed.map((gig) => (
                <OrganizerGigCard key={gig.id} gig={gig} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
