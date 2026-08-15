"use client";

import { useState } from "react";
import {
  MessageSquare,
  Clock,
  AlertTriangle,
  Shield,
  TrendingUp,
  FileText,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

interface ResponseManagementContentProps {
  trackingData: any;
  reminderStats: any;
  escalationStats: any;
  templates: any[];
}

export default function ResponseManagementContent({
  trackingData,
  reminderStats,
  escalationStats,
  templates,
}: ResponseManagementContentProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="unresponded">Unresponded</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab
            trackingData={trackingData}
            reminderStats={reminderStats}
            escalationStats={escalationStats}
          />
        </TabsContent>

        <TabsContent value="unresponded" className="space-y-6">
          <UnrespondedTab unrespondedReviews={trackingData.unrespondedReviews} />
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <RemindersTab reminderStats={reminderStats} />
        </TabsContent>

        <TabsContent value="escalations" className="space-y-6">
          <EscalationsTab escalationStats={escalationStats} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplatesTab templates={templates} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({
  trackingData,
  reminderStats,
  escalationStats,
}: {
  trackingData: any;
  reminderStats: any;
  escalationStats: any;
}) {
  return (
    <div className="space-y-6">
      {/* Response Rate Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <MessageSquare className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {trackingData.overview.responseRate.toFixed(1)}%
              </p>
              <p className="text-muted-foreground text-xs">Response Rate</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {trackingData.overview.avgResponseTime.toFixed(1)}h
              </p>
              <p className="text-muted-foreground text-xs">Avg Response Time</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {reminderStats.totalUnresponded}
              </p>
              <p className="text-muted-foreground text-xs">Unresponded</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {escalationStats.totalEscalated}
              </p>
              <p className="text-muted-foreground text-xs">Escalated</p>
            </div>
          </div>
        </Card>
      </div>

      {/* DJ Performance */}
      <Card className="border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          DJ Response Performance
        </h2>
        <div className="space-y-4">
          {trackingData.djPerformance.slice(0, 5).map((dj: any) => (
            <div
              key={dj.djProfileId}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex-1">
                <p className="font-medium text-white">{dj.stageName}</p>
                <p className="text-sm text-gray-400">
                  {dj.respondedCount}/{dj.totalReviews} reviews responded
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {dj.responseRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400">Response Rate</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {dj.avgResponseTime.toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-400">Avg Time</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    dj.responseRate >= 80
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : dj.responseRate >= 50
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }
                >
                  {dj.responseRate >= 80 ? "Excellent" : dj.responseRate >= 50 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function UnrespondedTab({ unrespondedReviews }: { unrespondedReviews: any[] }) {
  return (
    <Card className="border-white/8 bg-white/3 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Unresponded Reviews</h2>
        <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
          {unrespondedReviews.length} pending
        </Badge>
      </div>

      {unrespondedReviews.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-4 text-gray-400">No unresponded reviews</p>
        </div>
      ) : (
        <div className="space-y-4">
          {unrespondedReviews.slice(0, 20).map((review) => (
            <div
              key={review.id}
              className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-medium text-white">
                    {review.rating} stars
                  </span>
                  <span className="text-sm text-gray-400">
                    by {review.user.name || review.user.email}
                  </span>
                  <span className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {review.review && (
                  <p className="text-sm text-gray-300 line-clamp-2">{review.review}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  DJ: {review.djProfile.stageName}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`/admin/reviews/${review.id}`}>View</a>
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RemindersTab({ reminderStats }: { reminderStats: any }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <Bell className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {reminderStats.needingUrgentReminder}
              </p>
              <p className="text-muted-foreground text-xs">Urgent (24h)</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {reminderStats.needingStandardReminder}
              </p>
              <p className="text-muted-foreground text-xs">Standard (72h)</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <MessageSquare className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {reminderStats.needingLowPriorityReminder}
              </p>
              <p className="text-muted-foreground text-xs">Low Priority (7d)</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {reminderStats.avgTimeUnresponded.toFixed(1)}h
              </p>
              <p className="text-muted-foreground text-xs">Avg Time</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Reminder Rules</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div>
              <p className="font-medium text-white">Urgent - 24 hours</p>
              <p className="text-sm text-gray-400">
                Reviews below 3 stars unresponded for 24+ hours
              </p>
            </div>
            <Badge className="border-red-500/30 bg-red-500/10 text-red-400">
              {reminderStats.needingUrgentReminder} reviews
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <div>
              <p className="font-medium text-white">Standard - 72 hours</p>
              <p className="text-sm text-gray-400">
                Reviews below 4 stars unresponded for 72+ hours
              </p>
            </div>
            <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
              {reminderStats.needingStandardReminder} reviews
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <div>
              <p className="font-medium text-white">Low Priority - 7 days</p>
              <p className="text-sm text-gray-400">
                Any review unresponded for 7+ days
              </p>
            </div>
            <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-400">
              {reminderStats.needingLowPriorityReminder} reviews
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

function EscalationsTab({ escalationStats }: { escalationStats: any }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {escalationStats.criticalEscalations}
              </p>
              <p className="text-muted-foreground text-xs">Critical</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Shield className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {escalationStats.highEscalations}
              </p>
              <p className="text-muted-foreground text-xs">High</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {escalationStats.mediumEscalations}
              </p>
              <p className="text-muted-foreground text-xs">Medium</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {escalationStats.resolvedToday}
              </p>
              <p className="text-muted-foreground text-xs">Resolved Today</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Escalation Rules</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div>
              <p className="font-medium text-white">Critical - 1 Star Reviews (24h)</p>
              <p className="text-sm text-gray-400">
                1-star reviews unresponded for 24+ hours
              </p>
            </div>
            <Badge className="border-red-500/30 bg-red-500/10 text-red-400">
              {escalationStats.criticalEscalations} escalated
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
            <div>
              <p className="font-medium text-white">High - 2 Star Reviews (48h)</p>
              <p className="text-sm text-gray-400">
                2-star reviews unresponded for 48+ hours
              </p>
            </div>
            <Badge className="border-orange-500/30 bg-orange-500/10 text-orange-400">
              {escalationStats.highEscalations} escalated
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <div>
              <p className="font-medium text-white">Medium - Multiple Unresponded</p>
              <p className="text-sm text-gray-400">
                DJs with 5+ unresponded reviews (72h)
              </p>
            </div>
            <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
              {escalationStats.mediumEscalations} escalated
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TemplatesTab({ templates }: { templates: any[] }) {
  return (
    <Card className="border-white/8 bg-white/3 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Response Templates</h2>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-4 text-gray-400">No templates configured</p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-medium text-white">{template.name}</span>
                  <Badge
                    variant="outline"
                    className="border-white/10 bg-white/5 text-xs text-gray-400"
                  >
                    {template.category}
                  </Badge>
                  {template.isDefault && (
                    <Badge className="border-blue-500/30 bg-blue-500/10 text-xs text-blue-400">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {template.content}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Used {template.usageCount} times
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}