import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  getAdminUsers,
  suspendUser,
  activateUser,
} from "@/lib/actions/admin/users";
import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilters from "@/components/admin/AdminFilters";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Fans" };

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "border-green-500/30 bg-green-500/10 text-green-400",
  SUSPENDED: "border-red-500/30 bg-red-500/10 text-red-400",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  REJECTED: "border-gray-500/30 bg-gray-500/10 text-gray-400",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  DJ: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  ORGANIZER: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  FAN: "border-gray-500/30 bg-gray-500/10 text-gray-400",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const cursor = params.cursor;
  const role = params.role || "FAN";
  const status = params.status;
  const search = params.search;

  const { users, nextCursor } = await getAdminUsers({
    cursor,
    role,
    status,
    search,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Fans</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage fan accounts and all platform users.
        </p>
      </div>

      <AdminFilters
        searchKey="search"
        searchPlaceholder="Search name, email, username..."
        currentSearch={search ?? ""}
        currentValues={{ status: status ?? "", role: role ?? "" }}
        filters={[
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "ACTIVE", label: "Active" },
              { value: "SUSPENDED", label: "Suspended" },
              { value: "PENDING", label: "Pending" },
            ],
          },
          {
            key: "role",
            placeholder: "All Roles",
            options: [
              { value: "FAN", label: "Fan" },
              { value: "ADMIN", label: "Admin" },
              { value: "DJ", label: "DJ" },
              { value: "ORGANIZER", label: "Organizer" },
            ],
          },
        ]}
      />

      {users.length === 0 ? (
        <AdminEmptyState
          title="No users found"
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
                      User
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Roles
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Country
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Last Login
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-white/2"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">
                            {user.name ?? user.username}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length === 0 ||
                          user.roles.some((r) => r.role === "FAN") ? (
                            <Badge className="border border-gray-500/30 bg-gray-500/10 text-xs text-gray-400">
                              Fan
                            </Badge>
                          ) : (
                            user.roles.map((r) => (
                              <Badge
                                key={r.role}
                                className={`border text-xs ${ROLE_COLORS[r.role] ?? ""}`}
                              >
                                {r.role}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`border text-xs ${STATUS_COLORS[user.status] ?? ""}`}
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {user.country?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {user.lastLoginAt
                          ? formatDistanceToNow(new Date(user.lastLoginAt), {
                              addSuffix: true,
                            })
                          : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {user.status === "SUSPENDED" ? (
                            <AdminActionButton
                              label="Activate"
                              description={`Reactivate ${user.name ?? user.username}'s account?`}
                              confirmLabel="Activate"
                              fields={{ userId: user.id }}
                              action={activateUser}
                              successMessage="User activated"
                              variant="outline"
                              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                            />
                          ) : (
                            <AdminActionButton
                              label="Suspend"
                              description={`This will prevent ${user.name ?? user.username} from signing in.`}
                              confirmLabel="Suspend"
                              fields={{ userId: user.id }}
                              action={suspendUser}
                              successMessage="User suspended"
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
          <AdminPagination nextCursor={nextCursor} hasPrev={!!cursor} />
        </>
      )}
    </div>
  );
}
