// src/screens/settings/ChangeEmailScreen.js
//
// Lets a logged-in user change their email. Requires PIN confirmation
// (in case someone grabs an unlocked phone). Calls PATCH /api/auth/email.

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

import Header from '../../components/Header';
import HeaderIconButton from '../../components/HeaderIconButton';
import PinInput from '../../components/PinInput';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import client from '../../api/client';

const REMEMBERED_EMAIL_KEY = 'staffarts.rememberedEmail';

export default function ChangeEmailScreen() {
  const { colors, fontSize, radius } = useTheme();
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const navigation = useNavigation();

  const [newEmail, setNewEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const canSubmit =
    emailRx.test(newEmail.trim()) &&
    pin.length === 4 &&
    !isSubmitting &&
    newEmail.trim().toLowerCase() !== (user?.email || '').toLowerCase();

  const submit = async () => {
    setError('');
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const trimmed = newEmail.trim().toLowerCase();
      const res = await client.patch('/api/auth/email', {
        newEmail: trimmed,
        pin,
      });
      const updated = res.data?.data?.user;
      if (updated) {
        setUser(updated);
        await SecureStore.setItemAsync(REMEMBERED_EMAIL_KEY, trimmed);
      }
      Alert.alert(
        t('emailChangedTitle') ?? 'Email updated',
        t('emailChangedMsg') ?? 'Your email has been updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          t('emailChangeFailed') ||
          'Could not update email',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const s = makeStyles({ colors, fontSize, radius });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('changeEmailTitle') ?? 'Change email'}
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.subtitle}>
            {t('changeEmailSubtitle') ??
              'Enter your new email address and confirm with your PIN.'}
          </Text>

          <View style={{ height: 24 }} />

          {/* Current email */}
          <Text style={s.label}>
            {t('changeEmailCurrent') ?? 'Current email'}
          </Text>
          <Text style={s.current}>{user?.email ?? '—'}</Text>

          <View style={{ height: 20 }} />

          {/* New email */}
          <Text style={s.label}>{t('changeEmailNew') ?? 'New email'}</Text>
          <TextInput
            style={s.input}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="new@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor={colors.accent}
          />
          <View style={s.underline} />

          <View style={{ height: 24 }} />

          {/* PIN confirmation */}
          <Text style={s.label}>
            {t('changeEmailConfirmPin') ?? 'Confirm with your PIN'}
          </Text>
          <View style={{ marginTop: 8 }}>
            <PinInput
              value={pin}
              onChange={setPin}
              editable={!isSubmitting}
              hasError={!!error}
            />
          </View>

          {!!error && <Text style={s.error}>{error}</Text>}

          <View style={{ height: 32 }} />

          <TouchableOpacity
            style={[s.btn, !canSubmit && s.btnDisabled]}
            onPress={canSubmit ? submit : undefined}
            activeOpacity={canSubmit ? 0.85 : 1}
          >
            <Text style={s.btnText}>
              {isSubmitting
                ? '...'
                : (t('changeEmailSubmit') ?? 'UPDATE EMAIL').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = ({ colors, fontSize, radius }) =>
  StyleSheet.create({
    subtitle: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      lineHeight: 20,
    },
    label: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: '600',
      marginBottom: 6,
    },
    current: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '500',
    },
    input: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '500',
      paddingVertical: 8,
    },
    underline: {
      height: 1.5,
      backgroundColor: colors.borderLight ?? '#ccc',
    },
    error: {
      color: colors.danger ?? '#C62828',
      fontSize: fontSize.sm,
      marginTop: 12,
      textAlign: 'center',
    },
    btn: {
      width: '100%',
      height: 54,
      backgroundColor: colors.accent,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.accent,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    btnDisabled: { opacity: 0.4 },
    btnText: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '800',
      letterSpacing: 2,
    },
  });