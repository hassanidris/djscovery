import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { getWaitlistEntries } from "@/lib/actions/admin/waitlist";
import { Download, Music, User } from "lucide-react";

export const metadata: Metadata = { title: "Founding Waitlist" };

export default async function AdminFoundingWaitlistPage({
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
  const isDj = value("isDj");
  const result = await getWaitlistEntries({ query, isDj, page });

  const makePageUrl = (nextPage: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (isDj) next.set("isDj", isDj);
    next.set("page", String(nextPage));
    return `/admin/founding/waitlist?${next.toString()}`;
  };

  const { analytics } = result;
  const summary = [
    { label: "Total entries", value: analytics.total },
    { label: "DJs", value: analytics.djCount },
    { label: "Non-DJs", value: analytics.nonDjCount },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-h_redLight text-xs font-semibold tracking-[0.18em] uppercase">
            Founding program
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Waitlist
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Non-DJ waitlist entries collected before launch.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/founding/waitlist/export"
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
        aria-label="Waitlist stats"
        className="grid grid-cols-2 gap-3 md:grid-cols-3"
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
          Search waitlist
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Name or email"
            className="mt-1.5 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-gray-500"
          />
        </label>
        <label className="min-w-40 text-xs font-medium text-gray-400">
          Type
          <select
            name="isDj"
            defaultValue={isDj}
            className="mt-1.5 h-10 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-white"
          >
            <option value="">All</option>
            <option value="yes">DJs</option>
            <option value="no">Non-DJs</option>
          </select>
        </label>
        <button
          type="submit"
          className="h-10 rounded-md bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15"
        >
          Apply filters
        </button>
      </form>

      {result.entries.length === 0 ? (
        <AdminEmptyState
          title="No waitlist entries found"
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
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      UTM Source
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-white/2"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {entry.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{entry.email}</td>
                      <td className="px-4 py-3">
                        {entry.isDj ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-purple-300">
                            <Music className="h-3 w-3" />
                            DJ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                            <User className="h-3 w-3" />
                            Non-DJ
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {entry.utmSource || "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-xs text-gray-400"
                        title={entry.createdAt.toLocaleString()}
                      >
                        {formatDistanceToNow(entry.createdAt, {
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
              {result.total} entr{result.total === 1 ? "y" : "ies"} · page{" "}
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
