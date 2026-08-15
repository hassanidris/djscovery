"use client";

import {
  bulkApproveReviews,
  bulkHideReviews,
  bulkFlagReviews,
  bulkDeleteReviews,
} from "@/lib/actions/admin-review-management";

export default function BulkActions({
  reviewIds,
  selectedIds,
  onSelectionChange,
  adminNote,
  onAdminNoteChange,
}: {
  reviewIds: number[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  adminNote: string;
  onAdminNoteChange: (note: string) => void;
}) {
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    const formData = new FormData();
    selectedIds.forEach((id) => formData.append("ratingIds", id.toString()));
    await bulkApproveReviews(formData);
    onSelectionChange([]);
  };

  const handleBulkHide = async () => {
    if (selectedIds.length === 0) return;
    const formData = new FormData();
    selectedIds.forEach((id) => formData.append("ratingIds", id.toString()));
    formData.append("adminNote", adminNote);
    await bulkHideReviews(formData);
    onSelectionChange([]);
    onAdminNoteChange("");
  };

  const handleBulkFlag = async () => {
    if (selectedIds.length === 0) return;
    const formData = new FormData();
    selectedIds.forEach((id) => formData.append("ratingIds", id.toString()));
    formData.append("adminNote", adminNote);
    await bulkFlagReviews(formData);
    onSelectionChange([]);
    onAdminNoteChange("");
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const formData = new FormData();
    selectedIds.forEach((id) => formData.append("ratingIds", id.toString()));
    formData.append("adminNote", adminNote);
    await bulkDeleteReviews(formData);
    onSelectionChange([]);
    onAdminNoteChange("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          {selectedIds.length} of {reviewIds.length} selected
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleBulkApprove}
          disabled={selectedIds.length === 0}
        >
          Approve Selected ({selectedIds.length})
        </button>
        <input
          type="text"
          placeholder="Admin note (optional)"
          value={adminNote}
          onChange={(e) => onAdminNoteChange(e.target.value)}
          className="w-64 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500"
        />
        <button
          className="inline-flex items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleBulkHide}
          disabled={selectedIds.length === 0}
        >
          Hide Selected
        </button>
        <button
          className="inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleBulkFlag}
          disabled={selectedIds.length === 0}
        >
          Flag Selected
        </button>
        <button
          className="inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleBulkDelete}
          disabled={selectedIds.length === 0}
        >
          Delete Selected
        </button>
      </div>
    </div>
  );
}
