// src/hooks/useMyArtworks.js
//
// Fetches the logged-in user's own artworks. Keyed by user id so it
// invalidates cleanly when artworks are created / edited / deleted.

import { useQuery } from '@tanstack/react-query';

import * as artworkApi from '../api/artwork';
import { useAuthStore } from '../stores/authStore';

function myId(user) {
  return user?._id || user?.id || null;
}

export function useMyArtworks() {
  const user = useAuthStore((s) => s.user);
  const id = myId(user);

  const q = useQuery({
    queryKey: ['artworks', 'mine', id],
    queryFn: () => artworkApi.listArtworks({ artist: id, sort: '-createdAt', limit: 50 }),
    enabled: !!id,
    staleTime: 30_000,
  });

  return {
    artworks: q.data ?? [],
    isLoading: q.isLoading,
    isRefreshing: q.isFetching,
    refetch: q.refetch,
  };
}