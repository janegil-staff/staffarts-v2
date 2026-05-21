// src/screens/messages/MessageThreadScreen.js
//
// One conversation. Inverted FlatList (newest at the bottom) with infinite
// scroll upward for history, and a composer pinned to the bottom.
//
// Route params:
//   conversationId  -- existing thread id (undefined for a brand-new chat
//                      started from "Message artist"; the first send creates
//                      the thread server-side and we adopt the returned id)
//   recipientId     -- the other user's id (required to send)
//   recipientName   -- display name for the header
//   recipientImage  -- avatar url (optional)
//   artworkRef      -- optional artwork id to attach to the first message
//                      ("about this piece" context)
//
// New-thread flow: we keep the conversation id in state, seeded from the route
// param. When the first send creates the thread, useThread calls
// onConversationCreated with the real id; we adopt it, which enables the
// thread query, registers the active conversation with the socket, and lets
// mark-read run.

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Send, MoreVertical } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import { useThread } from '../../hooks/useThread';
import { setActiveConversation } from '../../services/socket';
import * as messagesApi from '../../api/messages';
import { coverImageUrl } from '../../utils/format';
import UserModerationSheet from '../../components/UserModerationSheet';

function initialOf(name) {
  const c = (name || '').trim().charAt(0);
  return c ? c.toUpperCase() : '?';
}

