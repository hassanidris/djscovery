import { useState, useEffect } from "react";

interface MediaItem {
  id: number;
  type: "AUDIO" | "VIDEO" | "IMAGE";
  url: string;
  title: string | null;
  duration: string | null;
  thumbnail: string | null;
  isSpotlight: boolean;
  sortOrder: number;
  playCount: number;
  viewCount: number;
}

interface PaginatedMediaResponse {
  media: MediaItem[];
  totalCount: number;
  hasNextPage: boolean;
  typeCounts: {
    AUDIO: number;
    VIDEO: number;
    IMAGE: number;
  };
}

export function usePaginatedMedia(
  slug: string,
  type?: "AUDIO" | "VIDEO" | "IMAGE",
) {
  const [data, setData] = useState<MediaItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [typeCounts, setTypeCounts] = useState<{
    AUDIO: number;
    VIDEO: number;
    IMAGE: number;
  }>({ AUDIO: 0, VIDEO: 0, IMAGE: 0 });

  const fetchMedia = async (pageNum: number, append = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: "12",
      });

      if (type) {
        queryParams.set("type", type);
      }

      const response = await fetch(`/api/djs/${slug}/media?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }

      const result: PaginatedMediaResponse = await response.json();

      if (append) {
        setData((prev) => [...prev, ...result.media]);
      } else {
        setData(result.media);
      }

      setTotalCount(result.totalCount);
      setHasNextPage(result.hasNextPage);
      setTypeCounts(result.typeCounts);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextPage = () => {
    if (hasNextPage && !isLoading) {
      fetchMedia(page + 1, true);
    }
  };

  const reset = () => {
    setData([]);
    setPage(1);
    fetchMedia(1, false);
  };

  useEffect(() => {
    queueMicrotask(() => fetchMedia(1, false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, type]);

  return {
    media: data,
    totalCount,
    hasNextPage,
    isLoading,
    error,
    loadNextPage,
    reset,
    typeCounts,
  };
}
