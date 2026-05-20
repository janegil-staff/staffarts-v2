// src/screens/auth/LoginScreen.js
//
// Recover-style centered login: logo, title, underline fields, big accent
// button, sign up / forgot PIN links, footer.
//
// PIN-only login: email + 4-digit PIN. Uses Staff Arts' useAuth hook,
// useTheme, and useT (i18n).

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
  Linking,
} from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';

const APP_VERSION = '1.0.0';
const COMPANY = 'Qup DA';
const SUPPORT_EMAIL = 'post@staffarts.com';

export default function LoginScreen({ navigation }) {
  const { login, isSubmitting, error: authError } = useAuth();
  const { colors, fontSize, radius } = useTheme();
  const { t } = useT();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [localError, setLocalError] = useState('');

  const error = localError || authError;

  const s = makeStyles({ colors, fontSize, radius });

  const submit = async () => {
    setLocalError('');
    if (!email.trim() || !pin) {
      setLocalError(t('authFieldsRequired') ?? 'All fields are required');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setLocalError(t('authPinMustBe4Digits') ?? 'PIN must be 4 digits');
      return;
    }
    const ok = await login({
      email: email.trim().toLowerCase(),
      pin,
    });
    if (ok && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={s.bg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={s.logoWrap}>
            <Image
              source={require('../../../assets/focus_logo.png')}
              style={s.logo}
              resizeMode="cover"
            />
          </View>

          {/* Title */}
          <Text style={s.title}>{t('appName') ?? 'Staff Arts'}</Text>
          <Text style={s.tagline}>
            {t('appTagline') ?? 'AN ART MARKETPLACE'}
          </Text>

          <View style={{ height: 36 }} />

          {/* Error */}
          {!!error && <Text style={s.error}>{error}</Text>}

          {/* Fields */}
          <UnderlineField
            placeholder={t('authEmail') ?? 'Email'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            colors={colors}
            fontSize={fontSize}
          />
          <UnderlineField
            placeholder={t('authPin') ?? 'PIN code'}
            value={pin}
            onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            colors={colors}
            fontSize={fontSize}
          />

          <View style={{ height: 28 }} />

          {/* Login button */}
          <TouchableOpacity
            style={s.btn}
            onPress={submit}
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            <Text style={s.btnText}>
              {isSubmitting
                ? '...'
                : (t('authLogIn') ?? 'Log in').toUpperCase()}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />

          {/* Sign up link */}
          <Text style={s.linkMuted}>
            {t('authNoAccountQ') ?? "Don't have an account?"}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: 6 }}
          >
            <Text style={s.linkPrimary}>
              {(t('authSignUp') ?? 'Sign up').toUpperCase()}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />

          {/* Forgot PIN */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPin', { email })}
          >
            <Text style={s.linkPrimary}>
              {(t('authForgotPin') ?? 'Forgot PIN?').toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>{COMPANY}</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
            >
              <Text style={s.footerLink}>{SUPPORT_EMAIL}</Text>
            </TouchableOpacity>
            <Text style={s.footerText}>v{APP_VERSION}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Underline text field ───────────────────────────────────────────────────

function UnderlineField({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  colors,
  fontSize,
}) {
  return (
    <View style={{ width: '100%', marginBottom: 24 }}>
      <TextInput
        style={{
          color: colors.text,
          fontSize: fontSize.md,
          fontWeight: '500',
          paddingVertical: 8,
          paddingHorizontal: 0,
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        selectionColor={colors.accent}
      />
      <View
        style={{
          height: 1.5,
          backgroundColor: colors.borderLight ?? '#ccc',
          width: '100%',
        }}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const makeStyles = ({ colors, fontSize, radius }) =>
  StyleSheet.create({
    bg: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 32,
      paddingTop: 72,
      paddingBottom: 40,
      alignItems: 'center',
    },
    logoWrap: {
      width: 120,
      height: 120,
      borderRadius: 22,
      overflow: 'hidden',
      marginBottom: 16,
    },
    logo: {
      width: 120,
      height: 120,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    tagline: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      textAlign: 'center',
      marginTop: 4,
      letterSpacing: 1,
    },
    error: {
      color: colors.danger ?? '#C62828',
      fontSize: fontSize.sm,
      marginBottom: 16,
      width: '100%',
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
    btnText: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '800',
      letterSpacing: 2,
    },
    linkMuted: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: '500',
      textAlign: 'center',
    },
    linkPrimary: {
      color: colors.accent,
      fontSize: fontSize.sm,
      fontWeight: '700',
      letterSpacing: 1.5,
      textAlign: 'center',
    },
    footer: {
      marginTop: 48,
      alignItems: 'center',
      gap: 4,
    },
    footerText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '500',
      textAlign: 'center',
    },
    footerLink: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: '500',
      textAlign: 'center',
    },
  });