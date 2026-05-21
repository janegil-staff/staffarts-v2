// src/screens/messages/ConversationListScreen.js
//
// The messages inbox. A list of conversation threads, newest activity first.
// Each row shows the other participant, the last message preview, a relative
// timestamp, and a per-thread unread dot. Pull-to-refresh; tapping a row opens
// the thread.
//
// Data comes from useConversations (server truth). The socket layer invalidates
// ['conversations'] on incoming messages, so this list stays live without
// polling. The per-row unread number is the server's count, never a local tally.

import { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import { useConversations } from '../../hooks/useConversations';
import { coverImageUrl } from '../../utils/format';

function initialOf(name) {
  const c = (name || '').trim().charAt(0);
  return c ? c.toUpperCase() : '?';
}

// Compact relative time: "now", "5m", "3h", "2d", else a short date.
function relativeTime(value, lang) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return '·';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(then).toLocaleDateString(lang || undefined, {
    day: 'numeric',
    month: 'short',
  });
}

export default function ConversationListScreen() {
  const { colors, spacing, fontSize, radius } = useTheme();
  const { t, lang } = useT();
  const navigation = useNavigation();
  const myId = useAuthStore((s) => s.user?._id || s.user?.id || null);

  const { conversations, isLoading, isRefreshing, refetch } = useConversations();

  const s = makeStyles({ colors, spacing, fontSize, radius });

  const openThread = useCallback(
    (c) => {
      const other = c.participant || {};
      navigation.navigate('MessageThread', {
        conversationId: c._id,
        recipientId: other._id || other.id,
        recipientName: other.displayName || other.name || '',
        recipientImage: other.profileImage || null,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }) => {
      const other = item.participant || {};
      const name = other.displayName || other.name || (t('messagesUnknownUser') ?? 'Unknown');
      const avatar = coverImageUrl(other.profileImage);
      const preview = item.lastMessage?.body || '';
      const isMine = item.lastMessage?.sender && String(item.lastMessage.sender) === String(myId);
      const unread = Number(item.unread || 0);

      return (
        <Pressable
          onPress={() => openThread(item)}
          style={({ pressed }) => [s.row, pressed && { opacity: 0.6 }]}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Text style={s.avatarInitial}>{initialOf(name)}</Text>
            </View>
          )}

          <View style={s.rowBody}>
            <View style={s.rowTop}>
              <Text style={[s.name, unread > 0 && s.nameUnread]} numberOfLines={1}>
                {name}
              </Text>
              <Text style={s.time}>
                {relativeTime(item.lastMessage?.at || item.updatedAt, lang)}
              </Text>
            </View>
            <View style={s.rowBottom}>
              <Text
                style={[s.preview, unread > 0 && s.previewUnread]}
                numberOfLines={1}
              >
                {isMine && preview ? `${t('messagesYouPrefix') ?? 'You'}: ${preview}` : preview}
              </Text>
              {unread > 0 && (
                <View style={s.unreadDot}>
                  <Text style={s.unreadDotText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      );
    },
    [s, t, lang, myId, openThread],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Simple header with a back button (this screen is pushed on the stack). */}
      <View style={[s.header, { paddingTop: spacing.lg + 24 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
          accessibilityLabel={t('navBack') ?? 'Back'}
        >
          <ChevronLeft size={24} color="#fff" strokeWidth={2.5} />
        </Pressable>
        <Text style={s.headerTitle}>{t('messagesTitle') ?? 'Messages'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={s.centerLoad}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderItem}
          onRefresh={refetch}
          refreshing={isRefreshing}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>
                {t('messagesEmpty') ?? 'No conversations yet.'}
              </Text>
            </View>
          }
          contentContainerStyle={
            conversations.length === 0 ? { flex: 1 } : { paddingVertical: spacing.sm }
          }
        />
      )}
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
    headerTitle: { color: '#fff', fontSize: fontSize.lg, fontWeight: '500' },
    centerLoad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: spacing.lg,
      paddingVertical: 12,
    },
    avatar: { width: 52, height: 52, borderRadius: 26 },
    avatarFallback: {
      backgroundColor: colors.surfaceMuted ?? colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: { color: colors.text, fontWeight: '700', fontSize: fontSize.lg },
    rowBody: { flex: 1, justifyContent: 'center', gap: 3 },
    rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    name: { color: colors.text, fontSize: fontSize.md, fontWeight: '500', flex: 1 },
    nameUnread: { fontWeight: '800' },
    time: { color: colors.textMuted, fontSize: fontSize.xs },
    rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    preview: { color: colors.textMuted, fontSize: fontSize.sm, flex: 1 },
    previewUnread: { color: colors.text, fontWeight: '600' },
    unreadDot: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    unreadDotText: { color: '#fff', fontSize: 11, fontWeight: '800' },
    sep: {
      height: 1,
      backgroundColor: colors.borderLight ?? '#eee',
      marginLeft: spacing.lg + 52 + 12, // align under text, not avatar
    },
    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    emptyText: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
  });
}