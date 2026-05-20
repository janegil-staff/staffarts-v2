// src/hooks/useHomeFeed.js
//
// Data hook for the home screen. Fetches artworks, events, exhibitions,
// and tracks; builds a unified upcoming-shows feed. Returns query state
// and refresh handler.

import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import client from '../api/client';
import { useT } from '../i18n';
import { coverImageUrl } from '../utils/format';

const ARTWORKS_LIMIT = 6;
const SHOWS_LIMIT = 3;
const FETCH_LIMIT_PER_KIND = 10;

const EVENT_TYPE_KEYS = {
  opening: 'homeBadgeOpening',
  workshop: 'homeBadgeWorkshop',
  talk: 'homeBadgeTalk',
  fair: 'homeBadgeFair',
  concert: 'homeBadgeConcert',
  dj_set: 'homeBadgeDjSet',
  live_performance: 'homeBadgeLive',
  open_mic: 'homeBadgeOpenMic',
  festival: 'homeBadgeFestival',
  album_release: 'homeBadgeRelease',
};

// ── API fetchers ───────────────────────────────────────────────────────
// NOTE: all endpoints live under /api on the server.

const fetchArtworks = async () => {
  const { data } = await client.get('/api/artworks', {
    params: { limit: ARTWORKS_LIMIT, sort: '-createdAt' },
  });
  return data?.data ?? [];
};

const fetchEvents = async () => {
  const { data } = await client.get('/api/events', {
    params: { limit: FETCH_LIMIT_PER_KIND, sort: 'date' },
  });
  return data?.data ?? [];
};

const fetchExhibitions = async () => {
  const { data } = await client.get('/api/exhibitions', {
    params: { limit: FETCH_LIMIT_PER_KIND },
  });
  return data?.data ?? [];
};

const fetchTracks = async () => {
  const { data } = await client.get('/api/tracks', {
    params: { limit: FETCH_LIMIT_PER_KIND },
  });
  return data?.tracks ?? data?.data?.tracks ?? data?.data ?? [];
};

// ── Feed builder ───────────────────────────────────────────────────────

function buildShowsFeed(events, exhibitions, tracks, t) {
  const items = [];
  const now = Date.now();

  for (const e of events ?? []) {
    if (!e || typeof e !== 'object') continue;
    const d = e.date ? new Date(e.date) : null;
    if (!d || isNaN(d)) continue;
    items.push({
      ...e,
      _kind: 'event',
      _date: d,
      _imageUrl: coverImageUrl(e.coverImage),
      _badge: t(EVENT_TYPE_KEYS[e.type] || 'homeBadgeEvent'),
    });
  }
  for (const ex of exhibitions ?? []) {
    if (!ex || typeof ex !== 'object') continue;
    const d = ex.startDate ? new Date(ex.startDate) : null;
    if (!d || isNaN(d)) continue;
    items.push({
      ...ex,
      _kind: 'exhibition',
      _date: d,
      _imageUrl: coverImageUrl(ex.coverImage),
      _badge: t('homeBadgeExhibition'),
    });
  }
  for (const tr of tracks ?? []) {
    if (!tr || typeof tr !== 'object') continue;
    items.push({
      ...tr,
      _kind: 'music',
      _date: new Date(),
      _imageUrl: typeof tr.coverImage === 'string' ? tr.coverImage : '',
      _badge:
        tr.genre && String(tr.genre).length > 0
          ? String(tr.genre)
          : t('homeBadgeMusic'),
    });
  }

  return items
    .filter((i) => i._date.getTime() >= now)
    .sort((a, b) => a._date - b._date)
    .slice(0, SHOWS_LIMIT);
}

// ── Hook ────────────────────────────────────────────────────────────────

export function useHomeFeed() {
  const { t } = useT();
  const queryClient = useQueryClient();

  const artworksQ = useQuery({
    queryKey: ['artworks', 'home'],
    queryFn: fetchArtworks,
    staleTime: 60_000,
  });
  const eventsQ = useQuery({
    queryKey: ['events', 'home'],
    queryFn: fetchEvents,
    staleTime: 60_000,
  });
  const exhibitionsQ = useQuery({
    queryKey: ['exhibitions', 'home'],
    queryFn: fetchExhibitions,
    staleTime: 60_000,
  });
  const tracksQ = useQuery({
    queryKey: ['tracks', 'home'],
    queryFn: fetchTracks,
    staleTime: 60_000,
  });

  const shows = useMemo(
    () => buildShowsFeed(eventsQ.data, exhibitionsQ.data, tracksQ.data, t),
    [eventsQ.data, exhibitionsQ.data, tracksQ.data, t],
  );

  const artworks = useMemo(
    () => (artworksQ.data ?? []).slice(0, ARTWORKS_LIMIT),
    [artworksQ.data],
  );

  const isLoading =
    artworksQ.isLoading &&
    eventsQ.isLoading &&
    exhibitionsQ.isLoading &&
    tracksQ.isLoading;

  const isRefreshing =
    artworksQ.isFetching ||
    eventsQ.isFetching ||
    exhibitionsQ.isFetching ||
    tracksQ.isFetching;

  const isEmpty =
    artworks.length === 0 &&
    shows.length === 0 &&
    !artworksQ.isLoading &&
    !eventsQ.isLoading &&
    !exhibitionsQ.isLoading &&
    !tracksQ.isLoading;

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['artworks', 'home'] });
    queryClient.invalidateQueries({ queryKey: ['events', 'home'] });
    queryClient.invalidateQueries({ queryKey: ['exhibitions', 'home'] });
    queryClient.invalidateQueries({ queryKey: ['tracks', 'home'] });
  }, [queryClient]);

  return {
    artworks,
    shows,
    isLoading,
    isRefreshing,
    isEmpty,
    refresh,
  };
}