// src/screens/profile/ProfileScreen.js
//
// Logged-in profile: avatar, name, bio, then a row of three round action
// buttons (Messages, New artwork +, Edit). The middle button has a small
// downward offset for visual interest, but stays close to inline.

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageCircle, Plus, Pencil } from 'lucide-react-native';

import Header from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';

function initialOf(user) {
  const c =
    user?.displayName?.trim().charAt(0) ||
    user?.name?.trim().charAt(0) ||
    user?.email?.trim().charAt(0);
  return c ? c.toUpperCase() : '?';
}

// ── Layout constants ───────────────────────────────────────────────────────
const BUTTON_SIZE = 56;
const MIDDLE_OFFSET = 10; // px lower than the side buttons — subtle arc
const ICON_SIDE = 18; // Messages, Edit
const ICON_MIDDLE = 20; // "+"

export default function ProfileScreen() {
  const { colors, fontSize, radius, spacing } = useTheme();
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation();

  const s = makeStyles({ colors, fontSize, radius, spacing });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('profileTitle') ?? 'Profile'} />

      <ScrollView contentContainerStyle={s.scroll}>
        {!user ? (
          <View style={s.loggedOutWrap}>
            <Text style={s.loggedOutTitle}>
              {t('profileLoggedOutTitle') ?? 'Welcome to Staff Arts'}
            </Text>
            <Text style={s.loggedOutBody}>
              {t('profileLoggedOutBody') ??
                'Log in or create an account to set up your profile.'}
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Login')}
              style={({ pressed }) => [s.cta, pressed && { opacity: 0.85 }]}
            >
              <Text style={s.ctaText}>
                {(t('authLogIn') ?? 'Log in').toUpperCase()}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={s.avatarWrap}>
              {user.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={s.avatar} />
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

            <Text style={s.name}>{user.displayName || user.email}</Text>

            {user.bio ? (
              <Text style={s.bio}>{user.bio}</Text>
            ) : (
              <Text style={s.bioPlaceholder}>
                {t('profileNoBio') ?? 'No bio yet. Tap edit to add one.'}
              </Text>
            )}

            {/* ── Three round action buttons (subtle arc) ──────── */}
            <View style={s.actionRow}>
              <ActionButton
                accessibilityLabel={t('profileMessages') ?? 'Messages'}
                onPress={() => {
                  // TODO: navigate to Messages once that screen exists.
                  // navigation.navigate('Messages');
                }}
                colors={colors}
              >
                <MessageCircle
                  size={ICON_SIDE}
                  color="#fff"
                  strokeWidth={2}
                />
              </ActionButton>

              {/* Middle — slight downward offset */}
              <ActionButton
                accessibilityLabel={t('profileNewArtwork') ?? 'New artwork'}
                onPress={() => navigation.navigate('NewArtwork')}
                colors={colors}
                style={{ marginTop: MIDDLE_OFFSET }}
              >
                <Plus
                  size={ICON_MIDDLE}
                  color="#fff"
                  strokeWidth={2.5}
                />
              </ActionButton>

              <ActionButton
                accessibilityLabel={t('profileEdit') ?? 'Edit profile'}
                onPress={() => navigation.navigate('EditProfile')}
                colors={colors}
              >
                <Pencil size={ICON_SIDE} color="#fff" strokeWidth={2} />
              </ActionButton>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Reusable round filled button ───────────────────────────────────────────

function ActionButton({
  children,
  onPress,
  accessibilityLabel,
  colors,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: BUTTON_SIZE / 2,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.accent,
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const makeStyles = ({ colors, fontSize, radius, spacing }) =>
  StyleSheet.create({
    scroll: {
      padding: 24,
      alignItems: 'center',
      paddingBottom: 80,
    },
    avatarWrap: { marginTop: 16, marginBottom: 16 },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 1,
    },
    avatarInitial: {
      fontSize: 48,
      fontWeight: '300',
      color: colors.text,
    },
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
    },
    actionRow: {
      marginTop: 32,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 20,
      paddingBottom: MIDDLE_OFFSET + 16,
    },
    loggedOutWrap: {
      alignItems: 'center',
      paddingTop: 48,
      paddingHorizontal: 16,
    },
    loggedOutTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    loggedOutBody: {
      marginTop: 12,
      fontSize: fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    cta: {
      marginTop: 28,
      paddingHorizontal: 40,
      height: 54,
      backgroundColor: colors.accent,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ctaText: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '800',
      letterSpacing: 2,
    },
  });