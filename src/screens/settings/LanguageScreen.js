// src/screens/settings/LanguageScreen.js
//
// Dedicated language picker. Lets the user switch among the 12 supported
// languages. Persists via i18n's setLanguage.

import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import Header from '../../components/Header';
import HeaderIconButton from '../../components/HeaderIconButton';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';

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

export default function LanguageScreen() {
  const { colors, fontSize, radius } = useTheme();
  const i18n = useT();
  const { t, lang } = i18n;
  const setLanguage = i18n.setLanguage ?? i18n.setLang ?? (() => {});
  const navigation = useNavigation();

  const s = makeStyles({ colors, fontSize, radius });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('language') ?? 'Language'}
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
        {LANGUAGES.map(({ code, flag, label }) => {
          const active = code === lang;
          return (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
              style={({ pressed }) => [
                s.langRow,
                active && {
                  backgroundColor: `${colors.accent}14`,
                  borderColor: colors.accent,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={s.langFlag}>{flag}</Text>
              <Text
                style={[
                  s.langLabel,
                  {
                    color: active ? colors.accent : colors.text,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
              >
                {label}
              </Text>
              {active && (
                <Text style={[s.check, { color: colors.accent }]}>✓</Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = ({ colors, fontSize, radius }) =>
  StyleSheet.create({
    langRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.borderLight ?? '#ccc',
      backgroundColor: colors.surface,
      marginBottom: 8,
      gap: 12,
    },
    langFlag: { fontSize: 20 },
    langLabel: { flex: 1, fontSize: fontSize.md },
    check: { fontSize: 16 },
  });