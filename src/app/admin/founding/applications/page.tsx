import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { BulkActionsForm } from "@/components/admin/BulkActionsForm";
import {
  getFoundingApplications,
  bulkChangeFoundingApplicationStatus,
} from "@/lib/actions/admin/founding-applications";
import { FOUNDING_APPLICATION_STATUSES } from "@/lib/validation/founding-admin";
import type { FoundingApplicationStatus } from "@prisma/client";
import { CheckSquare, Square } from "lucide-react";

export const metadata: Metadata = { title: "Founding Applications" };

const STATUS_STYLES: Record<FoundingApplicationStatus, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  EMAIL_VERIFIED: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  UNDER_REVIEW: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  APPROVED: "border-green-500/30 bg-green-500/10 text-green-300",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-300",
  WITHDRAWN: "border-gray-500/30 bg-gray-500/10 text-gray-300",
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

function displayStatus(status: FoundingApplicationStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Distribution({
  title,
  items,
}: {
  title: string;
  items: Array<{ name: string; count: number }>;
}) {
  return (
    <section className="rounded-xl border border-white/8 bg-white/2 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-200">{title}</h3>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.name} className="flex justify-between gap-3 text-xs">
              <span className="truncate text-gray-400">{item.name}</span>
              <span className="font-medium text-white">{item.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500">No application data yet.</p>
      )}
    </section>
  );
}

export default async function AdminFoundingApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) =>
    typeof params[key] === "string" ? params[key] : "";
  const rawPage = Number(value("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const query = value("q");
  const status = value("status");
  const verified = value("verified");
  const result = await getFoundingApplications({
    query,
    status,
    verified,
    page,
  });

  const makePageUrl = (nextPage: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (status) next.set("status", status);
    if (verified) next.set("verified", verified);
    next.set("page", String(nextPage));
    return `/admin/founding/applications?${next.toString()}`;
  };

  const { analytics } = result;
  const summary = [
    { label: "Applications", value: analytics.total },
    {
      label: "Email verified",
      value: `${analytics.verified} (${analytics.verificationRate}%)`,
    },
    { label: "In review", value: analytics.inReview },
    { label: "Approved", value: analytics.approved },
    { label: "Rejected", value: analytics.rejected },
    { label: "Approval rate", value: `${analytics.approvalRate}%` },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-h_redLight text-xs font-semibold tracking-[0.18em] uppercase">
            Founding program
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Application management
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Review every application, including those with unverified email
            addresses.
          </p>
        </div>
        <Link
          href="/admin/founding"
          className="text-sm text-gray-400 hover:text-white"
        >
          Founding overview
        </Link>
      </header>

      <section
        aria-label="Application funnel"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
      >
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/8 bg-white/2 p-4"
          >
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section
        aria-label="Application breakdown"
        className="grid gap-3 md:grid-cols-2"
      >
        <Distribution title="By country" items={analytics.byCountry} />
        <Distribution title="By city" items={analytics.byCity} />
      </section>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-white/8 bg-white/2 p-4"
      >
        <label className="min-w-56 flex-1 text-xs font-medium text-gray-400">
          Search applications
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Name, stage name, or email"
            className="mt-1.5 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-gray-500"
          />
        </label>
        <label className="min-w-44 text-xs font-medium text-gray-400">
          Status
          <select
            name="status"
            defaultValue={status}
            className="mt-1.5 h-10 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-white"
          >
            <option value="">All statuses</option>
            {FOUNDING_APPLICATION_STATUSES.map((option) => (
              <option key={option} value={option}>
                {displayStatus(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-40 text-xs font-medium text-gray-400">
          Email ownership
          <select
            name="verified"
            defaultValue={verified}
            className="mt-1.5 h-10 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-white"
          >
            <option value="">Verified and unverified</option>
            <option value="yes">Verified</option>
            <option value="no">Unverified</option>
          </select>
        </label>
        <button
          type="submit"
          className="h-10 rounded-md bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15"
        >
          Apply filters
        </button>
      </form>

      {/* Bulk actions form */}
      <BulkActionsForm
        id="bulk-actions-form"
        action={bulkChangeFoundingApplicationStatus}
      />

      {result.applications.length === 0 ? (
        <AdminEmptyState
          title="No applications found"
          description="Try a different search or clear one of the filters."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-white/8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/2">
                    <th className="w-10 px-4 py-3 text-left font-medium text-gray-400">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/10"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.applications.map((application) => (
                    <tr
                      key={application.id}
                      className="transition-colors hover:bg-white/2"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          name="applicationIds"
                          value={application.id}
                          form="bulk-actions-form"
                          className="h-4 w-4 rounded border-white/10"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/founding/applications/${application.id}`}
                          className="font-medium text-white hover:underline"
                        >
                          {application.stageName || application.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {application.name} · {application.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {[application.cityName, application.country?.name]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`border text-xs ${STATUS_STYLES[application.status]}`}
                        >
                          {displayStatus(application.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={
                            application.emailVerifiedAt
                              ? "text-green-300"
                              : "text-amber-300"
                          }
                        >
                          {application.emailVerifiedAt
                            ? "Verified"
                            : "Unverified"}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-xs text-gray-400"
                        title={application.submittedAt.toLocaleString()}
                      >
                        {formatDistanceToNow(application.submittedAt, {
                          addSuffix: true,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {result.total} application{result.total === 1 ? "" : "s"} · page{" "}
              {result.page} of {result.totalPages}
            </span>
            <div className="flex gap-2">
              {result.page > 1 && (
                <Link
                  href={makePageUrl(result.page - 1)}
                  className="rounded-md border border-white/10 px-3 py-1.5 hover:bg-white/5"
                >
                  Previous
                </Link>
              )}
              {result.page < result.totalPages && (
                <Link
                  href={makePageUrl(result.page + 1)}
                  className="rounded-md border border-white/10 px-3 py-1.5 hover:bg-white/5"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
