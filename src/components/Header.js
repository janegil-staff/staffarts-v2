// src/components/Header.js
//
// Shared navy header band. Shows on every main screen.
//
// Default behavior:
//   - Right side: avatar (logged in) or "Log in" pill (logged out)
//   - Left side: empty
//
// You can override either side with the `left` or `right` props
// (e.g. a back button on Settings, a close button on NewArtwork).

import { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../theme/ThemeContext';
import { useT } from '../i18n';

const HEADER_BG = '#2D4A6E'; // Staff Arts navy
const HEADER_FG = '#FFFFFF';

function initialOf(user) {
  const first =
    user?.name?.trim().charAt(0) ||
    user?.displayName?.trim().charAt(0);
  return first ? first.toUpperCase() : '?';
}

export default function Header({ title = 'Staff Arts', left = null, right = null }) {
  const { fontSize, spacing } = useTheme();
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  const styles = useMemo(
    () => makeStyles({ fontSize, spacing }),
    [fontSize, spacing],
  );

  const onAvatarPress = () => navigation.navigate('Settings');
  const onLoginPress = () => navigation.navigate('Login');

  // ── Default right content (no override) ──────────────────────────────
  // Show the avatar only when there is a real authenticated user.
  // Otherwise show the Log in pill.
  const defaultRight =
    user && (user._id || user.email) ? (
      <Pressable
        onPress={onAvatarPress}
        style={({ pressed }) => [
          styles.avatarBtn,
          pressed && styles.pressed,
        ]}
        hitSlop={8}
        accessibilityLabel={t('homeOpenSettings') || 'Open settings'}
      >
        <Text style={styles.avatarText}>{initialOf(user)}</Text>
      </Pressable>
    ) : (
      <Pressable
        onPress={onLoginPress}
        style={({ pressed }) => [
          styles.loginBtn,
          pressed && styles.pressed,
        ]}
        hitSlop={8}
        accessibilityLabel={t('authLogIn') || 'Log in'}
      >
        <Ionicons
          name="person-outline"
          size={14}
          color={HEADER_FG}
          style={{ marginRight: 4 }}
        />
        <Text style={styles.loginText}>{t('authLogIn') || 'Log in'}</Text>
      </Pressable>
    );

  return (
    <View
      style={[
        styles.band,
        {
          paddingTop: insets.top + 8,
          paddingBottom: 16,
        },
      ]}
    >
      <View style={styles.leftSlot}>{left}</View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightSlot}>{right ?? defaultRight}</View>
    </View>
  );
}

const SLOT_WIDTH = 80;

function makeStyles({ fontSize, spacing }) {
  return StyleSheet.create({
    band: {
      backgroundColor: HEADER_BG,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSlot: {
      width: SLOT_WIDTH,
      alignItems: 'flex-start',
    },
    rightSlot: {
      width: SLOT_WIDTH,
      alignItems: 'flex-end',
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: HEADER_FG,
      fontSize: fontSize.lg,
      fontWeight: '500',
      letterSpacing: 0.4,
    },
    avatarBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: HEADER_FG,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    loginBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    loginText: {
      color: HEADER_FG,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    pressed: {
      opacity: 0.6,
    },
  });
}