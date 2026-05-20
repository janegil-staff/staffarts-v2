// src/screens/settings/SettingsScreen.js
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import Header from '../../components/Header';
import HeaderIconButton from '../../components/HeaderIconButton';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';

export default function SettingsScreen() {
  const { colors, spacing, fontSize, radius, toggleTheme, isDark } = useTheme();
  const { t, lang, setLanguage, supported } = useT();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigation = useNavigation();

  // Empty right slot — we don't want the avatar/Log in pill on Settings,
  // since the user came here intentionally and the back button is on the left.
  const rightSpacer = <View style={{ width: 36 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('settingsTitle') || 'Settings'}
        left={
          <HeaderIconButton
            onPress={() => navigation.goBack()}
            accessibilityLabel={t('navBack') || 'Back'}
          >
            <ChevronLeft size={22} color="#fff" strokeWidth={2} />
          </HeaderIconButton>
        }
        right={rightSpacer}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>
        {user && (
          <View
            style={{
              padding: spacing.md,
              borderRadius: radius.sm,
              backgroundColor: colors.surface,
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
              {t('settingsSignedInAs') || 'Signed in as'}
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: fontSize.md,
                fontWeight: '500',
                marginTop: 2,
              }}
            >
              {user.name ?? user.email ?? '—'}
            </Text>
          </View>
        )}

        <Pressable
          onPress={toggleTheme}
          style={({ pressed }) => ({
            padding: spacing.md,
            borderRadius: radius.sm,
            backgroundColor: colors.surface,
            marginBottom: spacing.sm,
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <Text style={{ color: colors.text, fontSize: fontSize.md }}>
            {t('settingsTheme') || 'Theme'}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
            {isDark
              ? t('settingsThemeDark') || 'Dark'
              : t('settingsThemeLight') || 'Light'}
          </Text>
        </Pressable>

        <View
          style={{
            padding: spacing.md,
            borderRadius: radius.sm,
            backgroundColor: colors.surface,
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: fontSize.md,
              marginBottom: spacing.sm,
            }}
          >
            {t('settingsLanguage') || 'Language'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {supported.map((code) => (
              <Pressable
                key={code}
                onPress={() => setLanguage(code)}
                style={({ pressed }) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: radius.full,
                  backgroundColor:
                    code === lang ? colors.accent : 'transparent',
                  borderWidth: 1,
                  borderColor:
                    code === lang ? colors.accent : colors.borderLight,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: code === lang ? '#fff' : colors.text,
                    fontSize: fontSize.xs,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  {code}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {user && (
          <Pressable
            onPress={async () => {
              await signOut();
              navigation.goBack();
            }}
            style={({ pressed }) => ({
              padding: spacing.md,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: '#dc2626',
              marginTop: spacing.lg,
              opacity: pressed ? 0.7 : 1,
              alignItems: 'center',
            })}
          >
            <Text
              style={{
                color: '#dc2626',
                fontSize: fontSize.md,
                fontWeight: '500',
              }}
            >
              {t('settingsSignOut') || 'Sign out'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}