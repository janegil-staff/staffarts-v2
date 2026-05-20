// src/components/ArtworkCard.js
//
// Single artwork tile: square cover image with a small status dot, title,
// artist name, and price. Fixed width passed in by the parent grid.

import { useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useT } from '../i18n';
import { coverImageUrl, formatPrice } from '../utils/format';

// Status dot colors. available = green, reserved = amber, sold = red.
const STATUS_COLORS = {
  available: '#4aba7a',
  reserved: '#e8a838',
  sold: '#e05050',
};

export default function ArtworkCard({ artwork, width, marginLeft = 0, onPress }) {
  const { colors, spacing, radius, fontSize } = useTheme();
  const { lang } = useT();
  const styles = useMemo(
    () => makeStyles({ colors, spacing, radius, fontSize }),
    [colors, spacing, radius, fontSize],
  );

  const imageUrl =
    coverImageUrl(artwork.coverImage) ||
    coverImageUrl(artwork.image) ||
    (Array.isArray(artwork.images) && artwork.images.length > 0
      ? coverImageUrl(artwork.images[0])
      : '');

  const title = String(artwork.title ?? '');
  const artistName =
    artwork.artist?.displayName ??
    artwork.artist?.name ??
    artwork.artistName ??
    '';

  const priceLabel = formatPrice(artwork.price, artwork.currency, lang);
  const statusColor = STATUS_COLORS[artwork.status] || null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { width, marginLeft, marginBottom: spacing.md },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.imageWrap, { width, height: width }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder} />
        )}

        {statusColor && (
          <View style={styles.statusDotWrap}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {!!artistName && (
        <Text style={styles.artist} numberOfLines={1}>
          {artistName}
        </Text>
      )}
      {!!priceLabel && (
        <Text style={styles.price} numberOfLines={1}>
          {priceLabel}
        </Text>
      )}
    </Pressable>
  );
}

function makeStyles({ colors, spacing, radius, fontSize }) {
  return StyleSheet.create({
    pressed: { opacity: 0.7 },
    imageWrap: {
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
      overflow: 'hidden',
      position: 'relative',
    },
    image: { width: '100%', height: '100%' },
    placeholder: { flex: 1, backgroundColor: colors.borderLight },
    statusDotWrap: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: 'rgba(255,255,255,0.85)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    title: {
      marginTop: 6,
      fontSize: fontSize.xs,
      fontWeight: '500',
      color: colors.text,
    },
    artist: { fontSize: fontSize.xs, color: colors.textMuted },
    price: {
      marginTop: 1,
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.text,
    },
  });
}