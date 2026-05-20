// src/hooks/useExploreArtworks.js
//
// Infinite-scroll + search hook for the Explore screen. Wraps
// useInfiniteQuery; debounces the search text; supports an "available only"
// toggle. Returns a flat list of artworks plus paging helpers.

import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import * as artworkApi from '../api/artwork';

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 350;

export function useExploreArtworks({ search = '', availableOnly = false } = {}) {
  // Debounce the raw search text so we don't fire a request per keystroke.
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  const query = useInfiniteQuery({
    queryKey: ['artworks', 'explore', debounced, availableOnly],
    queryFn: ({ pageParam = 1 }) =>
      artworkApi.listArtworksPaged({
        page: pageParam,
        limit: PAGE_SIZE,
        sort: '-createdAt',
        q: debounced || undefined,
        available: availableOnly || undefined,
      }),
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? (lastPage.page ?? 1) + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30_000,
  });

  // Flatten all loaded pages into a single array.
  const artworks =
    query.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  const total = query.data?.pages?.[0]?.total ?? 0;

  return {
    artworks,
    total,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isRefreshing: query.isRefetching,
    refetch: query.refetch,
    // Expose whether a search is active (vs. empty) for UI copy.
    isSearching: debounced.length > 0,
  };
}