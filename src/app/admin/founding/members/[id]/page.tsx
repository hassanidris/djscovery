import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { RewardsForm } from "@/components/admin/RewardsForm";
import { NotesForm } from "@/components/admin/NotesForm";
import {
  getFoundingMemberDetail,
  suspendFoundingMember,
  revokeFoundingMember,
  activateFoundingMember,
  updateFoundingMemberRewards,
  updateFoundingMemberNotes,
} from "@/lib/actions/admin/founding-members";
import type { FoundingMemberStatus } from "@prisma/client";
import {
  ArrowLeft,
  ShieldAlert,
  Ban,
  CheckCircle,
  Crown,
  TrendingUp,
  Home,
  Star,
  Clock,
} from "lucide-react";

function calculatePremiumDaysRemaining(premiumUntil: Date | null): number {
  if (!premiumUntil) return 0;
  return Math.max(
    0,
    Math.ceil((premiumUntil.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
  );
}

export const metadata: Metadata = { title: "Founding Member Detail" };

const STATUS_STYLES: Record<FoundingMemberStatus, string> = {
  PENDING_ONBOARDING: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  ACTIVE: "border-green-500/30 bg-green-500/10 text-green-300",
  SUSPENDED: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  REVOKED: "border-red-500/30 bg-red-500/10 text-red-300",
};

function displayStatus(status: FoundingMemberStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminFoundingMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const memberId = Number(id);
  if (isNaN(memberId)) notFound();

  const member = await getFoundingMemberDetail(memberId);
  if (!member) notFound();

  const dj = member.djProfile;

  // Calculate premium days remaining (server-side only)
  const premiumDaysRemaining = calculatePremiumDaysRemaining(dj.premiumUntil);

  return (
    <div className="space-y-7">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/admin/founding/members"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to members
        </Link>
      </div>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{dj.stageName}</h1>
            <Badge className={`border text-xs ${STATUS_STYLES[member.status]}`}>
              {displayStatus(member.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            {dj.user.name} · {dj.user.email}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Joined {format(member.joinedAt, "MMM d, yyyy")} ·{" "}
            {formatDistanceToNow(member.joinedAt, { addSuffix: true })}
          </p>
        </div>
        {member.foundingNumber && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2">
            <Crown className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs text-amber-200/70">Founding Number</p>
              <p className="text-lg font-bold text-amber-400">
                #{member.foundingNumber}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Status actions */}
      <section className="rounded-xl border border-white/8 bg-white/2 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-200">
          Account Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          {member.status === "ACTIVE" && (
            <>
              <AdminActionButton
                label="Suspend"
                description={`Suspend ${dj.stageName}? They will lose founding member benefits.`}
                confirmLabel="Suspend"
                fields={{ memberId: String(member.id) }}
                action={suspendFoundingMember}
                successMessage="Member suspended"
                variant="outline"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              />
              <AdminActionButton
                label="Revoke"
                description={`Revoke founding membership for ${dj.stageName}? Their founding number will be retired.`}
                confirmLabel="Revoke"
                fields={{ memberId: String(member.id) }}
                action={revokeFoundingMember}
                successMessage="Membership revoked"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              />
            </>
          )}
          {(member.status === "SUSPENDED" || member.status === "REVOKED") && (
            <AdminActionButton
              label="Activate"
              description={`Reactivate ${dj.stageName}?`}
              confirmLabel="Activate"
              fields={{ memberId: String(member.id) }}
              action={activateFoundingMember}
              successMessage="Member activated"
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            />
          )}
          {member.status === "PENDING_ONBOARDING" && (
            <AdminActionButton
              label="Activate"
              description={`Activate ${dj.stageName}? This will mark them as an active founding member.`}
              confirmLabel="Activate"
              fields={{ memberId: String(member.id) }}
              action={activateFoundingMember}
              successMessage="Member activated"
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            />
          )}
        </div>
        {member.revokedAt && (
          <p className="mt-3 text-xs text-red-300">
            Revoked {format(member.revokedAt, "MMM d, yyyy")}
            {member.revocationReason && ` · ${member.revocationReason}`}
          </p>
        )}
      </section>

      {/* Profile info */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-white/2 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-200">
            Profile Info
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-400">Location</dt>
              <dd className="text-white">
                {[dj.city?.name, dj.city?.country?.name]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Genres</dt>
              <dd className="text-white">
                {dj.genres.length > 0
                  ? dj.genres.map((g) => g.genre.name).join(", ")
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Plan</dt>
              <dd className="text-white">{dj.plan}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Monthly Views</dt>
              <dd className="text-white">{dj.monthlyViews.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">User since</dt>
              <dd className="text-white">
                {format(dj.user.createdAt, "MMM d, yyyy")}
              </dd>
            </div>
          </dl>
        </div>

        {/* Rewards */}
        <div className="rounded-xl border border-white/8 bg-white/2 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-200">
            Current Rewards
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-400">
                <TrendingUp className="h-4 w-4" />
                Priority Boost
              </span>
              <span className="font-medium text-white">{dj.priorityBoost}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-400">
                <Home className="h-4 w-4" />
                Homepage Featured
              </span>
              <span
                className={
                  dj.homepageFeatured ? "text-green-400" : "text-gray-500"
                }
              >
                {dj.homepageFeatured ? "Yes" : "No"}
              </span>
            </div>
            {dj.homepageFeaturedUntil && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  Featured Until
                </span>
                <span className="text-white">
                  {format(dj.homepageFeaturedUntil, "MMM d, yyyy")}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-400">
                <Star className="h-4 w-4" />
                Premium Until
              </span>
              <span className="text-white">
                {dj.premiumUntil ? format(dj.premiumUntil, "MMM d, yyyy") : "—"}
              </span>
            </div>
            {member.launchedAt && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <Crown className="h-4 w-4" />
                  Launched At
                </span>
                <span className="text-white">
                  {format(member.launchedAt, "MMM d, yyyy")}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Edit Rewards Form */}
      <section className="rounded-xl border border-white/8 bg-white/2 p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-200">
          Edit Rewards
        </h2>
        <RewardsForm
          memberId={String(member.id)}
          action={updateFoundingMemberRewards}
          defaultPriorityBoost={dj.priorityBoost}
          defaultHomepageFeaturedDays={dj.homepageFeaturedUntil ? 30 : 0}
          defaultPremiumDays={premiumDaysRemaining}
          defaultHomepageFeatured={dj.homepageFeatured}
        />
      </section>

      {/* Notes */}
      <section className="rounded-xl border border-white/8 bg-white/2 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-200">
          Admin Notes
        </h2>
        <NotesForm
          memberId={String(member.id)}
          action={updateFoundingMemberNotes}
          defaultNotes={member.notes}
        />
      </section>

      {/* Action log */}
      {member.actionLogs.length > 0 && (
        <section className="rounded-xl border border-white/8 bg-white/2 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-200">
            Action History
          </h2>
          <ul className="space-y-2">
            {member.actionLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-medium text-white">{log.action}</span>
                  {log.admin && (
                    <span className="text-gray-500">
                      {" "}
                      by {log.admin.name ?? log.admin.email}
                    </span>
                  )}
                </div>
                <span className="text-gray-500">
                  {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
