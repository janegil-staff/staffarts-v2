// src/components/PinInput.js
//
// 4-digit PIN input with one box per digit. Auto-advances on typing,
// backspace moves focus back. Numeric keyboard. Used in LoginScreen,
// RegisterScreen, and the reset-PIN flow.

import { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const LENGTH = 4;

export default function PinInput({
  value,
  onChange,
  autoFocus = false,
  editable = true,
  hasError = false,
  testID,
}) {
  const { colors, radius, fontSize } = useTheme();
  const inputs = useRef([]);

  // Pad value to LENGTH so each box has a defined character (or empty).
  const digits = (value || '').slice(0, LENGTH).padEnd(LENGTH, '');

  useEffect(() => {
    if (autoFocus && inputs.current[0]) {
      // Slight delay to allow modal/screen transitions to settle.
      const t = setTimeout(() => inputs.current[0]?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const handleChange = (index, text) => {
    // Only accept digits.
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) {
      // Allow clearing the current box (e.g. via backspace on iOS).
      const next = (value || '').slice(0, index) + (value || '').slice(index + 1);
      onChange(next.padEnd(0, ''));
      return;
    }

    // If the user pasted multiple digits (e.g. autofill from SMS code),
    // distribute across boxes from `index` onward.
    const incoming = cleaned.slice(0, LENGTH - index);
    const before = (value || '').slice(0, index);
    const after = (value || '').slice(index + incoming.length);
    const combined = (before + incoming + after).slice(0, LENGTH);
    onChange(combined);

    // Move focus to the next empty box, or blur if full.
    const nextFocus = Math.min(index + incoming.length, LENGTH - 1);
    if (combined.length >= LENGTH) {
      inputs.current[LENGTH - 1]?.blur();
    } else if (nextFocus !== index) {
      inputs.current[nextFocus]?.focus();
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      // If current box is empty, jump back and clear the previous one.
      const next = (value || '').slice(0, index - 1);
      onChange(next);
      inputs.current[index - 1]?.focus();
    }
  };

  const borderColor = hasError ? colors.danger : colors.border;
  const focusBorderColor = hasError ? colors.danger : colors.accent;

  return (
    <View style={styles.row} testID={testID}>
      {Array.from({ length: LENGTH }).map((_, i) => {
        const filled = !!digits[i];
        return (
          <TextInput
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={digits[i] || ''}
            onChangeText={(t) => handleChange(i, t)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(i, nativeEvent.key)
            }
            keyboardType="number-pad"
            maxLength={LENGTH} // allow paste
            secureTextEntry
            editable={editable}
            textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
            autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'off'}
            selectTextOnFocus
            style={[
              styles.box,
              {
                borderColor: filled ? focusBorderColor : borderColor,
                backgroundColor: colors.surface,
                color: colors.text,
                fontSize: fontSize.xl,
                borderRadius: radius.md,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  box: {
    flex: 1,
    height: 64,
    borderWidth: 1.5,
    textAlign: 'center',
    fontWeight: '600',
  },
});