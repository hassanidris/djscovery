"use client";

import { useState } from "react";
import { BookingInquiryCard } from "@/components/booking/BookingInquiryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BookingInquiryViewModel } from "@/components/booking/BookingInquiryCard";

type Props = {
  inquiries: BookingInquiryViewModel[];
};

export default function DjBookingsTabs({ inquiries }: Props) {
  const pending = inquiries.filter((i) => i.status === "PENDING");
  const accepted = inquiries.filter((i) => i.status === "ACCEPTED");
  const past = inquiries.filter(
    (i) => i.status === "DECLINED" || i.status === "CANCELLED",
  );

  const tabs = [
    { value: "pending", label: "Pending", count: pending.length },
    { value: "accepted", label: "Accepted", count: accepted.length },
    { value: "past", label: "Past", count: past.length },
  ];

  const [activeTab, setActiveTab] = useState(
    pending.length > 0 ? "pending" : accepted.length > 0 ? "accepted" : "past",
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6 w-fit bg-white/5">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-active:bg-h_redDark flex-initial gap-1 px-4 data-active:text-white"
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="text-xs opacity-70">({tab.count})</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="pending" className="mt-0">
        {pending.length > 0 ? (
          <div className="space-y-5">
            {pending.map((inquiry) => (
              <BookingInquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                viewerRole="DJ"
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No pending booking inquiries." />
        )}
      </TabsContent>

      <TabsContent value="accepted" className="mt-0">
        {accepted.length > 0 ? (
          <div className="space-y-5">
            {accepted.map((inquiry) => (
              <BookingInquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                viewerRole="DJ"
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No accepted booking inquiries." />
        )}
      </TabsContent>

      <TabsContent value="past" className="mt-0">
        {past.length > 0 ? (
          <div className="space-y-5">
            {past.map((inquiry) => (
              <BookingInquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                viewerRole="DJ"
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No past booking inquiries." />
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
