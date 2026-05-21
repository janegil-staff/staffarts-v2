// src/hooks/useUnreadCount.js
//
// Total unread message count across all conversations. This is the SINGLE
// source of truth for the messages tab badge.
//
// It reads the server-computed aggregate (GET /conversations/unread). The
// socket layer invalidates ['unreadTotal'] on every incoming message, which
// triggers a refetch — so the badge always reflects what the server counted,
// never a number the client incremented from socket events. That separation
// is exactly what keeps the badge from drifting / double-counting.

import { useQuery } from '@tanstack/react-query';
import * as messagesApi from '../api/messages';

export function useUnreadCount({ enabled = true } = {}) {
  const query = useQuery({
    queryKey: ['unreadTotal'],
    queryFn: messagesApi.fetchUnreadTotal,
    enabled,
    staleTime: 10_000,
  });

  return {
    unread: query.data ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}