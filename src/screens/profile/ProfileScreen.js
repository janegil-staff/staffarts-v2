// src/screens/profile/ProfileScreen.js
//
// The 4th tab. Renders based on auth state, all WITHIN the tab (so the
// bottom tab bar always stays visible):
//   - Logged OUT → About-the-app content (logo, story, what the app is)
//   - Logged IN  → the user's profile (avatar, name, bio, action buttons)

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

const BUTTON_SIZE = 56;
const MIDDLE_OFFSET = 10;
const ICON_SIDE = 18;
const ICON_MIDDLE = 20;

export default function ProfileScreen() {
  const { colors, fontSize, radius, spacing } = useTheme();
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation();

  // Logged out → show the About-the-app content right here in the tab.
  if (!user) {
    return <AboutContent />;
  }

  const s = makeStyles({ colors, fontSize, radius, spacing });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('tabProfile') ?? 'Profile'} />

      <ScrollView contentContainerStyle={s.scroll}>
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

        {/* Three round action buttons */}
        <View style={s.actionRow}>
          <ActionButton
            accessibilityLabel={t('profileMessages') ?? 'Messages'}
            onPress={() => {
              // TODO: navigation.navigate('Messages') when it exists
            }}
            colors={colors}
          >
            <MessageCircle size={ICON_SIDE} color="#fff" strokeWidth={2} />
          </ActionButton>

          <ActionButton
            accessibilityLabel={t('profileNewArtwork') ?? 'New artwork'}
            onPress={() => navigation.navigate('NewArtwork')}
            colors={colors}
            style={{ marginTop: MIDDLE_OFFSET }}
          >
            <Plus size={ICON_MIDDLE} color="#fff" strokeWidth={2.5} />
          </ActionButton>

          <ActionButton
            accessibilityLabel={t('profileEdit') ?? 'Edit profile'}
            onPress={() => navigation.navigate('EditProfile')}
            colors={colors}
          >
            <Pencil size={ICON_SIDE} color="#fff" strokeWidth={2} />
          </ActionButton>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Logged-out About content (rendered inside the tab) ───────────────────────

function AboutContent() {
  const { colors, fontSize, spacing, radius } = useTheme();
  const { t } = useT();
  const a = makeAboutStyles({ colors, fontSize, spacing, radius });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('aboutAppTab') ?? 'About'} />

      <ScrollView contentContainerStyle={a.scroll}>
        <View style={a.logoWrap}>
          <Image
            source={require('../../../assets/focus_logo.png')}
            style={a.logo}
            resizeMode="cover"
          />
        </View>

        <Text style={a.appName}>{t('appName') ?? 'Staff Arts'}</Text>
        <Text style={a.tagline}>
          {t('aboutAppTagline') ?? 'A home for art, artists, and collectors.'}
        </Text>

        <Text style={a.sectionTitle}>
          {t('aboutAppWhatTitle') ?? 'What is Staff Arts?'}
        </Text>
        <Text style={a.body}>
          {t('aboutAppWhat') ??
            'Staff Arts is a marketplace and meeting place for original art. Discover artworks, follow artists, explore exhibitions and events, and connect directly with the people behind the work.'}
        </Text>

        <Text style={a.sectionTitle}>
          {t('aboutAppStoryTitle') ?? 'The story behind the name'}
        </Text>
        <Text style={a.body}>
          {t('aboutAppStory') ??
            'Staff Arts is named in tribute to “Staff” — a mixed-media artist whose work blends materials, textures, and feeling into something wholly her own. This app was built as a love letter to that spirit: a place where art made with heart can find the people who will treasure it.'}
        </Text>

        <Text style={a.footer}>
          {t('aboutAppFooter') ?? 'Qup DA · staffarts.com'}
        </Text>
      </ScrollView>
    </View>
  );
}

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
    scroll: { padding: 24, alignItems: 'center', paddingBottom: 100 },
    avatarWrap: { marginTop: 16, marginBottom: 16 },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 1 },
    avatarInitial: { fontSize: 48, fontWeight: '300', color: colors.text },
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
    actionRow: {
      marginTop: 32,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 20,
      paddingBottom: MIDDLE_OFFSET + 16,
    },
  });

const makeAboutStyles = ({ colors, fontSize, spacing, radius }) =>
  StyleSheet.create({
    scroll: { padding: spacing.lg, paddingBottom: 100, alignItems: 'center' },
    logoWrap: {
      width: 96,
      height: 96,
      borderRadius: 22,
      overflow: 'hidden',
      marginTop: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
    },
    logo: { width: 96, height: 96 },
    appName: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    tagline: {
      marginTop: 6,
      fontSize: fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    sectionTitle: {
      alignSelf: 'stretch',
      marginTop: 28,
      marginBottom: 8,
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    body: {
      alignSelf: 'stretch',
      fontSize: fontSize.sm,
      color: colors.text,
      lineHeight: 22,
    },
    footer: {
      marginTop: 32,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });