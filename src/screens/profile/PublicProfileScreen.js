// src/screens/profile/PublicProfileScreen.js
//
// Viewing a user's public profile (reached by tapping an artist). Shows
// avatar, name, bio, their artworks, and an action button:
//   - viewing your OWN profile  → "Edit profile"
//   - viewing someone ELSE's    → "Message" (opens a chat thread)
//
// Receives { userId, profile? } via route params. The optional `profile`
// (e.g. the populated artist object from an artwork) renders instantly
// while the full record refetches.

import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Pencil, MessageCircle, MoreVertical } from 'lucide-react-native';

import SectionHeader from '../../components/SectionHeader';
import ArtworkGrid from '../../components/ArtworkGrid';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import { useUserProfile } from '../../hooks/useUserProfile';
import { coverImageUrl } from '../../utils/format';
import UserModerationSheet from '../../components/UserModerationSheet';

function initialOf(u) {
  const c = u?.displayName?.trim().charAt(0) || u?.name?.trim().charAt(0);
  return c ? c.toUpperCase() : '?';
}

export default function PublicProfileScreen({ route }) {
  const { colors, fontSize, spacing } = useTheme();
  const { t } = useT();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [modVisible, setModVisible] = useState(false);

  const userId = route.params?.userId;
  const initialProfile = route.params?.profile ?? undefined;

  const me = useAuthStore((s) => s.user);
  const myId = me?._id || me?.id || null;
  const isSelf = !!myId && String(myId) === String(userId);

  const { profile, isLoadingProfile, artworks, isLoadingArtworks } =
    useUserProfile(userId, { initialProfile });

  const s = makeStyles({ colors, fontSize, spacing });

  const user = profile ?? initialProfile ?? {};
  const avatar = coverImageUrl(user.profileImage);
  const name = user.displayName || user.name || '';

  const onArtworkPress = (artwork) =>
    navigation.navigate('ArtworkDetail', { artwork });

  const onAction = () => {
    if (isSelf) {
      navigation.navigate('EditProfile');
      return;
    }
    // Open a chat thread with this user. No conversationId yet — the first
    // send creates it server-side (handled in MessageThreadScreen/useThread).
    if (!me) {
      navigation.navigate('AuthGate');
      return;
    }
    navigation.navigate('MessageThread', {
      recipientId: String(userId),
      recipientName: name,
      recipientImage: avatar || null,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Back button bar */}
        <View style={[s.topBar, { paddingTop: spacing.lg + 24 }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
            accessibilityLabel={t('navBack') ?? 'Back'}
          >
            <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
          </Pressable>

          {!isSelf && !!me ? (
            <Pressable
              onPress={() => setModVisible(true)}
              hitSlop={10}
              style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
              accessibilityLabel={t('modOptions') ?? 'Options'}
            >
              <MoreVertical size={22} color={colors.text} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>

        <View style={s.header}>
          <View style={s.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={s.avatar} />
            ) : (
              <View
                style={[
                  s.avatar,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderLight ?? '#eee',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Text style={s.avatarInitial}>{initialOf(user)}</Text>
              </View>
            )}
          </View>

          {name ? (
            <Text style={s.name}>{name}</Text>
          ) : isLoadingProfile ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />
          ) : null}

          {/* Bio — real bio if present, otherwise an italic placeholder. */}
          {user.bio ? (
            <Text style={s.bio}>{user.bio}</Text>
          ) : isLoadingProfile ? null : (
            <Text style={s.bioPlaceholder}>
              {t('profileNoBioOther') ?? 'No bio yet.'}
            </Text>
          )}

          {/* Action button: Edit (self, outlined) or Message (other, filled) */}
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            style={({ pressed }) => [
              s.actionBtn,
              isSelf ? s.actionBtnOutlined : s.actionBtnFilled,
              pressed && { opacity: 0.85 },
            ]}
          >
            {isSelf ? (
              <>
                <Pencil size={16} color={colors.accent} strokeWidth={2} />
                <Text style={s.actionText}>{t('profileEdit') ?? 'Edit profile'}</Text>
              </>
            ) : (
              <>
                <MessageCircle size={16} color="#fff" strokeWidth={2} />
                <Text style={[s.actionText, s.actionTextFilled]}>
                  {t('message') ?? 'Message'}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Their artworks */}
        <SectionHeader
          label={
            isSelf
              ? (t('profileMyArtworks') ?? 'My artworks')
              : (t('profileTheirArtworks') ?? 'Artworks')
          }
        />

        {isLoadingArtworks ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : artworks.length > 0 ? (
          <ArtworkGrid artworks={artworks} onPress={onArtworkPress} />
        ) : (
          <View style={s.emptyWrap}>
            <Text style={s.emptyText}>
              {t('profileNoArtworksOther') ?? 'No artworks yet.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <UserModerationSheet
        visible={modVisible}
        onClose={() => setModVisible(false)}
        userId={String(userId)}
        userName={name}
        onBlocked={() => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unreadTotal'] });
          navigation.goBack();
        }}
      />
    </View>
  );
}

function makeStyles({ colors, fontSize, spacing }) {
  return StyleSheet.create({
    topBar: { paddingHorizontal: spacing.lg, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8 },
    avatarWrap: { marginTop: 4, marginBottom: 16 },
    avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 1 },
    avatarInitial: { fontSize: 44, fontWeight: '300', color: colors.text },
    name: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    bio: {
      marginTop: 12,
      fontSize: fontSize.md,
      color: colors.text,
      lineHeight: 22,
      textAlign: 'center',
      paddingHorizontal: 8,
    },
    bioPlaceholder: {
      marginTop: 12,
      fontSize: fontSize.sm,
      color: colors.textMuted,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    actionBtn: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      alignSelf: 'stretch',
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    actionBtnOutlined: { backgroundColor: 'transparent' },
    actionBtnFilled: { backgroundColor: colors.accent },
    actionText: { color: colors.accent, fontSize: fontSize.md, fontWeight: '700' },
    actionTextFilled: { color: '#fff' },
    loadingWrap: { padding: 40, alignItems: 'center' },
    emptyWrap: { paddingHorizontal: 32, paddingVertical: 24, alignItems: 'center' },
    emptyText: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
  });
}