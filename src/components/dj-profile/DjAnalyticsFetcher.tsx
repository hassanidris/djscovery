"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  avgRating: number;
  publicEventsCount: number;
  responseRate: number;
  bookingRate: number;
  topCities: Array<{ city: string; country: string; count: number }>;
}

interface OwnerAnalyticsData {
  profileViews: { value: number; growth: number };
  bookingRequests: { value: number; growth: number };
  newFollowers: { value: number; growth: number };
  bookingRate: number;
  topCities: Array<{ city: string; country: string; percentage: number }>;
  trafficSources: Array<{ source: string; count: number }>;
}

interface DjAnalyticsFetcherProps {
  slug: string;
  isOwner: boolean;
  isPremium: boolean;
  onDataFetched: (data: AnalyticsData, ownerData: OwnerAnalyticsData | null) => void;
}

export function DjAnalyticsFetcher({
  slug,
  isOwner,
  isPremium,
  onDataFetched,
}: DjAnalyticsFetcherProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Fetch public analytics
        const analyticsRes = await fetch(`/api/djs/${slug}/analytics`);
        if (analyticsRes.ok) {
          const analyticsData: AnalyticsData = await analyticsRes.json();
          
          // Fetch owner-only analytics if applicable
          let ownerData: OwnerAnalyticsData | null = null;
          if (isOwner && isPremium) {
            const ownerRes = await fetch(`/api/djs/${slug}/owner-analytics`);
            if (ownerRes.ok) {
              ownerData = await ownerRes.json();
            }
          }
          
          onDataFetched(analyticsData, ownerData);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [slug, isOwner, isPremium, onDataFetched]);

  // This component doesn't render anything - it just fetches data
  return null;
}
