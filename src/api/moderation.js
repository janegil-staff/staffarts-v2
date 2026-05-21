// src/api/moderation.js
//
// Block / report API. Same conventions as api/messages.js: each function
// returns the unwrapped payload (res.data.data).

import client from './client';

// Block a user. Returns { blocked: <userId> }.
export async function blockUser(userId) {
  const res = await client.post('/api/blocks', { userId });
  return res.data.data;
}

// Unblock a user. Returns { unblocked: <userId> }.
export async function unblockUser(userId) {
  const res = await client.delete(`/api/blocks/${userId}`);
  return res.data.data;
}

// List users I've blocked. Returns an array of:
//   { userId, displayName, profileImage, blockedAt }
export async function listBlockedUsers() {
  const res = await client.get('/api/blocks');
  return res.data.data;
}

// Report a user, optionally citing a specific message/conversation.
// reason ∈ spam | harassment | inappropriate | scam | impersonation | other
// Returns { reportId }.
export async function reportUser({
  userId,
  messageId = null,
  conversationId = null,
  reason = 'other',
  detail = '',
}) {
  const res = await client.post('/api/reports', {
    userId,
    messageId,
    conversationId,
    reason,
    detail,
  });
  return res.data.data;
}