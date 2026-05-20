// src/components/ShowRow.js
//
// Single row in the shows feed. Used by HomeScreen and could be reused in
// a dedicated Shows screen.

import { useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useT } from '../i18n';
import { formatMonthDay } from '../utils/format';

const PALETTES = {
  exhibition: { color: '#60a5fa', bg: '#1e2d4a', icon: '🏛' },
  music: { color: '#c084fc', bg: '#2d1b4e', icon: '♪' },
  event: { color: '#2dd4a0', bg: '#0d3b2e', icon: '◆' },
};

export default function ShowRow({ item, lang, onPress }) {
  const { colors, spacing, radius, fontSize } = useTheme();
  const { t } = useT();
  const styles = useMemo(
    () => makeStyles({ colors, spacing, radius, fontSize }),
    [colors, spacing, radius, fontSize],
  );

  const palette = PALETTES[item._kind] || PALETTES.event;
  const dateStr = item._kind === 'music' ? '' : formatMonthDay(item._date, lang);
  const title = String(item.title ?? '');
  const location = String(item.location ?? '');
  const badge = String(item._badge ?? '');
  const isFree = item.isFree === true;
  const hasImage = !!item._imageUrl;

  const details = [badge, dateStr, location].filter(Boolean).join('  ·  ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {hasImage ? (
        <Image
          source={{ uri: item._imageUrl }}
          style={styles.thumb}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumb, { backgroundColor: palette.bg }]}>
          <Text style={[styles.thumbIcon, { color: palette.color }]}>
            {palette.icon}
          </Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.dot, { backgroundColor: palette.color }]} />
          <Text style={styles.details} numberOfLines={1}>
            {details}
          </Text>
        </View>
      </View>

      {isFree && (
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>{t('homeFreeBadge')}</Text>
        </View>
      )}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function makeStyles({ colors, spacing, radius, fontSize }) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    pressed: { opacity: 0.6 },
    thumb: {
      width: 48,
      height: 48,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    thumbIcon: { fontSize: 18 },
    body: { flex: 1, marginLeft: spacing.md, minWidth: 0 },
    title: { fontSize: fontSize.md, fontWeight: '500', color: colors.text },
    meta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    details: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted },
    freeBadge: {
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: radius.full,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: spacing.xs,
    },
    freeBadgeText: { fontSize: 9, color: colors.accent, fontWeight: '600' },
    chevron: {
      marginLeft: spacing.sm,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },
  });
}