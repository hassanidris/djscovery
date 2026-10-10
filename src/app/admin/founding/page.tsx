import Link from "next/link";

export default function AdminFoundingPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-h_redLight text-xs font-semibold tracking-[0.18em] uppercase">
          Founding program
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">Founding members</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage applications, decisions, and invitation status.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/admin/founding/applications"
          className="inline-flex rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Open application management
        </Link>
        <Link
          href="/admin/founding/members"
          className="inline-flex rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Manage founding members
        </Link>
      </div>
    </div>
  );
}
