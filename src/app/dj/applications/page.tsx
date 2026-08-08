import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getDjApplications } from "@/lib/queries/gigs";
import {
  GigStatusBadge,
  GigApplicationStatusBadge,
} from "@/components/gigs/GigStatusBadge";
import { GIG_TYPE_FIELDS } from "@/config/gig-type-fields";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Applications — DJcovery" };

export default async function DjApplicationsPage() {
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

  const applications = await getDjApplications(djProfile.id);

  const active = applications.filter((a) =>
    ["APPLIED", "SHORTLISTED"].includes(a.status),
  );
  const accepted = applications.filter((a) => a.status === "ACCEPTED");
  const past = applications.filter((a) =>
    ["REJECTED", "WITHDRAWN"].includes(a.status),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 space-y-2">
        <h1 className="text-2xl font-bold text-white">My Applications</h1>
        <p className="text-muted-foreground text-sm">
          {applications.length === 0
            ? "No applications yet."
            : `${active.length} pending · ${accepted.length} accepted`}
        </p>
      </div>

      {applications.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-24 text-center">
          <FileText className="mb-4 h-10 w-10 text-gray-700" />
          <p className="font-semibold text-white">No applications yet</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Browse gigs and apply when you find a great fit.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/gigs">Browse Gigs</Link>
          </Button>
        </div>
      )}

      {accepted.length > 0 && (
        <section>
          <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Accepted 🎉
          </h2>
          <div className="flex flex-col gap-3">
            {accepted.map((app) => (
              <ApplicationRow key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Under Review
          </h2>
          <div className="flex flex-col gap-3">
            {active.map((app) => (
              <ApplicationRow key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Past
          </h2>
          <div className="flex flex-col gap-3">
            {past.map((app) => (
              <ApplicationRow key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

type AppItem = Awaited<ReturnType<typeof getDjApplications>>[number];

function ApplicationRow({ app }: { app: AppItem }) {
  const typeLabel = GIG_TYPE_FIELDS[app.gig.gigType].label;
  const location = [app.gig.city?.name, app.gig.country?.name]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/gigs/${app.gig.slug}`}
      className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20 hover:bg-white/3"
    >
      {app.gig.organizerProfile.logoUrl ? (
        <div className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full">
          <Image
            src={app.gig.organizerProfile.logoUrl}
            alt={app.gig.organizerProfile.displayName}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-base">
          🎪
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium text-white">
            {app.gig.title}
          </span>
          <GigApplicationStatusBadge status={app.status} />
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span>{typeLabel}</span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {new Date(app.gig.eventDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {app.gig.organizerProfile.displayName}
          </span>
          <GigStatusBadge status={app.gig.status} />
        </div>
      </div>
    </Link>
  );
}
