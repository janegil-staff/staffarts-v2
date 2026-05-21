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
    // placeholderData (not initialData): the passed-in artist object only
    // has { _id, displayName, profileImage } — no bio. Using it as a
    // placeholder shows it instantly for the avatar/name while STILL
    // firing the real fetch, so bio (and anything else missing) fills in.
    // initialData would seed the cache as "fresh" and skip the fetch.
    placeholderData: initialProfile,
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