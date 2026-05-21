// src/hooks/useConversations.js
//
// The conversation list for the messages inbox. A plain query (not infinite)
// since most users have a manageable number of threads; the socket layer
// invalidates ['conversations'] whenever a new message arrives so the list
// stays fresh without polling.

import { useQuery } from '@tanstack/react-query';
import * as messagesApi from '../api/messages';

export function useConversations() {
  const query = useQuery({
    queryKey: ['conversations'],
    queryFn: messagesApi.listConversations,
    staleTime: 15_000,
  });

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    refetch: query.refetch,
    error: query.error,
  };
}