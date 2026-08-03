import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { usePaginatedRatings } from "@/hooks/usePaginatedRatings";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockResponse(data: any) {
  return {
    ok: true,
    json: async () => data,
  };
}

const SAMPLE_RATINGS = {
  ratings: [
    {
      id: 1,
      rating: 5,
      review: "Amazing DJ!",
      reviewType: "DIRECT",
      createdAt: "2024-01-15T00:00:00.000Z",
      user: { username: "user1", image: null, name: "User One" },
      event: null,
    },
    {
      id: 2,
      rating: 4,
      review: "Great event set",
      reviewType: "EVENT_ATTENDEE",
      createdAt: "2024-01-16T00:00:00.000Z",
      user: { username: "user2", image: null, name: "User Two" },
      event: {
        id: 10,
        slug: "summer-beats",
        title: "Summer Beats",
        startDate: "2024-01-10T00:00:00.000Z",
      },
    },
  ],
  totalCount: 2,
  hasNextPage: false,
  avgRating: 4.5,
};

describe("usePaginatedRatings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches all ratings on mount with no filter", async () => {
    mockFetch.mockResolvedValue(mockResponse(SAMPLE_RATINGS));

    const { result } = renderHook(() => usePaginatedRatings("test-dj"));

    await waitFor(() => {
      expect(result.current.ratings).toHaveLength(2);
    });

    expect(result.current.totalCount).toBe(2);
    expect(result.current.avgRating).toBe(4.5);
    expect(result.current.hasNextPage).toBe(false);

    // Verify fetch was called with correct URL (no eventId param)
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/api/djs/test-dj/ratings");
    expect(url).toContain("page=1");
    expect(url).toContain("limit=10");
    expect(url).not.toContain("eventId");
  });

  it("fetches with eventId=direct when filter is 'direct'", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ ...SAMPLE_RATINGS, ratings: [] }),
    );

    renderHook(() => usePaginatedRatings("test-dj", "direct"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("eventId=direct");
  });

  it("fetches with eventId=N when filter is a number", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ ...SAMPLE_RATINGS, ratings: [] }),
    );

    renderHook(() => usePaginatedRatings("test-dj", 42));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("eventId=42");
  });

  it("refetches when filter changes", async () => {
    mockFetch.mockResolvedValue(mockResponse(SAMPLE_RATINGS));

    const { rerender } = renderHook(
      ({ filter }) => usePaginatedRatings("test-dj", filter),
      { initialProps: { filter: undefined as undefined | "direct" | number } },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Change filter to "direct"
    rerender({ filter: "direct" });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    const secondUrl = mockFetch.mock.calls[1][0] as string;
    expect(secondUrl).toContain("eventId=direct");
  });

  it("refetches when slug changes", async () => {
    mockFetch.mockResolvedValue(mockResponse(SAMPLE_RATINGS));

    const { rerender } = renderHook(({ slug }) => usePaginatedRatings(slug), {
      initialProps: { slug: "dj-one" },
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    rerender({ slug: "dj-two" });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    const secondUrl = mockFetch.mock.calls[1][0] as string;
    expect(secondUrl).toContain("/api/djs/dj-two/ratings");
  });

  it("sets error on fetch failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => usePaginatedRatings("test-dj"));

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    });
  });

  it("sets error on non-ok response", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const { result } = renderHook(() => usePaginatedRatings("test-dj"));

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to fetch ratings");
    });
  });

  it("loadNextPage appends results", async () => {
    const page1 = {
      ratings: SAMPLE_RATINGS.ratings,
      totalCount: 4,
      hasNextPage: true,
      avgRating: 4.5,
    };
    const page2 = {
      ratings: [
        {
          id: 3,
          rating: 3,
          review: "Okay",
          reviewType: "DIRECT",
          createdAt: "2024-01-17T00:00:00.000Z",
          user: { username: "user3", image: null, name: "User Three" },
          event: null,
        },
      ],
      totalCount: 4,
      hasNextPage: false,
      avgRating: 4.0,
    };

    mockFetch
      .mockResolvedValueOnce(mockResponse(page1))
      .mockResolvedValueOnce(mockResponse(page2));

    const { result } = renderHook(() => usePaginatedRatings("test-dj"));

    await waitFor(() => {
      expect(result.current.ratings).toHaveLength(2);
      expect(result.current.hasNextPage).toBe(true);
    });

    // Load next page
    act(() => {
      result.current.loadNextPage();
    });

    await waitFor(() => {
      expect(result.current.ratings).toHaveLength(3);
    });
  });

  it("loadNextPage does nothing when hasNextPage is false", async () => {
    mockFetch.mockResolvedValue(mockResponse(SAMPLE_RATINGS));

    const { result } = renderHook(() => usePaginatedRatings("test-dj"));

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(false);
    });

    const callsBefore = mockFetch.mock.calls.length;

    act(() => {
      result.current.loadNextPage();
    });

    // Should not have made another fetch
    expect(mockFetch.mock.calls.length).toBe(callsBefore);
  });

  it("reset clears data and refetches page 1", async () => {
    mockFetch.mockResolvedValue(mockResponse(SAMPLE_RATINGS));

    const { result } = renderHook(() => usePaginatedRatings("test-dj"));

    await waitFor(() => {
      expect(result.current.ratings).toHaveLength(2);
    });

    act(() => {
      result.current.reset();
    });

    // Should have fetched twice (initial + reset)
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
