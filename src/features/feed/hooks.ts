import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchItems } from "./api";
import { FeedFilters } from "./types";

export const useFeedItems = (filters: FeedFilters) => {
  return useInfiniteQuery({
    queryKey: ["feed", filters],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchItems({ ...filters, page: pageParam, limit: 20 });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than limit, we are done
      if (lastPage.length < 20) return undefined;
      return allPages.length; // Next page index e.g. 0, 1 -> next is 2
    },
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
  });
};
