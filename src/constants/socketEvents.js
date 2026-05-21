// src/constants/socketEvents.js
//
// Single source of truth for socket event names — the CLIENT copy. This must
// stay identical to the backend's src/constants/socketEvents.js. Both sides
// import these exact strings so the names can never drift (the camelCase vs
// snake_case mismatch is what silently breaks real-time delivery).
//
// Rule: every event name is snake_case. No exceptions.

export const SOCKET_EVENTS = Object.freeze({
  // ── Server → client ───────────────────────────────────────────────────
  // A new message was persisted; delivered to the recipient's user room.
  MESSAGE_NEW: 'message_new',
  // A conversation was marked read by the other party (clears their unread,
  // lets the sender show read receipts).
  CONVERSATION_READ: 'conversation_read',
  // Relayed typing indicator.
  USER_TYPING: 'user_typing',

  // ── Client → server ───────────────────────────────────────────────────
  // Client signals it is (or stopped) typing in a conversation.
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',

  // ── Connection lifecycle (Socket.io built-ins, named here for clarity) ─
  CONNECT: 'connection',
  DISCONNECT: 'disconnect',
});

export default SOCKET_EVENTS;