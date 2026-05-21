// src/components/PinInput.js
//
// Slim underline-style PIN/code entry — the look used across the auth flow.
// Each slot is a transparent TextInput above a thin underline; the active slot
// thickens and takes the accent color, and errors turn the line red. No boxes.
//
// Props:
//   value      (string)        current digits
//   onChange   (fn)            called with the new digit string
//   length     (number=4)      number of slots (e.g. 6 for a reset code)
//   secure     (bool=true)     mask digits as dots (set false to show digits)
//   editable   (bool=true)     disable input while submitting
//   hasError   (bool=false)    paint the underlines red
//   autoFocus  (bool=false)    focus the first slot on mount
//
// Pulls colors/fontSize from the theme itself, so callers just pass value/onChange.

import { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

const SLOT_WIDTH = 44;

export default function PinInput({
  value,
  onChange,
  length = 4,
  secure = true,
  editable = true,
  hasError = false,
  autoFocus = false,
}) {
  const { colors, fontSize } = useTheme();
  const refs = useRef([]);

  useEffect(() => {
    if (autoFocus) {
      const id = setTimeout(() => refs.current[0]?.focus(), 150);
      return () => clearTimeout(id);
    }
  }, [autoFocus]);

  const digits = (value || '').slice(0, length).padEnd(length, '');
  const activeIndex = Math.min((value || '').length, length - 1);

  const handleChange = (index, text) => {
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) {
      onChange((value || '').slice(0, index));
      return;
    }
    const incoming = cleaned.slice(0, length - index);
    const before = (value || '').slice(0, index);
    const combined = (before + incoming).slice(0, length);
    onChange(combined);
    const nextFocus = Math.min(index + incoming.length, length - 1);
    if (combined.length >= length) {
      refs.current[length - 1]?.blur();
    } else if (nextFocus !== index) {
      refs.current[nextFocus]?.focus();
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      onChange((value || '').slice(0, index - 1));
      refs.current[index - 1]?.focus();
    }
  };

  const lineDefault = colors.borderLight ?? '#ccc';
  const lineActive = hasError ? (colors.danger ?? '#C62828') : colors.accent;

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const filled = !!digits[i];
        const isActive = i === activeIndex;
        const lineColor = filled || isActive ? lineActive : lineDefault;

        return (
          <View key={i} style={styles.slot}>
            <TextInput
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={digits[i] || ''}
              onChangeText={(text) => handleChange(i, text)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={length}
              secureTextEntry={secure}
              editable={editable}
              textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
              selectTextOnFocus
              style={[styles.input, { color: colors.text, fontSize: fontSize.xl }]}
            />
            <View
              style={[
                styles.line,
                { backgroundColor: lineColor, height: isActive ? 2.5 : 1.5 },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 18, justifyContent: 'center' },
  slot: { width: SLOT_WIDTH, height: 48, alignItems: 'center', justifyContent: 'center' },
  input: { width: '100%', height: 40, textAlign: 'center', fontWeight: '700', paddingVertical: 0 },
  line: { position: 'absolute', bottom: 0, left: 0, right: 0, borderRadius: 2 },
});