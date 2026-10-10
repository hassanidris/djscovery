"use client";

import { useTransition } from "react";
import { toast } from "sonner";

interface RewardsFormProps {
  memberId: string;
  action: (formData: FormData) => Promise<{ success: true } | { error: string }>;
  defaultPriorityBoost: number;
  defaultHomepageFeaturedDays: number;
  defaultPremiumDays: number;
  defaultHomepageFeatured: boolean;
}

export function RewardsForm({
  memberId,
  action,
  defaultPriorityBoost,
  defaultHomepageFeaturedDays,
  defaultPremiumDays,
  defaultHomepageFeatured,
}: RewardsFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("memberId", memberId);
    
    startTransition(async () => {
      const result = await action(formData);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Rewards updated successfully");
        window.location.reload();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="memberId" value={memberId} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-medium text-gray-400">
          Priority Boost (0-10)
          <input
            name="priorityBoost"
            type="number"
            min={0}
            max={10}
            defaultValue={defaultPriorityBoost}
            className="mt-1.5 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white"
          />
        </label>
        <label className="text-xs font-medium text-gray-400">
          Homepage Featured Days
          <input
            name="homepageFeaturedDays"
            type="number"
            min={0}
            max={365}
            defaultValue={defaultHomepageFeaturedDays}
            className="mt-1.5 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white"
          />
        </label>
        <label className="text-xs font-medium text-gray-400">
          Premium Days (0 to clear)
          <input
            name="premiumDays"
            type="number"
            min={0}
            max={365}
            defaultValue={defaultPremiumDays}
            className="mt-1.5 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <input
            name="homepageFeatured"
            type="checkbox"
            value="true"
            defaultChecked={defaultHomepageFeatured}
            className="h-4 w-4 rounded border-white/10"
          />
          Homepage Featured
        </label>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="h-10 rounded-md bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save rewards"}
      </button>
    </form>
  );
}
