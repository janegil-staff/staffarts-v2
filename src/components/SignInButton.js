import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../theme/ThemeContext';

/**
 * Shows a "Sign in" button if the user is anonymous. Renders nothing
 * if the user is logged in. Designed to live in a screen's header area.
 */
export default function SignInButton() {
  const navigation = useNavigation();
  const isAuthenticated = useAuthStore((s) => !!s.user);
  const { colors, spacing, radius, fontSize } = useTheme();

  if (isAuthenticated) return null;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Login')}
      style={{
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
      }}
    >
      <Text
        style={{
          color: colors.textInverse,
          fontSize: fontSize.sm,
          fontWeight: '600',
        }}
      >
        Sign in
      </Text>
    </TouchableOpacity>
  );
}