// src/hooks/useUserProfile.js
//
// Fetches a public user profile + that user's artworks. Used by
// PublicProfileScreen. Keyed by userId so each profile caches separately.

import { useQuery } from '@tanstack/react-query';

import * as userApi from '../api/user';
import * as artworkApi from '../api/artwork';

export function useUserProfile(userId, { initialProfile } = {}) {
  const profileQ = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.fetchPublicProfile(userId),
    enabled: !!userId,
    initialData: initialProfile,
    staleTime: 60_000,
  });

  const artworksQ = useQuery({
    queryKey: ['artworks', 'byUser', userId],
    queryFn: () =>
      artworkApi.listArtworks({ artist: userId, sort: '-createdAt', limit: 50 }),
    enabled: !!userId,
    staleTime: 30_000,
  });

  return {
    profile: profileQ.data ?? null,
    isLoadingProfile: profileQ.isLoading,
    artworks: artworksQ.data ?? [],
    isLoadingArtworks: artworksQ.isLoading,
  };
}