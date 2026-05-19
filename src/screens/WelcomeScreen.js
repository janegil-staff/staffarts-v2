import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { colors, spacing, radius, fontSize } = useTheme();

  const goToLogin = () => navigation.navigate('Login');
  const goToRegister = () => navigation.navigate('Register');
  const continueBrowsing = () =>
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.xl,
          justifyContent: 'center',
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: spacing.xxxl }}>
          <Text
            style={{
              fontSize: fontSize.xxxl,
              fontWeight: '700',
              color: colors.navy,
              marginBottom: spacing.sm,
            }}
          >
            Staff Arts
          </Text>
          <Text
            style={{
              fontSize: fontSize.md,
              color: colors.textMuted,
              textAlign: 'center',
            }}
          >
            You've been signed out
          </Text>
        </View>

        <TouchableOpacity
          onPress={goToLogin}
          style={{
            backgroundColor: colors.accent,
            padding: spacing.lg,
            borderRadius: radius.md,
            alignItems: 'center',
            marginBottom: spacing.md,
          }}
        >
          <Text
            style={{
              color: colors.textInverse,
              fontSize: fontSize.md,
              fontWeight: '600',
            }}
          >
            Log in
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToRegister}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.accent,
            padding: spacing.lg,
            borderRadius: radius.md,
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Text
            style={{
              color: colors.accent,
              fontSize: fontSize.md,
              fontWeight: '600',
            }}
          >
            Create account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={continueBrowsing}
          style={{ alignItems: 'center', padding: spacing.md }}
        >
          <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>
            Continue browsing
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}