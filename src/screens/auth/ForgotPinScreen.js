// src/screens/auth/ForgotPinScreen.js
//
// Three-step flow on one screen:
//   1. Enter email → request reset code (sent by email)
//   2. Enter 6-digit code from email + new 4-digit PIN
//   3. Confirm → server resets PIN, user navigates back to Login

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import * as authApi from '../../api/auth';
import PinInput from '../../components/PinInput';

export default function ForgotPinScreen({ navigation, route }) {
  const { colors, spacing, radius, fontSize } = useTheme();
  const { t } = useT();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(route?.params?.email || '');
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.lg,
  };

  // ── Step 1: request code ────────────────────────────────────────────
  const onRequestCode = async () => {
    if (!email.trim()) {
      setError(t('authEmailRequired') ?? 'Email is required');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await authApi.forgotPin({ email: email.trim().toLowerCase() });
      Alert.alert(
        t('authCodeSentTitle') ?? 'Check your email',
        t('authCodeSentMsg') ??
          'If an account exists, a reset code has been sent.',
      );
      setStep(2);
    } catch (e) {
      setError(e?.response?.data?.error || (t('authCodeSendFailed') ?? 'Failed to send code'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: confirm code + new PIN ──────────────────────────────────
  const codeValid = /^\d{6}$/.test(code);
  const pinValid = /^\d{4}$/.test(newPin);
  const pinsMatch = newPin === confirmPin;
  const canConfirm =
    codeValid && pinValid && pinsMatch && confirmPin.length === 4;

  const onConfirmReset = async () => {
    if (!canConfirm) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await authApi.resetPin({
        email: email.trim().toLowerCase(),
        code,
        newPin,
      });
      Alert.alert(
        t('authPinResetTitle') ?? 'PIN reset',
        t('authPinResetMsg') ?? 'Your PIN has been reset. Please sign in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (e) {
      setError(e?.response?.data?.error || (t('authPinResetFailed') ?? 'Reset failed'));
    } finally {
      setIsSubmitting(false);
    }
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
            {t('authForgotPinTitle') ?? 'Reset your PIN'}
          </Text>
          <Text
            style={{
              fontSize: fontSize.md,
              color: colors.textMuted,
              marginBottom: spacing.xxl,
            }}
          >
            {step === 1
              ? (t('authForgotPinStep1') ??
                  'Enter your email and we will send you a reset code.')
              : (t('authForgotPinStep2') ??
                  'Enter the 6-digit code from your email and choose a new PIN.')}
          </Text>

          {step === 1 && (
            <>
              <TextInput
                style={inputStyle}
                placeholder={t('authEmail') ?? 'Email'}
                placeholderTextColor={colors.textFaint}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
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
                  opacity: !email.trim() || isSubmitting ? 0.5 : 1,
                }}
                onPress={onRequestCode}
                disabled={!email.trim() || isSubmitting}
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
                    {t('authSendResetCode') ?? 'Send reset code'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text
                style={{
                  fontSize: fontSize.sm,
                  color: colors.textMuted,
                  marginBottom: spacing.sm,
                }}
              >
                {t('authResetCode') ?? 'Reset code (6 digits)'}
              </Text>
              <TextInput
                style={inputStyle}
                placeholder="123456"
                placeholderTextColor={colors.textFaint}
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isSubmitting}
              />

              <Text
                style={{
                  fontSize: fontSize.sm,
                  color: colors.textMuted,
                  marginBottom: spacing.sm,
                }}
              >
                {t('authNewPin') ?? 'New 4-digit PIN'}
              </Text>
              <PinInput
                value={newPin}
                onChange={setNewPin}
                editable={!isSubmitting}
                hasError={!pinsMatch && confirmPin.length === 4}
              />

              <View style={{ height: spacing.lg }} />

              <Text
                style={{
                  fontSize: fontSize.sm,
                  color: colors.textMuted,
                  marginBottom: spacing.sm,
                }}
              >
                {t('authConfirmPin') ?? 'Confirm PIN'}
              </Text>
              <PinInput
                value={confirmPin}
                onChange={setConfirmPin}
                editable={!isSubmitting}
                hasError={!pinsMatch}
              />

              {!pinsMatch && confirmPin.length === 4 && (
                <Text
                  style={{
                    color: colors.danger,
                    marginTop: spacing.md,
                    fontSize: fontSize.sm,
                  }}
                >
                  {t('authPinsDontMatch') ?? "PINs don't match"}
                </Text>
              )}
              {error && (
                <Text
                  style={{
                    color: colors.danger,
                    marginTop: spacing.md,
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
                  marginTop: spacing.xl,
                  opacity: canConfirm && !isSubmitting ? 1 : 0.5,
                }}
                onPress={onConfirmReset}
                disabled={!canConfirm || isSubmitting}
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
                    {t('authResetPin') ?? 'Reset PIN'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={{ marginTop: spacing.md, alignItems: 'center' }}
              >
                <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
                  {t('authResendCode') ?? 'Resend code'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.xl, alignItems: 'center' }}
          >
            <Text style={{ color: colors.navy, fontSize: fontSize.md }}>
              ← {t('authBackToLogin') ?? 'Back to login'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}