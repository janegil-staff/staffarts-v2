// src/components/SectionHeader.js
//
// Uppercase accent-color label followed by a thin rule. Used to separate
// home sections ("SHOWS & MUSIC", "JUST ADDED", etc.).

import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SectionHeader({ label }) {
  const { colors, spacing, fontSize } = useTheme();
  const styles = useMemo(
    () => makeStyles({ colors, spacing, fontSize }),
    [colors, spacing, fontSize],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{label}</Text>
      <View style={styles.rule} />
    </View>
  );
}

function makeStyles({ colors, spacing, fontSize }) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    text: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.accent,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginRight: spacing.sm,
    },
    rule: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderLight,
    },
  });
}