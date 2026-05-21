// src/api/messages.js
//
// Chat API. Mirrors the conventions in api/artwork.js: each function returns
// the unwrapped payload (res.data.data), and paginated calls return the full
// envelope so the infinite-query hook can read hasMore / nextBefore.

import client from './client';

// List my conversations (newest activity first). Returns an array of:
//   { _id, participant, lastMessage, unread, updatedAt, createdAt }
export async function listConversations() {
  const res = await client.get('/api/conversations');
  return res.data.data; // array
}

// Total unread across all threads — the badge's source of truth. Returns a number.
export async function fetchUnreadTotal() {
  const res = await client.get('/api/conversations/unread');
  return res.data.data.total; // number
}

// Find my existing conversation with a given user, if any.
// Returns the conversation id string, or null when no thread exists yet.
export async function findConversationWith(userId) {
  const res = await client.get(`/api/conversations/with/${userId}`);
  return res.data.data.conversationId; // string | null
}

// One page of a thread, newest first. Returns the full envelope:
//   { success, data: [...messages], limit, hasMore, nextBefore }
export async function listThreadPaged({ conversationId, before, limit = 30 }) {
  const params = { limit };
  if (before) params.before = before;
  const res = await client.get(
    `/api/conversations/${conversationId}/messages`,
    { params },
  );
  return res.data; // envelope
}

// Send a message — the single creation path. Returns the saved message.
export async function sendMessage({ toUserId, body, artworkRef }) {
  const payload = { toUserId, body };
  if (artworkRef) payload.artworkRef = artworkRef;
  const res = await client.post('/api/messages', payload);
  return res.data.data; // the message
}

// Mark a conversation read (clears my unread). Returns { ok, unread }.
export async function markConversationRead(conversationId) {
  const res = await client.post(`/api/conversations/${conversationId}/read`);
  return res.data.data;
}