import type { GigStatus, GigApplicationStatus } from "@prisma/client";

const GIG_STATUS: Record<
  GigStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "border-white/10 bg-white/5 text-gray-500",
  },
  PUBLISHED: {
    label: "Published",
    className: "border-green-500/30 bg-green-500/10 text-green-400",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  FILLED: {
    label: "Filled",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-red-500/30 bg-red-500/10 text-red-400",
  },
  EXPIRED: {
    label: "Expired",
    className: "border-white/8 bg-white/3 text-gray-600",
  },
};

const APP_STATUS: Record<
  GigApplicationStatus,
  { label: string; className: string }
> = {
  APPLIED: {
    label: "Applied",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "border-green-500/30 bg-green-500/10 text-green-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-red-500/30 bg-red-500/10 text-red-400",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "border-white/10 bg-white/5 text-gray-500",
  },
};

export function GigStatusBadge({ status }: { status: GigStatus }) {
  const cfg = GIG_STATUS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

export function GigApplicationStatusBadge({
  status,
}: {
  status: GigApplicationStatus;
}) {
  const cfg = APP_STATUS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
