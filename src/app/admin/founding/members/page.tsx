import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Crown, ArrowLeft, Check, X } from "lucide-react";
import {
  activateLaunchRewards,
  deactivateLaunchRewards,
} from "@/lib/actions/admin/founding-rewards";

async function FoundingMembersList() {
  const members = await prisma.foundingMember.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      djProfile: {
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      foundingNumber: "asc",
    },
  });

  const launchedCount = members.filter((m) => m.launchedAt !== null).length;
  const pendingCount = members.length - launchedCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Launch Rewards Status
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {launchedCount} of {members.length} founding members have rewards
            activated
          </p>
        </div>
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <form
              action={async (formData: FormData) => {
                "use server";
                const result = await activateLaunchRewards(formData);
                if ("error" in result) {
                  throw new Error(result.error);
                }
              }}
            >
              <Button
                type="submit"
                className="bg-h_redLight hover:bg-h_redLight/90"
              >
                <Crown className="mr-2 size-4" />
                Activate All ({pendingCount} pending)
              </Button>
            </form>
          )}
          {launchedCount > 0 && (
            <form
              action={async (formData: FormData) => {
                "use server";
                const result = await deactivateLaunchRewards(formData);
                if ("error" in result) {
                  throw new Error(result.error);
                }
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="border-white/20 hover:bg-white/10"
              >
                Deactivate All
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5">
        <div className="grid grid-cols-7 gap-4 border-b border-white/10 px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          <div className="col-span-1">Founding #</div>
          <div className="col-span-2">DJ Name</div>
          <div className="col-span-2">Email</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Actions</div>
        </div>
        {members.map((member) => (
          <div
            key={member.id}
            className="grid grid-cols-7 gap-4 border-b border-white/10 px-6 py-4 text-sm last:border-0"
          >
            <div className="col-span-1 font-mono text-amber-400">
              #{member.foundingNumber ?? "N/A"}
            </div>
            <div className="col-span-2 font-medium text-white">
              {member.djProfile.stageName}
            </div>
            <div className="col-span-2 text-gray-400">
              {member.djProfile.user.email}
            </div>
            <div className="col-span-1">
              {member.launchedAt ? (
                <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400">
                  Pending
                </span>
              )}
            </div>
            <div className="col-span-1 flex gap-2">
              {!member.launchedAt ? (
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const result = await activateLaunchRewards(formData);
                    if ("error" in result) {
                      throw new Error(result.error);
                    }
                  }}
                >
                  <input
                    type="hidden"
                    name="djProfileId"
                    value={member.djProfileId}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-h_redLight hover:bg-h_redLight/90"
                  >
                    <Check className="size-3" />
                  </Button>
                </form>
              ) : (
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const result = await deactivateLaunchRewards(formData);
                    if ("error" in result) {
                      throw new Error(result.error);
                    }
                  }}
                >
                  <input
                    type="hidden"
                    name="djProfileId"
                    value={member.djProfileId}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                  >
                    <X className="size-3" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-400">
            No active founding members yet
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminFoundingMembersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/founding">
          <Button variant="ghost" size="icon" className="text-gray-400">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <p className="text-h_redLight text-xs font-semibold tracking-[0.18em] uppercase">
            Founding program
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Founding Members
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage founding member rewards and launch activation
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <FoundingMembersList />
      </Suspense>
    </div>
  );
}
