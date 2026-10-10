import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { getFoundingMembers } from "@/lib/actions/admin/founding-members";
import {
  suspendFoundingMember,
  revokeFoundingMember,
  activateFoundingMember,
} from "@/lib/actions/admin/founding-members";
import type { FoundingMemberStatus } from "@prisma/client";
import { ShieldAlert, Ban, CheckCircle, Crown, Download } from "lucide-react";

export const metadata: Metadata = { title: "Founding Members" };

const STATUS_STYLES: Record<FoundingMemberStatus, string> = {
  PENDING_ONBOARDING: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  ACTIVE: "border-green-500/30 bg-green-500/10 text-green-300",
  SUSPENDED: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  REVOKED: "border-red-500/30 bg-red-500/10 text-red-300",
};

const STATUS_ICONS: Record<FoundingMemberStatus, React.ReactNode> = {
  PENDING_ONBOARDING: <Crown className="h-3 w-3" />,
  ACTIVE: <CheckCircle className="h-3 w-3" />,
  SUSPENDED: <ShieldAlert className="h-3 w-3" />,
  REVOKED: <Ban className="h-3 w-3" />,
};

function displayStatus(status: FoundingMemberStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminFoundingMembersPage({
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
  const result = await getFoundingMembers({
    query,
    status,
    page,
  });

  const makePageUrl = (nextPage: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (status) next.set("status", status);
    next.set("page", String(nextPage));
    return `/admin/founding/members?${next.toString()}`;
  };

  const { analytics } = result;
  const summary = [
    { label: "Total members", value: analytics.total },
    { label: "Active", value: analytics.active },
    { label: "Pending onboarding", value: analytics.pendingOnboarding },
    { label: "Suspended", value: analytics.suspended },
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
            Member management
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage founding member status, rewards, and account actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/founding/members/export"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Link>
          <Link
            href="/admin/founding"
            className="text-sm text-gray-400 hover:text-white"
          >
            Founding overview
          </Link>
        </div>
      </header>

      <section
        aria-label="Member stats"
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
          Search members
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
            <option value="PENDING_ONBOARDING">Pending Onboarding</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
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

      {result.members.length === 0 ? (
        <AdminEmptyState
          title="No members found"
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
                      Member
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Founding #
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.members.map((member) => (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-white/2"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/founding/members/${member.id}`}
                          className="font-medium text-white hover:underline"
                        >
                          {member.djProfile.stageName}
                        </Link>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {member.djProfile.user.name} ·{" "}
                          {member.djProfile.user.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {[
                          member.djProfile.city?.name,
                          member.djProfile.city?.country?.name,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {member.foundingNumber ? (
                          <span className="font-mono text-amber-400">
                            #{member.foundingNumber}
                          </span>
                        ) : (
                          <span className="text-gray-500">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`flex items-center gap-1.5 border text-xs ${STATUS_STYLES[member.status]}`}
                        >
                          {STATUS_ICONS[member.status]}
                          {displayStatus(member.status)}
                        </Badge>
                      </td>
                      <td
                        className="px-4 py-3 text-xs text-gray-400"
                        title={member.joinedAt.toLocaleString()}
                      >
                        {formatDistanceToNow(member.joinedAt, {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {member.status === "ACTIVE" && (
                            <>
                              <AdminActionButton
                                label="Suspend"
                                description={`Suspend ${member.djProfile.stageName}?`}
                                confirmLabel="Suspend"
                                fields={{ memberId: String(member.id) }}
                                action={suspendFoundingMember}
                                successMessage="Member suspended"
                                variant="ghost"
                                className="text-orange-400 hover:bg-orange-500/10"
                              >
                                <ShieldAlert className="h-4 w-4" />
                              </AdminActionButton>
                              <AdminActionButton
                                label="Revoke"
                                description={`Revoke founding membership for ${member.djProfile.stageName}?`}
                                confirmLabel="Revoke"
                                fields={{ memberId: String(member.id) }}
                                action={revokeFoundingMember}
                                successMessage="Member revoked"
                                variant="ghost"
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                <Ban className="h-4 w-4" />
                              </AdminActionButton>
                            </>
                          )}
                          {member.status === "SUSPENDED" && (
                            <AdminActionButton
                              label="Activate"
                              description={`Reactivate ${member.djProfile.stageName}?`}
                              confirmLabel="Activate"
                              fields={{ memberId: String(member.id) }}
                              action={activateFoundingMember}
                              successMessage="Member activated"
                              variant="ghost"
                              className="text-green-400 hover:bg-green-500/10"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </AdminActionButton>
                          )}
                          {member.status === "REVOKED" && (
                            <AdminActionButton
                              label="Restore"
                              description={`Restore founding membership for ${member.djProfile.stageName}?`}
                              confirmLabel="Restore"
                              fields={{ memberId: String(member.id) }}
                              action={activateFoundingMember}
                              successMessage="Member restored"
                              variant="ghost"
                              className="text-green-400 hover:bg-green-500/10"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </AdminActionButton>
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
              {result.total} member{result.total === 1 ? "" : "s"} · page{" "}
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
