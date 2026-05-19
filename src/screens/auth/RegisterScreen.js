import { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeContext';

export default function RegisterScreen({ navigation }) {
  const { colors, spacing, radius, fontSize } = useTheme();
  const { register, isSubmitting, error } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const passwordsMatch = password.length === 0 || password === confirm;
  const canSubmit =
    displayName.trim().length >= 2 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    passwordsMatch &&
    !isSubmitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    await register({
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: spacing.xl,
            paddingBottom: spacing.xxxl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={{
              fontSize: fontSize.xxl,
              fontWeight: '600',
              color: colors.navy,
              marginBottom: spacing.xs,
            }}
          >
            Create account
          </Text>
          <Text
            style={{
              fontSize: fontSize.md,
              color: colors.textMuted,
              marginBottom: spacing.xxl,
            }}
          >
            Join Staff Arts
          </Text>

          <TextInput
            style={inputStyle}
            placeholder="Display name"
            placeholderTextColor={colors.textFaint}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            editable={!isSubmitting}
          />

          <TextInput
            style={inputStyle}
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
            style={inputStyle}
            placeholder="Password (min 8 characters)"
            placeholderTextColor={colors.textFaint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isSubmitting}
          />

          <TextInput
            style={[
              inputStyle,
              !passwordsMatch && { borderColor: colors.danger },
            ]}
            placeholder="Confirm password"
            placeholderTextColor={colors.textFaint}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            editable={!isSubmitting}
          />

          {!passwordsMatch && (
            <Text
              style={{
                color: colors.danger,
                marginBottom: spacing.md,
                fontSize: fontSize.sm,
              }}
            >
              Passwords don't match
            </Text>
          )}
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
                Create account
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.xl, alignItems: 'center' }}
          >
            <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>
              Already have an account?{' '}
              <Text style={{ color: colors.navy, fontWeight: '600' }}>
                Log in
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}