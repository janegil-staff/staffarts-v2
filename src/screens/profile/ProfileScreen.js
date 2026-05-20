// src/screens/profile/ProfileScreen.js
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const { colors, fontSize } = useTheme();
  const { t } = useT();
  const user = useAuthStore((s) => s.user);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('profileTitle') || 'Profile'} />

      <View style={styles.body}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.text }]}>
            {user?.name?.trim().charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text
          style={[styles.name, { color: colors.text, fontSize: fontSize.xl }]}
        >
          {user?.name || t('profileYourName') || 'Your name'}
        </Text>
        {user?.email && (
          <Text
            style={[
              styles.email,
              { color: colors.textMuted, fontSize: fontSize.sm },
            ]}
          >
            {user.email}
          </Text>
        )}
        <Text
          style={[
            styles.placeholderSub,
            { color: colors.textMuted, fontSize: fontSize.sm },
          ]}
        >
          {t('profileComingSoon') || 'Profile details coming soon.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '300',
  },
  name: {
    fontWeight: '300',
  },
  email: {
    marginTop: 4,
  },
  placeholderSub: {
    marginTop: 24,
    textAlign: 'center',
  },
});