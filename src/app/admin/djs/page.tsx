import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import {
  getAdminDjs,
  approveDjProfile,
  rejectDjProfile,
  hideDjProfile,
  unhideDjProfile,
  suspendDjAccount,
  toggleDjFeatured,
} from "@/lib/actions/admin/djs";
import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { formatDistanceToNow } from "date-fns";
import { EyeOff, Star, Crown } from "lucide-react";

export const metadata: Metadata = { title: "DJs" };

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "border-green-500/30 bg-green-500/10 text-green-400",
  PENDING_APPROVAL: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default async function AdminDjsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const cursorRaw = Number(params.cursor);
  const cursor =
    params.cursor && Number.isInteger(cursorRaw) ? cursorRaw : undefined;
  const status = params.status;
  const country = params.country;

  const { djs, nextCursor } = await getAdminDjs({ cursor, status, country });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">DJs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Approve, hide, or suspend DJ profiles.
        </p>
      </div>

      <AdminFilters
        currentValues={{ status: status ?? "" }}
        filters={[
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "PENDING_APPROVAL", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
            ],
          },
        ]}
      />

      <Suspense fallback={<AdminTableSkeleton cols={7} rows={8} />}>
        {djs.length === 0 ? (
          <AdminEmptyState
            title="No DJ profiles found"
            description="Try adjusting your filters."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-160 text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/2">
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        DJ
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Genres
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Rating
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
                    {djs.map((dj) => (
                      <tr
                        key={dj.id}
                        className="transition-colors hover:bg-white/2"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {dj.featured && (
                              <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                            )}
                            {dj.hidden && (
                              <EyeOff className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            )}
                            <div>
                              <Link
                                href={`/admin/djs/${dj.id}`}
                                className="font-medium text-white hover:underline"
                              >
                                {dj.stageName}
                              </Link>
                              <p className="text-muted-foreground text-xs">
                                @{dj.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {dj.genres.slice(0, 3).map((g) => (
                              <Badge
                                key={g.genre.name}
                                className="border border-white/10 bg-white/5 text-xs text-gray-300"
                              >
                                {g.genre.name}
                              </Badge>
                            ))}
                            {dj.genres.length > 3 && (
                              <span className="text-muted-foreground text-xs">
                                +{dj.genres.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">
                          {[dj.city?.name, dj.country?.name]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {dj._avg?.rating != null ? (
                            <span className="flex items-center gap-1 text-xs text-amber-400">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {dj._avg.rating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`border text-xs ${STATUS_COLORS[dj.status] ?? ""}`}
                          >
                            {dj.status === "PENDING_APPROVAL"
                              ? "Pending"
                              : dj.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatDistanceToNow(new Date(dj.createdAt), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            {dj.status === "APPROVED" && (
                              <AdminActionButton
                                label={dj.featured ? "Unfeature" : "Feature"}
                                description={`${dj.featured ? "Remove" : "Add"} ${dj.stageName} to homepage featured section?`}
                                confirmLabel={dj.featured ? "Remove" : "Add"}
                                fields={{ djProfileId: String(dj.id) }}
                                action={toggleDjFeatured}
                                successMessage={`DJ ${dj.featured ? "unfeatured" : "featured"}`}
                                requireConfirm={false}
                                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                              />
                            )}
                            {dj.status === "PENDING_APPROVAL" && (
                              <>
                                <AdminActionButton
                                  label="Approve"
                                  description={`Approve ${dj.stageName}'s DJ profile? They'll receive a notification.`}
                                  confirmLabel="Approve"
                                  fields={{ djProfileId: String(dj.id) }}
                                  action={approveDjProfile}
                                  successMessage="DJ profile approved"
                                  variant="outline"
                                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                                />
                                <AdminActionButton
                                  label="Reject"
                                  description={`Reject ${dj.stageName}'s DJ profile?`}
                                  confirmLabel="Reject"
                                  fields={{ djProfileId: String(dj.id) }}
                                  action={rejectDjProfile}
                                  successMessage="DJ profile rejected"
                                  variant="outline"
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                />
                              </>
                            )}
                            {dj.hidden ? (
                              <AdminActionButton
                                label="Unhide"
                                description={`Make ${dj.stageName}'s profile visible again?`}
                                confirmLabel="Unhide"
                                fields={{ djProfileId: String(dj.id) }}
                                action={unhideDjProfile}
                                successMessage="DJ profile visible"
                                requireConfirm={false}
                              />
                            ) : (
                              <AdminActionButton
                                label="Hide"
                                description={`Hide ${dj.stageName}'s profile from public listings?`}
                                confirmLabel="Hide"
                                fields={{ djProfileId: String(dj.id) }}
                                action={hideDjProfile}
                                successMessage="DJ profile hidden"
                              />
                            )}
                            {dj.user.status !== "SUSPENDED" && (
                              <AdminActionButton
                                label="Suspend"
                                description={`Suspend ${dj.stageName}'s account? They won't be able to sign in.`}
                                confirmLabel="Suspend"
                                fields={{ djProfileId: String(dj.id) }}
                                action={suspendDjAccount}
                                successMessage="Account suspended"
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <AdminPagination
              nextCursor={nextCursor ? String(nextCursor) : null}
              hasPrev={!!cursor}
            />
          </>
        )}
      </Suspense>
    </div>
  );
}
