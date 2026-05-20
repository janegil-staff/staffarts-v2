// src/components/ExploreCard.js
//
// Larger artwork card for the 2-column Explore grid. More detail than the
// compact Home card: bigger image, title, artist, price, and a status
// chip with label (not just a dot).

import { useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useT } from '../i18n';
import { coverImageUrl, formatPrice } from '../utils/format';

const STATUS_COLORS = {
  available: '#4aba7a',
  reserved: '#e8a838',
  sold: '#e05050',
};

export default function ExploreCard({ artwork, width, onPress }) {
  const { colors, spacing, radius, fontSize } = useTheme();
  const { t, lang } = useT();
  const s = useMemo(
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
  const statusColor = STATUS_COLORS[artwork.status] || colors.textMuted;
  const statusLabel = t(`artworkStatus_${artwork.status}`) ?? artwork.status;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { width, marginBottom: spacing.lg },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[s.imageWrap, { width, height: width }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={s.image} resizeMode="cover" />
        ) : (
          <View style={s.placeholder} />
        )}

        {/* Status chip */}
        <View style={[s.statusChip, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
          <View style={[s.statusDot, { backgroundColor: statusColor }]} />
          <Text style={s.statusChipText}>{statusLabel}</Text>
        </View>
      </View>

      <Text style={s.title} numberOfLines={1}>
        {title}
      </Text>
      {!!artistName && (
        <Text style={s.artist} numberOfLines={1}>
          {artistName}
        </Text>
      )}
      {!!priceLabel && (
        <Text style={s.price} numberOfLines={1}>
          {priceLabel}
        </Text>
      )}
    </Pressable>
  );
}

function makeStyles({ colors, spacing, radius, fontSize }) {
  return StyleSheet.create({
    imageWrap: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      overflow: 'hidden',
      position: 'relative',
    },
    image: { width: '100%', height: '100%' },
    placeholder: { flex: 1, backgroundColor: colors.borderLight },
    statusChip: {
      position: 'absolute',
      top: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusChipText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    title: {
      marginTop: 8,
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
    },
    artist: {
      marginTop: 1,
      fontSize: fontSize.sm,
      color: colors.textMuted,
    },
    price: {
      marginTop: 2,
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
  });
}