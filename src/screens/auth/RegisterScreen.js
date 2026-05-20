// src/screens/auth/RegisterScreen.js
//
// Recover-style registration. Single step for Staff Arts (no age/gender/
// height/weight, since this is a marketplace, not a health app).
//
// Flow:
//   1. Language dropdown
//   2. Email + confirm email (underline fields)
//   3. PIN code row that navigates to dedicated PinSetup screen
//   4. Terms checkbox + data-use consent checkbox
//   5. Continue button → register API → auto-login

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';

const REMEMBERED_EMAIL_KEY = 'staffarts.rememberedEmail';

const LANGUAGES = [
  { code: 'no', flag: '🇳🇴', label: 'Norsk' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'da', flag: '🇩🇰', label: 'Dansk' },
  { code: 'sv', flag: '🇸🇪', label: 'Svenska' },
  { code: 'fi', flag: '🇫🇮', label: 'Suomi' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'nl', flag: '🇳🇱', label: 'Nederlands' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'pt', flag: '🇵🇹', label: 'Português' },
];

export default function RegisterScreen({ navigation, route }) {
  const { register, isSubmitting, error: authError } = useAuth();
  const { colors, fontSize, radius, spacing } = useTheme();
  // useT exposes `setLanguage` (matches SettingsScreen). Older code expected
  // `setLang` — accept either to be safe.
  const i18n = useT();
  const { t, lang } = i18n;
  const changeLanguage = i18n.setLanguage ?? i18n.setLang ?? (() => {});

  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [pin, setPin] = useState('');
  const [language, setLanguage] = useState(lang || 'en');
  const [langOpen, setLangOpen] = useState(false);
  const [tncAccepted, setTncAccepted] = useState(false);
  const [infoAccepted, setInfoAccepted] = useState(false);
  const [localError, setLocalError] = useState('');

  const error = localError || authError;

  // Restore state when returning from PinSetup.
  useEffect(() => {
    const p = route?.params ?? {};
    if (p.pin) setPin(p.pin);
    if (p.email !== undefined) setEmail(p.email);
    if (p.emailConfirm !== undefined) setEmailConfirm(p.emailConfirm);
    if (p.language) setLanguage(p.language);
    if (p.tncAccepted !== undefined) setTncAccepted(Boolean(p.tncAccepted));
    if (p.infoAccepted !== undefined) setInfoAccepted(Boolean(p.infoAccepted));
  }, [route?.params]);

  const pinSet = pin.length === 4;
  const canSubmit =
    tncAccepted &&
    infoAccepted &&
    pinSet &&
    email.trim() &&
    emailConfirm.trim() &&
    !isSubmitting;

  const goToPinSetup = () =>
    navigation.navigate('PinSetup', {
      returnTo: 'Register',
      returnParams: {
        email,
        emailConfirm,
        language,
        tncAccepted,
        infoAccepted,
      },
    });

  const submit = async () => {
    setLocalError('');
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email.trim())) {
      setLocalError(t('authEmailInvalid') ?? 'Email is invalid');
      return;
    }
    if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      setLocalError(t('authEmailMismatch') ?? 'Emails do not match');
      return;
    }
    if (!pinSet) {
      setLocalError(t('authPinRequired') ?? 'PIN is required');
      return;
    }
    if (!tncAccepted || !infoAccepted) {
      setLocalError(
        t('authAcceptTermsRequired') ?? 'Please accept the terms',
      );
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const ok = await register({
      email: trimmedEmail,
      pin,
      displayName: trimmedEmail.split('@')[0],
    });
    if (ok) {
      await SecureStore.setItemAsync(REMEMBERED_EMAIL_KEY, trimmedEmail);
      changeLanguage(language);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  const s = makeStyles({ colors, fontSize, radius, spacing });
  const selectedLang =
    LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[1];

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
          {/* Title */}
          <Text style={s.heading}>
            {t('authCreateAccount') ?? 'Create account'}
          </Text>
          <Text style={s.subheading}>
            {t('authJoinStaffArts') ?? 'Join Staff Arts'}
          </Text>

          <View style={{ height: 24 }} />

          {/* Language */}
          <Text style={s.sectionLabel}>{t('authLanguage') ?? 'Language'}</Text>
          <View style={{ marginBottom: 24 }}>
            <TouchableOpacity
              style={[
                s.dropdown,
                langOpen && { borderColor: colors.accent },
              ]}
              onPress={() => setLangOpen((o) => !o)}
              activeOpacity={0.8}
            >
              <Text style={s.dropdownFlag}>{selectedLang.flag}</Text>
              <Text style={s.dropdownValue}>{selectedLang.label}</Text>
              <Text style={s.dropdownArrow}>{langOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {langOpen && (
              <View style={s.dropdownList}>
                {LANGUAGES.map(({ code, flag, label }) => {
                  const active = language === code;
                  return (
                    <TouchableOpacity
                      key={code}
                      style={[
                        s.dropdownItem,
                        active && {
                          backgroundColor: `${colors.accent}14`,
                        },
                      ]}
                      onPress={() => {
                        setLanguage(code);
                        changeLanguage(code);
                        setLangOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={s.dropdownFlag}>{flag}</Text>
                      <Text
                        style={[
                          s.dropdownItemLabel,
                          {
                            color: active ? colors.accent : colors.text,
                            fontWeight: active ? '700' : '500',
                          },
                        ]}
                      >
                        {label}
                      </Text>
                      {active && (
                        <Text style={{ color: colors.accent, fontSize: 16 }}>
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Error */}
          {!!error && <Text style={s.error}>{error}</Text>}

          {/* Email */}
          <UnderlineField
            label={`${t('authEmail') ?? 'Email'}*`}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            colors={colors}
            fontSize={fontSize}
          />

          {/* Confirm email */}
          <UnderlineField
            label={`${t('authConfirmEmail') ?? 'Confirm email'}*`}
            value={emailConfirm}
            onChangeText={setEmailConfirm}
            keyboardType="email-address"
            colors={colors}
            fontSize={fontSize}
          />

          {/* PIN row → navigates to PinSetup */}
          <TouchableOpacity style={s.pinRow} onPress={goToPinSetup}>
            <Text style={s.pinLabel}>
              {`${t('authPin') ?? 'PIN code'}*`}
            </Text>
            <Text style={[s.pinAction, pinSet && s.pinDone]}>
              {pinSet
                ? (t('authPinCreated') ?? 'PIN created ✓')
                : (t('authCreatePin') ?? 'Create PIN ›')}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />

          {/* Terms */}
          <View style={s.checkRow}>
            <TouchableOpacity
              onPress={() => setTncAccepted(!tncAccepted)}
              activeOpacity={0.7}
            >
              <View
                style={[s.checkbox, tncAccepted && s.checkboxChecked]}
              >
                {tncAccepted && <Text style={s.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
            <Text style={s.checkText}>
              {t('authAcceptTerms') ?? 'I accept the'}{' '}
              <Text
                style={s.checkLink}
                onPress={() => navigation.navigate('Terms')}
              >
                {t('authTermsLink') ?? 'terms and conditions'}
              </Text>
              {'\n'}
              {t('authIncludingPrivacy') ?? 'including the privacy policy.'}
            </Text>
          </View>

          <View style={{ height: 16 }} />

          {/* Data consent (PIN-focused wording) */}
          <TouchableOpacity
            style={s.checkRow}
            onPress={() => setInfoAccepted(!infoAccepted)}
            activeOpacity={0.7}
          >
            <View style={[s.checkbox, infoAccepted && s.checkboxChecked]}>
              {infoAccepted && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.checkText}>
              {t('authConsentText') ??
                'I consent to the storage of my email and PIN for the purpose of authentication.'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />

          {/* Continue */}
          <TouchableOpacity
            style={[s.btn, !canSubmit && s.btnDisabled]}
            onPress={canSubmit ? submit : undefined}
            activeOpacity={canSubmit ? 0.85 : 1}
          >
            <Text style={s.btnText}>
              {isSubmitting
                ? '...'
                : (t('authContinue') ?? 'Continue →')}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={s.alreadyText}>
              {t('authAlreadyAccount') ?? 'Already have an account? Log in'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Underline text field with label above ──────────────────────────────────

function UnderlineField({
  label,
  value,
  onChangeText,
  keyboardType,
  colors,
  fontSize,
}) {
  return (
    <View style={{ width: '100%', marginBottom: 24 }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: fontSize.md,
          fontWeight: '600',
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          color: colors.text,
          fontSize: fontSize.md,
          fontWeight: '500',
          paddingBottom: 8,
        }}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.textMuted}
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

const makeStyles = ({ colors, fontSize, radius, spacing }) =>
  StyleSheet.create({
    bg: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 30,
      paddingTop: 60,
      paddingBottom: 50,
    },
    heading: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: 0.3,
      textAlign: 'center',
    },
    subheading: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      textAlign: 'center',
      marginTop: 4,
    },
    sectionLabel: {
      color: colors.textMuted,
      fontSize: fontSize.md,
      fontWeight: '700',
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderWidth: 1.5,
      borderColor: colors.borderLight ?? '#ccc',
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      gap: 10,
    },
    dropdownFlag: { fontSize: 20 },
    dropdownValue: {
      flex: 1,
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
    },
    dropdownArrow: { fontSize: 11, color: colors.textMuted },
    dropdownList: {
      borderWidth: 1.5,
      borderTopWidth: 0,
      borderColor: colors.borderLight ?? '#ccc',
      borderBottomLeftRadius: radius.md,
      borderBottomRightRadius: radius.md,
      overflow: 'hidden',
      marginTop: -2,
      backgroundColor: colors.surface,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight ?? '#eee',
      gap: 10,
    },
    dropdownItemLabel: {
      flex: 1,
      fontSize: fontSize.md,
    },
    error: {
      color: colors.danger ?? '#C62828',
      fontSize: fontSize.sm,
      marginBottom: 16,
    },
    pinRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
      paddingBottom: 8,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.borderLight ?? '#ccc',
    },
    pinLabel: {
      color: colors.textMuted,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    pinAction: {
      color: colors.accent,
      fontSize: fontSize.md,
      fontWeight: '700',
    },
    pinDone: { color: '#2E7D32' },
    checkRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.borderLight ?? '#ccc',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
      flexShrink: 0,
    },
    checkboxChecked: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 16,
    },
    checkText: {
      color: colors.text,
      fontSize: fontSize.sm,
      lineHeight: 20,
      flex: 1,
    },
    checkLink: {
      color: colors.text,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    btn: {
      width: '100%',
      height: 56,
      backgroundColor: colors.accent,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.accent,
      shadowOpacity: 0.4,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    btnDisabled: { opacity: 0.4 },
    btnText: {
      color: '#FFFFFF',
      fontSize: fontSize.md,
      fontWeight: '800',
      letterSpacing: 2,
    },
    alreadyText: {
      color: colors.textMuted,
      fontSize: fontSize.md,
      fontWeight: '600',
      textAlign: 'center',
    },
  });