export default function MessageThreadScreen({ route }) {
  const { colors, spacing, fontSize, radius } = useTheme();
  const { t } = useT();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const myId = useAuthStore((s) => s.user?._id || s.user?.id || null);

  const {
    conversationId: routeConversationId,
    recipientId,
    recipientName = '',
    recipientImage = null,
    artworkRef = null,
  } = route.params || {};

  // The live conversation id. Seeded from the route; gets set when a brand-new
  // thread is created on first send.
  const [conversationId, setConversationId] = useState(routeConversationId || null);

  const [draft, setDraft] = useState('');
  const [modVisible, setModVisible] = useState(false);
  // Once we attach the artwork to the first message, don't attach it again.
  const artworkAttachedRef = useRef(false);

  const {
    messages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    sendMessage,
    isSending,
  } = useThread({
    conversationId,
    recipientId,
    onConversationCreated: (newId) => setConversationId(newId),
  });

  const s = makeStyles({ colors, spacing, fontSize, radius });

  // Entry points like "Message artist" / profile pass only a recipientId, not
  // a conversationId. If a thread with this person ALREADY exists, look it up
  // and adopt its id so the existing history loads — instead of starting on an
  // empty 'new' thread. Runs once when we have a recipient but no thread yet.
  useEffect(() => {
    let cancelled = false;
    if (conversationId || !recipientId) return undefined;
    messagesApi
      .findConversationWith(recipientId)
      .then((existingId) => {
        if (!cancelled && existingId) setConversationId(existingId);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // Only depends on recipientId: once we adopt an id, conversationId is set
    // and the guard above stops it re-running.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientId]);

  // Register/unregister this thread as the socket's "active" conversation so
  // incoming messages append live. Re-runs when a new thread is adopted.
  useEffect(() => {
    if (conversationId) setActiveConversation(conversationId);
    return () => setActiveConversation(null);
  }, [conversationId]);

  // Mark read on focus (clears this thread's unread + the badge contribution).
  useFocusEffect(
    useCallback(() => {
      if (!conversationId) return;
      messagesApi
        .markConversationRead(conversationId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unreadTotal'] });
        })
        .catch(() => {});
    }, [conversationId, queryClient]),
  );

  const onSend = () => {
    const body = draft.trim();
    if (!body || isSending || !recipientId) return;

    const payload = { body };
    // Attach artwork context to the very first message only.
    if (artworkRef && !artworkAttachedRef.current) {
      payload.artworkRef = artworkRef;
      artworkAttachedRef.current = true;
    }

    sendMessage(payload);
    setDraft('');
  };

  const renderItem = useCallback(
    ({ item }) => {
      const mine = String(item.sender) === String(myId);
      return (
        <View style={[s.bubbleRow, mine ? s.bubbleRowMine : s.bubbleRowTheirs]}>
          <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleTheirs]}>
            {/* Optional artwork context chip on a message */}
            {item.artworkRef && typeof item.artworkRef === 'object' && (
              <View style={s.artworkChip}>
                {Array.isArray(item.artworkRef.images) && item.artworkRef.images[0] ? (
                  <Image
                    source={{ uri: coverImageUrl(item.artworkRef.images[0]) }}
                    style={s.artworkChipImg}
                  />
                ) : null}
                <Text style={s.artworkChipText} numberOfLines={1}>
                  {item.artworkRef.title || (t('messagesAboutArtwork') ?? 'About this artwork')}
                </Text>
              </View>
            )}
            <Text style={[s.bubbleText, mine ? s.bubbleTextMine : s.bubbleTextTheirs]}>
              {item.body}
            </Text>
          </View>
        </View>
      );
    },
    [s, myId, t],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[s.header, { paddingTop: spacing.lg + 24 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
          accessibilityLabel={t('navBack') ?? 'Back'}
        >
          <ChevronLeft size={24} color="#fff" strokeWidth={2.5} />
        </Pressable>

        <View style={s.headerCenter}>
          {recipientImage ? (
            <Image source={{ uri: recipientImage }} style={s.headerAvatar} />
          ) : (
            <View style={[s.headerAvatar, s.headerAvatarFallback]}>
              <Text style={s.headerAvatarInitial}>{initialOf(recipientName)}</Text>
            </View>
          )}
          <Text style={s.headerName} numberOfLines={1}>
            {recipientName || (t('messagesTitle') ?? 'Messages')}
          </Text>
        </View>

        {recipientId ? (
          <Pressable
            onPress={() => setModVisible(true)}
            hitSlop={10}
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
            accessibilityLabel={t('modOptions') ?? 'Options'}
          >
            <MoreVertical size={22} color="#fff" strokeWidth={2.5} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* iOS lifts via KeyboardAvoidingView; Android uses its native "pan"
          (softwareKeyboardLayoutMode: pan) and needs no avoider here. */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
      >
        {isLoading ? (
          <View style={s.centerLoad}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderItem}
            inverted
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={s.loadMore}>
                  <ActivityIndicator color={colors.accent} size="small" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={s.emptyWrap}>
                <Text style={s.emptyText}>
                  {t('messagesThreadEmpty') ?? 'Say hello 👋'}
                </Text>
              </View>
            }
            contentContainerStyle={
              messages.length === 0
                ? { flex: 1, justifyContent: 'center' }
                : { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }
            }
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Composer. The extra bottom padding creates a small gap between the
            input and the top of the keyboard (in Android "pan" mode, padding
            below the input is what the OS clears above the keyboard). */}
        <View style={[s.composer, { paddingBottom: insets.bottom + 20 }]}>
          <TextInput
            style={s.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={t('messagesComposePlaceholder') ?? 'Message…'}
            placeholderTextColor={colors.placeholder ?? colors.textMuted}
            multiline
            selectionColor={colors.accent}
          />
          <Pressable
            onPress={onSend}
            disabled={!draft.trim() || isSending}
            style={({ pressed }) => [
              s.sendBtn,
              (!draft.trim() || isSending) && s.sendBtnDisabled,
              pressed && draft.trim() && { opacity: 0.85 },
            ]}
            accessibilityLabel={t('messagesSend') ?? 'Send'}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" strokeWidth={2} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <UserModerationSheet
        visible={modVisible}
        onClose={() => setModVisible(false)}
        userId={recipientId}
        userName={recipientName}
        conversationId={conversationId}
        onBlocked={() => {
          // Thread is now hidden on the server; refresh lists/badge and leave.
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unreadTotal'] });
          navigation.goBack();
        }}
      />
    </View>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }) {
  return StyleSheet.create({
    header: {
      backgroundColor: '#2D4A6E',
      paddingHorizontal: spacing.lg,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    headerAvatar: { width: 30, height: 30, borderRadius: 15 },
    headerAvatarFallback: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerAvatarInitial: { color: '#fff', fontWeight: '700', fontSize: fontSize.sm },
    headerName: { color: '#fff', fontSize: fontSize.md, fontWeight: '600', maxWidth: '70%' },
    centerLoad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadMore: { paddingVertical: 16, alignItems: 'center' },
    bubbleRow: { marginVertical: 3, flexDirection: 'row' },
    bubbleRowMine: { justifyContent: 'flex-end' },
    bubbleRowTheirs: { justifyContent: 'flex-start' },
    bubble: {
      maxWidth: '78%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
    },
    bubbleMine: {
      backgroundColor: colors.accent,
      borderBottomRightRadius: 4,
    },
    bubbleTheirs: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
    },
    bubbleText: { fontSize: fontSize.md, lineHeight: 21 },
    bubbleTextMine: { color: '#fff' },
    bubbleTextTheirs: { color: colors.text },
    artworkChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBottom: 8,
      marginBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(0,0,0,0.12)',
    },
    artworkChipImg: { width: 28, height: 28, borderRadius: 6 },
    artworkChipText: { fontSize: fontSize.xs, fontWeight: '700', flex: 1, color: colors.textMuted },
    emptyWrap: { alignItems: 'center', justifyContent: 'center', padding: 24 },
    emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      paddingHorizontal: spacing.lg,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight ?? '#eee',
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      maxHeight: 120,
      minHeight: 40,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      backgroundColor: colors.surface,
      color: colors.text,
      fontSize: fontSize.md,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: { opacity: 0.4 },
  });
}