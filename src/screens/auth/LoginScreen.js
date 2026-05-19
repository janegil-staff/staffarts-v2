import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { colors, spacing, radius, fontSize } = useTheme();
  const { login, isSubmitting, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit =
    email.trim().length > 0 && password.length >= 8 && !isSubmitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    await login({ email: email.trim().toLowerCase(), password });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            padding: spacing.xl,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: fontSize.xxl,
              fontWeight: '600',
              color: colors.navy,
              marginBottom: spacing.xs,
            }}
          >
            Welcome back
          </Text>
          <Text
            style={{
              fontSize: fontSize.md,
              color: colors.textMuted,
              marginBottom: spacing.xxl,
            }}
          >
            Sign in to Staff Arts
          </Text>

          <TextInput
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              fontSize: fontSize.md,
              color: colors.text,
              marginBottom: spacing.md,
            }}
            placeholder="Email"
            placeholderTextColor={colors.textFaint}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <TextInput
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              fontSize: fontSize.md,
              color: colors.text,
              marginBottom: spacing.md,
            }}
            placeholder="Password"
            placeholderTextColor={colors.textFaint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isSubmitting}
          />

          {error && (
            <Text
              style={{
                color: colors.danger,
                marginBottom: spacing.md,
                fontSize: fontSize.sm,
              }}
            >
              {error}
            </Text>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: colors.accent,
              padding: spacing.lg,
              borderRadius: radius.md,
              alignItems: 'center',
              marginTop: spacing.sm,
              opacity: canSubmit ? 1 : 0.5,
            }}
            onPress={onSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text
                style={{
                  color: colors.textInverse,
                  fontSize: fontSize.md,
                  fontWeight: '600',
                }}
              >
                Log in
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: spacing.xl, alignItems: 'center' }}
          >
            <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>
              New to Staff Arts?{' '}
              <Text style={{ color: colors.navy, fontWeight: '600' }}>
                Sign up
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}