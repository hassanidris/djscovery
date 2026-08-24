import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getGigApplicants } from "@/lib/queries/gigs";
import { GigApplicationStatusBadge } from "@/components/gigs/GigStatusBadge";
import { GenreBadge } from "@/components/forms/GenreBadge";
import { updateApplicationStatus } from "@/lib/actions/gigs";

export default async function GigApplicantsPage({
  params,
}: {
  params: Promise<{ gigId: string }>;
}) {
  const { gigId: gigIdRaw } = await params;
  const gigId = parseInt(gigIdRaw, 10);
  if (isNaN(gigId)) return notFound();

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

  const result = await getGigApplicants(gigId, orgProfile.id);
  if (!result) return notFound();

  const { gig, applications } = result;

  const active = applications.filter((a) =>
    ["APPLIED", "SHORTLISTED"].includes(a.status),
  );
  const decided = applications.filter((a) =>
    ["ACCEPTED", "REJECTED", "WITHDRAWN"].includes(a.status),
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <div className="mb-6">
          <Link
            href={`/organizer/gigs/${gigId}`}
            className="mb-4 flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Gig
          </Link>
          <h1 className="text-2xl font-bold text-white">Applicants</h1>
          <p className="text-muted-foreground mt-1 truncate text-sm">
            {gig.title} · {applications.length} total
          </p>
        </div>

        {applications.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-20 text-center">
            <UserCircle2 className="mb-4 h-10 w-10 text-gray-700" />
            <p className="font-semibold text-white">No applicants yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Share your gig to start receiving applications.
            </p>
          </div>
        )}

        {/* Active applications */}
        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
              Pending Review ({active.length})
            </h2>
            <div className="flex flex-col gap-3">
              {active.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    {app.djProfile.avatar ? (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={app.djProfile.avatar}
                          alt={app.djProfile.stageName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg">
                        🎧
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/djs/${app.djProfile.slug}`}
                          target="_blank"
                          className="font-medium text-white hover:underline"
                        >
                          {app.djProfile.stageName}
                        </Link>
                        <GigApplicationStatusBadge status={app.status} />
                      </div>

                      {(app.djProfile.city?.name ||
                        app.djProfile.country?.name) && (
                        <p className="text-xs text-gray-400">
                          {[
                            app.djProfile.city?.name,
                            app.djProfile.country?.name,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}

                      {app.djProfile.genres.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {app.djProfile.genres.slice(0, 4).map((g) => (
                            <GenreBadge key={g.genre.name} variant="gray">
                              {g.genre.name}
                            </GenreBadge>
                          ))}
                        </div>
                      )}

                      {app.message && (
                        <p className="mt-2 max-w-md text-sm text-gray-400">
                          {app.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons — wired to server action via form */}
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {app.status === "APPLIED" && (
                      <form
                        action={async () => {
                          "use server";
                          await updateApplicationStatus({
                            applicationId: app.id,
                            status: "SHORTLISTED",
                          });
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-lg border border-blue-500/30 px-3 py-1.5 text-xs text-blue-400 transition-colors hover:bg-blue-500/10"
                        >
                          Shortlist
                        </button>
                      </form>
                    )}
                    <form
                      action={async () => {
                        "use server";
                        await updateApplicationStatus({
                          applicationId: app.id,
                          status: "ACCEPTED",
                        });
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-500"
                      >
                        Accept
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await updateApplicationStatus({
                          applicationId: app.id,
                          status: "REJECTED",
                        });
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/5"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Decided applications */}
        {decided.length > 0 && (
          <section>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
              Decided ({decided.length})
            </h2>
            <div className="flex flex-col gap-3">
              {decided.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-5 py-3"
                >
                  {app.djProfile.avatar ? (
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={app.djProfile.avatar}
                        alt={app.djProfile.stageName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">
                      🎧
                    </div>
                  )}
                  <Link
                    href={`/djs/${app.djProfile.slug}`}
                    target="_blank"
                    className="flex-1 text-sm text-gray-400 hover:text-white"
                  >
                    {app.djProfile.stageName}
                  </Link>
                  <GigApplicationStatusBadge status={app.status} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
