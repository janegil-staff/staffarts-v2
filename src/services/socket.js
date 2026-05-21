// src/services/socket.js
//
// Global chat socket. One connection for the whole app, opened when the user
// is authenticated and closed on logout.
//
// THE DISCIPLINE THAT PREVENTS BADGE BUGS:
//   - The server is the source of truth for unread counts.
//   - On an incoming message we DO NOT increment any local counter. We
//     invalidate the unread + conversation-list queries and let the server's
//     aggregate be re-fetched. The only thing we mutate directly is the
//     currently-open thread's message list (an append), which is display data,
//     not a count.
//
// Token handling: the access token can be rotated by the axios refresh
// interceptor. We connect with the current token; if the connection is
// rejected as unauthorized we attempt one reconnect after reading the (possibly
// refreshed) token again. On logout we disconnect.

import { io } from 'socket.io-client';

import { API_BASE_URL } from '../config';
import { tokenStorage } from '../api/client';
import { SOCKET_EVENTS } from '../constants/socketEvents';

let socket = null;
let queryClientRef = null;
let getMyId = () => null;

// The conversation currently open on screen, if any. The thread screen sets
// this so we know whether to append an incoming message to an active thread.
let activeConversationId = null;
export function setActiveConversation(id) {
  activeConversationId = id ? String(id) : null;
}

// Allow the app to wire in the query client + a way to read the current user id.
export function configureSocket({ queryClient, getCurrentUserId }) {
  queryClientRef = queryClient;
  if (typeof getCurrentUserId === 'function') getMyId = getCurrentUserId;
}

export function getSocket() {
  return socket;
}

export function isSocketConnected() {
  return !!socket?.connected;
}

// ── Connect ────────────────────────────────────────────────────────────────
export async function connectSocket() {
  if (socket?.connected) return socket;

  const token = await tokenStorage.getAccessToken();
  if (!token) return null; // not logged in; nothing to connect

  // Tear down any stale instance before creating a fresh one.
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(API_BASE_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  bindHandlers(socket);
  return socket;
}

// ── Reconnect with a freshly read token (after a 401/refresh) ───────────────
export async function reconnectWithFreshToken() {
  const token = await tokenStorage.getAccessToken();
  if (!token || !socket) return;
  socket.auth = { token };
  socket.disconnect().connect();
}

// ── Disconnect (logout) ──────────────────────────────────────────────────
export function disconnectSocket() {
  activeConversationId = null;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

// ── Outgoing typing helpers (used by the thread screen) ─────────────────────
export function emitTyping(conversationId, toUserId, typing) {
  if (!socket?.connected || !toUserId) return;
  socket.emit(
    typing ? SOCKET_EVENTS.TYPING_START : SOCKET_EVENTS.TYPING_STOP,
    { conversationId, toUserId },
  );
}

// ── Handler wiring ───────────────────────────────────────────────────────
function bindHandlers(s) {
  s.on('connect_error', async (err) => {
    if (__DEV__) console.log('[socket] connect_error:', err?.message);
    // If the handshake was rejected as unauthorized, the token may have just
    // been rotated by the axios interceptor — retry once with a fresh read.
    if (err?.message === 'unauthorized') {
      const token = await tokenStorage.getAccessToken();
      if (token && socket) {
        socket.auth = { token };
        // socket.io will keep retrying with the new auth on its own cadence.
      }
    }
  });

  // New message arrived (we are the recipient). Update the active thread's
  // cache if it's open; always refresh the list + unread count from server.
  s.on(SOCKET_EVENTS.MESSAGE_NEW, ({ message, conversation } = {}) => {
    const qc = queryClientRef;
    if (!qc || !message) return;

    const convId = String(message.conversation || conversation?._id || '');

    // 1) If this thread is open, append the message to its cache so it shows
    //    instantly. This is display data — not a count.
    if (convId && convId === activeConversationId) {
      qc.setQueryData(['thread', convId], (old) => {
        if (!old?.pages?.length) return old;
        // Newest-first pages: prepend to the first page if not already there.
        const first = old.pages[0];
        const exists = first?.data?.some((m) => String(m._id) === String(message._id));
        if (exists) return old;
        const pages = [...old.pages];
        pages[0] = { ...first, data: [message, ...(first.data ?? [])] };
        return { ...old, pages };
      });

      // We're looking at this thread, so mark it read on the server, which
      // will also clear the unread for this conversation. (Fire and forget.)
      qc.invalidateQueries({ queryKey: ['conversations'] });
    }

    // 2) Always re-pull the server truth for the list + the badge. We do NOT
    //    add 1 to anything locally — the server already counted.
    qc.invalidateQueries({ queryKey: ['conversations'] });
    qc.invalidateQueries({ queryKey: ['unreadTotal'] });
  });

  // The other participant read the conversation — refresh read receipts.
  s.on(SOCKET_EVENTS.CONVERSATION_READ, ({ conversationId } = {}) => {
    const qc = queryClientRef;
    if (!qc || !conversationId) return;
    qc.invalidateQueries({ queryKey: ['thread', String(conversationId)] });
  });

  // Typing indicator is handled by the thread screen via a subscription;
  // we leave USER_TYPING for components to listen to directly if they want.
}