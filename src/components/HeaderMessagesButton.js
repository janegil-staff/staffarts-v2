// src/components/HeaderMessagesButton.js
//
// Mail icon with an unread badge, designed to drop into the Header's `left`
// slot. The badge count comes from useUnreadCount — the server aggregate —
// so it reflects the same number everywhere and never drifts from a local
// tally. Only rendered for logged-in users (no inbox when logged out).

import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Mail } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuthStore } from '../stores/authStore';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { useT } from '../i18n';

const HEADER_FG = '#FFFFFF';

export default function HeaderMessagesButton() {
  const navigation = useNavigation();
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!(user && (user._id || user.email));

  // Only query when logged in.
  const { unread } = useUnreadCount({ enabled: isLoggedIn });

  const styles = useMemo(() => makeStyles(), []);

  if (!isLoggedIn) return null;

  const badge = unread > 99 ? '99+' : String(unread);

  return (
    <Pressable
      onPress={() => navigation.navigate('Messages')}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={
        unread > 0
          ? `${t('messagesTitle') ?? 'Messages'}, ${unread} ${t('messagesUnread') ?? 'unread'}`
          : (t('messagesTitle') ?? 'Messages')
      }
    >
      <Mail size={22} color={HEADER_FG} strokeWidth={2} />
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function makeStyles() {
  return StyleSheet.create({
    btn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: 0,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#C97060', // terracotta accent
      borderWidth: 1.5,
      borderColor: '#2D4A6E', // navy header — makes the badge "lift" off the band
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '800',
    },
  });
}