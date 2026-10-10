import type { Metadata } from "next";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminActionButton from "@/components/admin/AdminActionButton";
import {
  getFoundingInvitations,
  revokeInvitation,
  resendInvitation,
  extendInvitation,
} from "@/lib/actions/admin/founding-invitations";
import type { InvitationStatus } from "@prisma/client";
import { Ban, Send, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Founding Invitations" };

const STATUS_STYLES: Record<InvitationStatus, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  ACCEPTED: "border-green-500/30 bg-green-500/10 text-green-300",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-300",
  EXPIRED: "border-gray-500/30 bg-gray-500/10 text-gray-300",
  REVOKED: "border-red-500/30 bg-red-500/10 text-red-300",
};

function displayStatus(status: InvitationStatus) {
  return status
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminFoundingInvitationsPage({
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
  const result = await getFoundingInvitations({ query, status, page });

  const makePageUrl = (nextPage: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (status) next.set("status", status);
    next.set("page", String(nextPage));
    return `/admin/founding/invitations?${next.toString()}`;
  };

  const { analytics } = result;
  const summary = [
    { label: "Total invitations", value: analytics.total },
    { label: "Pending", value: analytics.pending },
    { label: "Accepted", value: analytics.accepted },
    { label: "Expired", value: analytics.expired },
    { label: "Revoked", value: analytics.revoked },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-h_redLight text-xs font-semibold tracking-[0.18em] uppercase">
            Founding program
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Invitation management
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Revoke, resend, or extend pending founding member invitations.
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
        aria-label="Invitation stats"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
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

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-white/8 bg-white/2 p-4"
      >
        <label className="min-w-56 flex-1 text-xs font-medium text-gray-400">
          Search invitations
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Email or stage name"
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
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </label>
        <button
          type="submit"
          className="h-10 rounded-md bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15"
        >
          Apply filters
        </button>
      </form>

      {result.invitations.length === 0 ? (
        <AdminEmptyState
          title="No invitations found"
          description="Try a different search or clear one of the filters."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-white/8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/2">
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Recipient
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Sent
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Expires
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.invitations.map((invitation) => (
                    <tr
                      key={invitation.id}
                      className="transition-colors hover:bg-white/2"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">
                          {invitation.email || "—"}
                        </p>
                        {invitation.djProfile && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {invitation.djProfile.stageName}
                          </p>
                        )}
                        {invitation.foundingApplication && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            App: {invitation.foundingApplication.name}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`border text-xs ${STATUS_STYLES[invitation.status]}`}
                        >
                          {displayStatus(invitation.status)}
                        </Badge>
                      </td>
                      <td
                        className="px-4 py-3 text-xs text-gray-400"
                        title={invitation.createdAt.toLocaleString()}
                      >
                        {formatDistanceToNow(invitation.createdAt, {
                          addSuffix: true,
                        })}
                      </td>
                      <td
                        className="px-4 py-3 text-xs text-gray-400"
                        title={invitation.expiresAt.toLocaleString()}
                      >
                        {format(invitation.expiresAt, "MMM d, yyyy")}
                        {invitation.expiresAt < new Date() &&
                          invitation.status === "PENDING" && (
                            <span className="ml-1 text-red-400">(expired)</span>
                          )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {(invitation.status === "PENDING" ||
                            invitation.status === "EXPIRED") && (
                            <>
                              <AdminActionButton
                                label="Resend"
                                description="Resend this invitation with a new token?"
                                confirmLabel="Resend"
                                fields={{ invitationId: String(invitation.id) }}
                                action={resendInvitation}
                                successMessage="Invitation resent"
                                variant="ghost"
                                className="text-sky-400 hover:bg-sky-500/10"
                              >
                                <Send className="h-4 w-4" />
                              </AdminActionButton>
                              {invitation.status === "PENDING" && (
                                <AdminActionButton
                                  label="Extend 7d"
                                  description="Extend this invitation by 7 days?"
                                  confirmLabel="Extend"
                                  fields={{
                                    invitationId: String(invitation.id),
                                    days: "7",
                                  }}
                                  action={extendInvitation}
                                  successMessage="Invitation extended"
                                  variant="ghost"
                                  className="text-amber-400 hover:bg-amber-500/10"
                                >
                                  <Clock className="h-4 w-4" />
                                </AdminActionButton>
                              )}
                              <AdminActionButton
                                label="Revoke"
                                description="Revoke this invitation?"
                                confirmLabel="Revoke"
                                fields={{ invitationId: String(invitation.id) }}
                                action={revokeInvitation}
                                successMessage="Invitation revoked"
                                variant="ghost"
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                <Ban className="h-4 w-4" />
                              </AdminActionButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {result.total} invitation{result.total === 1 ? "" : "s"} · page{" "}
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
