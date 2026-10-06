import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FoundingApplicationControls from "@/components/admin/FoundingApplicationControls";
import { getFoundingApplicationDetail } from "@/lib/actions/admin/founding-applications";
import type { FoundingApplicationStatus } from "@prisma/client";

const STATUS_STYLES: Record<FoundingApplicationStatus, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  EMAIL_VERIFIED: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  UNDER_REVIEW: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  APPROVED: "border-green-500/30 bg-green-500/10 text-green-300",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-300",
  WITHDRAWN: "border-gray-500/30 bg-gray-500/10 text-gray-300",
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

function titleCaseStatus(status: FoundingApplicationStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/8 bg-white/2 p-5">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-300 uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}): Promise<Metadata> {
  const { applicationId } = await params;
  const application = await getFoundingApplicationDetail(Number(applicationId));
  return {
    title: application
      ? `${application.name} · Founding Application`
      : "Founding Application",
  };
}

export default async function FoundingApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId: rawId } = await params;
  const applicationId = Number(rawId);
  const application = await getFoundingApplicationDetail(applicationId);
  if (!application) notFound();

  const socialLinks =
    application.socialLinks &&
    typeof application.socialLinks === "object" &&
    !Array.isArray(application.socialLinks)
      ? Object.entries(
          application.socialLinks as Record<string, unknown>,
        ).filter(
          (entry): entry is [string, string] =>
            typeof entry[1] === "string" && entry[1].trim().length > 0,
        )
      : [];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/founding/applications"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to applications
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-h_redLight text-xs font-semibold tracking-[0.18em] uppercase">
            Founding DJ application · #{application.id}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {application.stageName || application.name}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Submitted {format(application.submittedAt, "PPP 'at' p")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`border ${STATUS_STYLES[application.status]}`}>
            {titleCaseStatus(application.status)}
          </Badge>
          <Badge
            className={
              application.emailVerifiedAt
                ? "border border-green-500/30 bg-green-500/10 text-green-300"
                : "border border-amber-500/30 bg-amber-500/10 text-amber-300"
            }
          >
            {application.emailVerifiedAt
              ? "Email verified"
              : "Email unverified"}
          </Badge>
        </div>
      </header>

      {application.status === "REJECTED" && application.reviewedAt && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200">
          Reapplication cooldown ends{" "}
          {format(
            new Date(
              application.reviewedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
            ),
            "PPP",
          )}
          .
        </p>
      )}
      {application.latestInvitation && (
        <p className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-200">
          Latest invitation: {application.latestInvitation.status.toLowerCase()}{" "}
          · expires {format(application.latestInvitation.expiresAt, "PPP")}.
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <div className="space-y-5">
          <InfoCard title="Applicant profile">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-white">{application.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Stage name</dt>
                <dd className="mt-1 text-sm text-white">
                  {application.stageName || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="mt-1 inline-flex items-center gap-2 text-sm text-white">
                  <Mail className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                  {application.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-white">
                  {application.phone || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Location</dt>
                <dd className="mt-1 inline-flex items-center gap-2 text-sm text-white">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                  {[application.cityName, application.country?.name]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Experience</dt>
                <dd className="mt-1 text-sm text-white">
                  {application.experienceYears === null
                    ? "—"
                    : `${application.experienceYears} years`}
                  {application.experienceLevel
                    ? ` · ${application.experienceLevel.toLowerCase().replaceAll("_", " ")}`
                    : ""}
                </dd>
              </div>
            </dl>
            {application.bio && (
              <div className="mt-5 border-t border-white/8 pt-4">
                <p className="text-xs text-gray-500">Bio</p>
                <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-gray-300">
                  {application.bio}
                </p>
              </div>
            )}
          </InfoCard>

          <InfoCard title="Portfolio and social links">
            <div className="space-y-2">
              {application.portfolioLinks.map((url) => (
                <a
                  key={url}
                  href={/^https?:\/\//i.test(url) ? url : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm break-all text-sky-300 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {url}
                </a>
              ))}
              {socialLinks.map(([label, url]) => (
                <a
                  key={label}
                  href={/^https?:\/\//i.test(url) ? url : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm break-all text-sky-300 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {label}: {url}
                </a>
              ))}
              {application.portfolioLinks.length === 0 &&
                socialLinks.length === 0 && (
                  <p className="text-sm text-gray-500">No links provided.</p>
                )}
            </div>
          </InfoCard>

          <InfoCard title="Application attribution">
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-gray-500">Source</dt>
                <dd className="mt-1 text-sm text-white">
                  {application.utmSource || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Medium</dt>
                <dd className="mt-1 text-sm text-white">
                  {application.utmMedium || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Campaign</dt>
                <dd className="mt-1 text-sm text-white">
                  {application.utmCampaign || "—"}
                </dd>
              </div>
            </dl>
          </InfoCard>
        </div>

        <div className="space-y-5">
          <FoundingApplicationControls
            applicationId={application.id}
            status={application.status}
            initialNotes={application.notes ?? ""}
          />
          <InfoCard title="Status history">
            {application.statusLogs.length ? (
              <ol className="space-y-4">
                {application.statusLogs.map((log) => (
                  <li
                    key={log.id}
                    className="relative border-l border-white/10 pl-4 last:border-transparent"
                  >
                    <span className="bg-h_redLight absolute top-1.5 -left-1 h-2 w-2 rounded-full" />
                    <p className="text-sm font-medium text-white">
                      {log.previousStatus
                        ? titleCaseStatus(log.previousStatus)
                        : "Application submitted"}{" "}
                      <span className="text-gray-500">→</span>{" "}
                      {titleCaseStatus(log.newStatus)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {format(log.createdAt, "PPP 'at' p")} ·{" "}
                      {log.changer?.name || log.changer?.email || "System"}
                    </p>
                    {log.reason && (
                      <p className="mt-2 text-sm leading-5 whitespace-pre-wrap text-gray-400">
                        {log.reason}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-500">
                No status changes recorded.
              </p>
            )}
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
