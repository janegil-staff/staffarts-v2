import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';

export default function AppStack() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const { colors, spacing, radius, fontSize, isDark, toggleTheme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
      }}
    >
      <Text
        style={{
          fontSize: fontSize.xl,
          color: colors.navy,
          fontWeight: '600',
          marginBottom: spacing.sm,
        }}
      >
        Welcome, {user?.displayName} 👋
      </Text>
      <Text
        style={{
          fontSize: fontSize.md,
          color: colors.textMuted,
          marginBottom: spacing.xxl,
        }}
      >
        {user?.email}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.xxl,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: fontSize.md,
            marginRight: spacing.md,
          }}
        >
          Dark mode
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.borderStrong, true: colors.accent }}
        />
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: colors.accent,
          padding: spacing.md,
          borderRadius: radius.md,
          paddingHorizontal: spacing.xxl,
        }}
        onPress={logout}
      >
        <Text
          style={{
            color: colors.textInverse,
            fontSize: fontSize.md,
            fontWeight: '600',
          }}
        >
          Sign out
        </Text>
      </TouchableOpacity>
    </View>
  );
}