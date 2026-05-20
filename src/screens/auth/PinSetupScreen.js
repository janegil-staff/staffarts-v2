// src/screens/auth/PinSetupScreen.js
//
// Dedicated PIN creation screen. User enters PIN, confirms it, then taps
// "Save PIN" — we navigate back to whichever screen sent us (typically
// Register), passing the PIN as a navigation param plus all the other
// form state that was preserved in route.params.returnParams.

import { useState, useRef, useEffect } from 'react';
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

import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';

const PIN_LENGTH = 4;

export default function PinSetupScreen({ navigation, route }) {
  const { colors, fontSize, radius } = useTheme();
  const { t } = useT();

  const returnTo = route?.params?.returnTo ?? 'Register';
  const returnParams = route?.params?.returnParams ?? {};

  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [stage, setStage] = useState('enter'); // 'enter' | 'confirm'
  const [error, setError] = useState('');

  const pinRefs = useRef([]);
  const confirmRefs = useRef([]);

  // Focus first box on mount and when switching stages.
  useEffect(() => {
    const t1 = setTimeout(() => {
      if (stage === 'enter') {
        pinRefs.current[0]?.focus();
      } else {
        confirmRefs.current[0]?.focus();
      }
    }, 150);
    return () => clearTimeout(t1);
  }, [stage]);

  const advanceToConfirm = () => {
    if (pin.length !== PIN_LENGTH) {
      setError(t('authPinMustBe4Digits') ?? 'PIN must be 4 digits');
      return;
    }
    setError('');
    setStage('confirm');
  };

  const savePin = () => {
    if (confirm.length !== PIN_LENGTH) {
      setError(t('authPinMustBe4Digits') ?? 'PIN must be 4 digits');
      return;
    }
    if (pin !== confirm) {
      setError(t('authPinsDontMatch') ?? "PINs don't match");
      setConfirm('');
      setTimeout(() => confirmRefs.current[0]?.focus(), 50);
      return;
    }
    // Navigate back to Register (or whoever sent us) with the new PIN.
    navigation.navigate(returnTo, { ...returnParams, pin });
  };

  const s = makeStyles({ colors, fontSize, radius });

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
          {/* Back link */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backBtn}
          >
            <Text style={s.backText}>← {t('navBack') ?? 'Back'}</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />

          <Text style={s.title}>
            {stage === 'enter'
              ? (t('authCreatePinTitle') ?? 'Create your PIN')
              : (t('authConfirmPinTitle') ?? 'Confirm your PIN')}
          </Text>
          <Text style={s.subtitle}>
            {stage === 'enter'
              ? (t('authCreatePinSub') ??
                  'Choose a 4-digit PIN to secure your account.')
              : (t('authConfirmPinSub') ??
                  'Enter the same 4 digits again to confirm.')}
          </Text>

          <View style={{ height: 48 }} />

          {/* PIN boxes */}
          <View style={s.pinWrap}>
            <PinBoxes
              value={stage === 'enter' ? pin : confirm}
              onChange={(v) => {
                setError('');
                if (stage === 'enter') {
                  setPin(v);
                } else {
                  setConfirm(v);
                }
              }}
              refs={stage === 'enter' ? pinRefs : confirmRefs}
              colors={colors}
              fontSize={fontSize}
              radius={radius}
              hasError={!!error}
            />
          </View>

          {!!error && <Text style={s.error}>{error}</Text>}

          <View style={{ height: 48 }} />

          {/* Action button */}
          <TouchableOpacity
            style={s.btn}
            onPress={stage === 'enter' ? advanceToConfirm : savePin}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>
              {stage === 'enter'
                ? (t('authNext') ?? 'NEXT')
                : (t('authSavePin') ?? 'SAVE PIN')}
            </Text>
          </TouchableOpacity>

          {stage === 'confirm' && (
            <TouchableOpacity
              onPress={() => {
                setStage('enter');
                setConfirm('');
                setError('');
              }}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={s.linkMuted}>
                {t('authChangePin') ?? 'Change PIN'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── 4-box PIN input ────────────────────────────────────────────────────────

const BOX_SIZE = 56; // shrunk from 72

function PinBoxes({ value, onChange, refs, colors, fontSize, radius, hasError }) {
  const digits = (value || '').slice(0, PIN_LENGTH).padEnd(PIN_LENGTH, '');

  const handleChange = (index, text) => {
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) {
      const next = (value || '').slice(0, index);
      onChange(next);
      return;
    }
    const incoming = cleaned.slice(0, PIN_LENGTH - index);
    const before = (value || '').slice(0, index);
    const combined = (before + incoming).slice(0, PIN_LENGTH);
    onChange(combined);
    const nextFocus = Math.min(index + incoming.length, PIN_LENGTH - 1);
    if (combined.length >= PIN_LENGTH) {
      refs.current[PIN_LENGTH - 1]?.blur();
    } else if (nextFocus !== index) {
      refs.current[nextFocus]?.focus();
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = (value || '').slice(0, index - 1);
      onChange(next);
      refs.current[index - 1]?.focus();
    }
  };

  const borderColor = hasError ? (colors.danger ?? '#C62828') : colors.accent;

  return (
    <View style={pinStyles.row}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => {
        const filled = !!digits[i];
        return (
          <TextInput
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={digits[i] || ''}
            onChangeText={(text) => handleChange(i, text)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={PIN_LENGTH}
            secureTextEntry
            textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
            selectTextOnFocus
            style={[
              pinStyles.box,
              {
                borderColor: filled
                  ? borderColor
                  : (colors.borderLight ?? '#ccc'),
                backgroundColor: colors.surface,
                color: colors.text,
                fontSize: fontSize.xl, // was xxl
                borderRadius: radius.md,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const pinStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 2,
    textAlign: 'center',
    fontWeight: '700',
  },
});

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
      paddingTop: 60,
      paddingBottom: 40,
    },
    backBtn: {
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    backText: {
      color: colors.accent,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
    pinWrap: {
      alignItems: 'center',
    },
    error: {
      color: colors.danger ?? '#C62828',
      fontSize: fontSize.sm,
      marginTop: 16,
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
    btnText: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '800',
      letterSpacing: 2,
    },
    linkMuted: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
  });