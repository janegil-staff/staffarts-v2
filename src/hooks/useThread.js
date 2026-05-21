// src/hooks/useThread.js
//
// One conversation's messages (infinite scroll, newest-first) plus a send
// mutation. Mirrors the useInfiniteQuery shape used by useExploreArtworks:
// pages are flattened into a single array, and getNextPageParam reads the
// cursor the API returns (nextBefore).
//
// IMPORTANT — new-thread handling:
// When a chat is started from "Message artist" there is no conversationId yet.
// The query is disabled (nothing to fetch) and the cache is empty. On the first
// successful send the server CREATES the thread and returns the saved message,
// whose `conversation` field is the brand-new thread id. We surface that id via
// onConversationCreated so the screen can adopt it (enabling the query, live
// socket updates, and mark-read). We also SEED the cache so the just-sent
// message renders immediately instead of vanishing.

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messagesApi from '../api/messages';

const PAGE_SIZE = 30;

// Build an empty infinite-query cache shape with one page.
function emptyPages() {
  return {
    pages: [{ success: true, data: [], hasMore: false, nextBefore: null }],
    pageParams: [null],
  };
}

// Prepend a message to page 0 of an infinite-query cache (newest-first),
// creating the structure if it doesn't exist yet. Dedupes by _id.
function prependMessage(old, message) {
  const base = old?.pages?.length ? old : emptyPages();
  const first = base.pages[0];
  const exists = first?.data?.some((m) => String(m._id) === String(message._id));
  if (exists) return base;
  const pages = [...base.pages];
  pages[0] = { ...first, data: [message, ...(first.data ?? [])] };
  return { ...base, pages };
}

export function useThread({ conversationId, recipientId, onConversationCreated } = {}) {
  const queryClient = useQueryClient();

  const key = ['thread', conversationId ? String(conversationId) : 'new'];

  const query = useInfiniteQuery({
    queryKey: key,
    enabled: !!conversationId,
    queryFn: ({ pageParam }) =>
      messagesApi.listThreadPaged({
        conversationId,
        before: pageParam || undefined,
        limit: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextBefore : undefined,
    initialPageParam: null,
    // Keep this low: when a brand-new thread's id is adopted we want the full
    // server history fetched right away rather than trusting any seeded cache.
    staleTime: 0,
  });

  // Newest-first across all pages.
  const messages = query.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  const send = useMutation({
    mutationFn: ({ body, artworkRef }) =>
      messagesApi.sendMessage({ toUserId: recipientId, body, artworkRef }),
    onSuccess: (saved) => {
      // The thread id this message belongs to (real, server-assigned).
      const newConvId = saved?.conversation ? String(saved.conversation) : null;

      // Append into the cache under whatever key this screen is currently
      // using, so the just-sent message renders immediately.
      queryClient.setQueryData(key, (old) => prependMessage(old, saved));

      // Refresh the inbox preview (lastMessage / ordering) + the badge source.
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unreadTotal'] });

      // First send of a brand-new thread: hand the real id to the screen so it
      // can adopt it. To avoid a blank flash during the key switch, copy the
      // CURRENT 'new' cache (which holds the just-sent message) over to the
      // real-id key. Because staleTime is 0, the query still refetches the full
      // server history immediately and reconciles — but the user never sees an
      // empty list in between.
      if (newConvId && !conversationId) {
        const current = queryClient.getQueryData(key);
        if (current) {
          queryClient.setQueryData(['thread', newConvId], current);
        }
        queryClient.invalidateQueries({ queryKey: ['thread', newConvId] });
        if (typeof onConversationCreated === 'function') {
          onConversationCreated(newConvId);
        }
      }
    },
  });

  return {
    messages,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isRefreshing: query.isRefetching,
    refetch: query.refetch,
    sendMessage: send.mutate,
    sendMessageAsync: send.mutateAsync,
    isSending: send.isPending,
    sendError: send.error,
  };
}