// src/screens/settings/SettingsScreen.js
//
// Recover-styled settings: tappable email field at top, then list rows for
// Personal settings, Language, Terms & Conditions, About. Logout icon in
// the header's right slot.

import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, LogOut } from 'lucide-react-native';

import Header from '../../components/Header';
import HeaderIconButton from '../../components/HeaderIconButton';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import { useAuth } from '../../hooks/useAuth';

const LANGUAGES = [
  { code: 'no', flag: '🇳🇴', label: 'Norsk' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'da', flag: '🇩🇰', label: 'Dansk' },
  { code: 'sv', flag: '🇸🇪', label: 'Svenska' },
  { code: 'fi', flag: '🇫🇮', label: 'Suomi' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'nl', flag: '🇳🇱', label: 'Nederlands' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'pt', flag: '🇵🇹', label: 'Português' },
];

export default function SettingsScreen() {
  const { colors, fontSize, spacing } = useTheme();
  const { t, lang } = useT();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const navigation = useNavigation();

  const selectedLang =
    LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[1];

  const s = makeStyles({ colors, fontSize, spacing });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('settings') ?? 'Settings'}
        left={
          <HeaderIconButton
            onPress={() => navigation.goBack()}
            accessibilityLabel={t('navBack') ?? 'Back'}
          >
            <ChevronLeft size={22} color="#fff" strokeWidth={2} />
          </HeaderIconButton>
        }
        right={
          user ? (
            <HeaderIconButton
              onPress={logout}
              accessibilityLabel={t('settingsSignOut') ?? 'Sign out'}
            >
              <LogOut size={20} color="#fff" strokeWidth={2} />
            </HeaderIconButton>
          ) : (
            <View style={{ width: 36 }} />
          )
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Tappable email field — block style with label, but row-sized text */}
        {user?.email && (
          <Pressable
            onPress={() => navigation.navigate('ChangeEmail')}
            style={({ pressed }) => [
              s.fieldBlock,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={s.fieldLabel}>{t('authEmail') ?? 'Email'}</Text>
            <View style={s.fieldRow}>
              <Text style={s.fieldValue} numberOfLines={1}>
                {user.email}
              </Text>
              <Text style={s.fieldChevron}>›</Text>
            </View>
            <View style={s.fieldUnderline} />
          </Pressable>
        )}

        <View style={{ height: 12 }} />

        {/* Rows */}
        <SettingsRow
          label={t('settingsPersonal') ?? 'Personal settings'}
          actionLabel={t('settingsChange') ?? 'Change'}
          onPress={() => navigation.navigate('PersonalSettings')}
          styles={s}
        />
        <RowDivider colors={colors} />

        <SettingsRow
          label={t('language') ?? 'Language'}
          actionLabel={`${selectedLang.flag}  ${selectedLang.label}`}
          onPress={() => navigation.navigate('Language')}
          styles={s}
        />
        <RowDivider colors={colors} />

        <SettingsRow
          label={t('settingsTerms') ?? 'Terms & Conditions'}
          actionLabel={t('settingsView') ?? 'View'}
          onPress={() => navigation.navigate('Terms')}
          styles={s}
        />
        <RowDivider colors={colors} />

        <SettingsRow
          label={t('settingsAbout') ?? 'About'}
          actionLabel={t('settingsReadMore') ?? 'Read more'}
          onPress={() => navigation.navigate('About')}
          styles={s}
        />
        <RowDivider colors={colors} />

        {!user && (
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={({ pressed }) => [
              s.loginCta,
              pressed && { opacity: 0.85 },
              { backgroundColor: colors.accent },
            ]}
          >
            <Text style={s.loginCtaText}>
              {(t('authLogIn') ?? 'Log in').toUpperCase()}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

function SettingsRow({ label, actionLabel, onPress, styles }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowAction}>{actionLabel}</Text>
        <Text style={styles.rowChevron}>›</Text>
      </View>
    </Pressable>
  );
}

function RowDivider({ colors }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.borderLight ?? '#eee',
        marginHorizontal: 20,
      }}
    />
  );
}

const makeStyles = ({ colors, fontSize, spacing }) =>
  StyleSheet.create({
    fieldBlock: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 4,
    },
    fieldLabel: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: '500',
      marginBottom: 4,
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    fieldValue: {
      flex: 1,
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '500',
    },
    fieldChevron: {
      color: colors.textMuted,
      fontSize: fontSize.lg,
    },
    fieldUnderline: {
      height: 1,
      backgroundColor: colors.borderLight ?? '#eee',
      marginTop: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    rowLabel: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '500',
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    rowAction: {
      color: colors.textMuted,
      fontSize: fontSize.md,
    },
    rowChevron: {
      color: colors.textMuted,
      fontSize: fontSize.lg,
    },
    loginCta: {
      marginHorizontal: 20,
      marginTop: 32,
      height: 54,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginCtaText: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '800',
      letterSpacing: 2,
    },
  });