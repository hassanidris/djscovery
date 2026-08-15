import type { Metadata } from "next";
import { Suspense } from "react";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import ResponseManagementContent from "./ResponseManagementContent";

export const metadata: Metadata = { title: "Response Management" };

export default async function ResponseManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Response Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track DJ responses, send reminders, and manage escalation workflows
        </p>
      </div>

      <Suspense fallback={<AdminTableSkeleton cols={4} rows={4} />}>
        <ResponseManagementData />
      </Suspense>
    </div>
  );
}

async function ResponseManagementData() {
  const { getResponseTrackingData } =
    await import("@/lib/actions/admin/response-tracking");
  const { getReminderStats } =
    await import("@/lib/actions/admin/response-reminders");
  const { getEscalationStats } =
    await import("@/lib/actions/admin/response-escalation");
  const { getResponseTemplates, initializeDefaultTemplates } =
    await import("@/lib/actions/admin/response-templates");

  await initializeDefaultTemplates();

  const [trackingData, reminderStats, escalationStats, templates] =
    await Promise.all([
      getResponseTrackingData("30d"),
      getReminderStats(),
      getEscalationStats(),
      getResponseTemplates(),
    ]);

  return (
    <ResponseManagementContent
      trackingData={trackingData}
      reminderStats={reminderStats}
      escalationStats={escalationStats}
      templates={templates}
    />
  );
}
