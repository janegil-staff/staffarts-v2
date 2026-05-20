// src/screens/settings/PersonalSettingsScreen.js
//
// Currently just a theme toggle (Light ↔ Dark). Display name + avatar
// editing will land here later.

import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Sun, Moon } from 'lucide-react-native';

import Header from '../../components/Header';
import HeaderIconButton from '../../components/HeaderIconButton';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';

export default function PersonalSettingsScreen() {
  const theme = useTheme();
  const { colors, fontSize, radius } = theme;
  const isDark = theme.isDark ?? theme.mode === 'dark';
  const toggleTheme =
    theme.toggleTheme ??
    theme.toggle ??
    (theme.setMode ? () => theme.setMode(isDark ? 'light' : 'dark') : null) ??
    (theme.setTheme ? () => theme.setTheme(isDark ? 'light' : 'dark') : null) ??
    null;

  const { t } = useT();
  const navigation = useNavigation();

  const s = makeStyles({ colors, fontSize, radius });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('settingsPersonal') ?? 'Personal settings'}
        left={
          <HeaderIconButton
            onPress={() => navigation.goBack()}
            accessibilityLabel={t('navBack') ?? 'Back'}
          >
            <ChevronLeft size={22} color="#fff" strokeWidth={2} />
          </HeaderIconButton>
        }
        right={<View style={{ width: 36 }} />}
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
        <Text style={s.sectionLabel}>{t('settingsTheme') ?? 'Theme'}</Text>

        <View style={s.toggleRow}>
          <View style={s.toggleLeft}>
            {isDark ? (
              <Moon size={20} color={colors.text} strokeWidth={2} />
            ) : (
              <Sun size={20} color={colors.text} strokeWidth={2} />
            )}
            <Text style={s.toggleLabel}>
              {isDark
                ? (t('settingsThemeDark') ?? 'Dark')
                : (t('settingsThemeLight') ?? 'Light')}
            </Text>
          </View>

          <Switch
            value={isDark}
            onValueChange={() => {
              if (toggleTheme) toggleTheme();
            }}
            disabled={!toggleTheme}
            trackColor={{
              false: colors.borderLight ?? '#ccc',
              true: colors.accent,
            }}
            thumbColor="#fff"
            ios_backgroundColor={colors.borderLight ?? '#ccc'}
          />
        </View>

        {!toggleTheme && (
          <Text style={s.note}>
            {t('settingsThemeUnavailable') ??
              'Theme toggling is not available yet.'}
          </Text>
        )}

        <Text style={s.placeholder}>
          {t('personalSettingsComingSoon') ??
            'Display name and avatar editing coming soon.'}
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = ({ colors, fontSize, radius }) =>
  StyleSheet.create({
    sectionLabel: {
      color: colors.textMuted,
      fontSize: fontSize.md,
      fontWeight: '700',
      marginBottom: 12,
      letterSpacing: 0.3,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.borderLight ?? '#eee',
      backgroundColor: colors.surface,
    },
    toggleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    toggleLabel: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '500',
    },
    note: {
      marginTop: 12,
      color: colors.textMuted,
      fontSize: fontSize.xs,
      lineHeight: 18,
    },
    placeholder: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      marginTop: 40,
      textAlign: 'center',
      lineHeight: 20,
    },
  });