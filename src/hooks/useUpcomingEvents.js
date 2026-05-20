// src/hooks/useUpcomingEvents.js
//
// Infinite list of upcoming events for the Shows screen, with an optional
// category filter.

import { useInfiniteQuery } from '@tanstack/react-query';
import * as eventApi from '../api/event';

const PAGE_SIZE = 20;

export function useUpcomingEvents({ category = null } = {}) {
  const query = useInfiniteQuery({
    queryKey: ['events', 'upcoming', category],
    queryFn: ({ pageParam = 1 }) =>
      eventApi.listEventsPaged({
        page: pageParam,
        limit: PAGE_SIZE,
        upcoming: true,
        category: category || undefined,
      }),
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? (lastPage.page ?? 1) + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30_000,
  });

  const events = query.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  return {
    events,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isRefreshing: query.isRefetching,
    refetch: query.refetch,
  };
}