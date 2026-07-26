import { useState, useEffect } from "react";

interface RatingItem {
  id: number;
  rating: number;
  review: string | null;
  createdAt: Date;
  user: {
    username: string;
    image: string | null;
    name: string | null;
  };
}

interface PaginatedRatingsResponse {
  ratings: RatingItem[];
  totalCount: number;
  hasNextPage: boolean;
  avgRating: number;
}

export function usePaginatedRatings(slug: string) {
  const [data, setData] = useState<RatingItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchRatings = async (pageNum: number, append = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/djs/${slug}/ratings?${queryParams}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch ratings");
      }

      const result: PaginatedRatingsResponse = await response.json();
      
      if (append) {
        setData((prev) => [...prev, ...result.ratings]);
      } else {
        setData(result.ratings);
      }
      
      setTotalCount(result.totalCount);
      setHasNextPage(result.hasNextPage);
      setAvgRating(result.avgRating);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextPage = () => {
    if (hasNextPage && !isLoading) {
      fetchRatings(page + 1, true);
    }
  };

  const reset = () => {
    setData([]);
    setPage(1);
    fetchRatings(1, false);
  };

  useEffect(() => {
    fetchRatings(1, false);
  }, [slug]);

  return {
    ratings: data,
    totalCount,
    hasNextPage,
    avgRating,
    isLoading,
    error,
    loadNextPage,
    reset,
  };
}
