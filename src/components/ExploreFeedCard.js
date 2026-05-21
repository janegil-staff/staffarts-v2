// src/components/ExploreFeedCard.js
//
// Big, full-width, image-forward card for the single-column Explore feed
// (Hinge/Instagram profile-scroll style). Large cover image with the title,
// artist, price, and status overlaid at the bottom on a gradient scrim.
//
// The card height follows each image's own aspect ratio — measured from the
// loaded image via onLoad — so artwork is never cropped. Cards vary in height
// down the feed, which is fine for a single-column layout.

import { useMemo, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useT } from '../i18n';
import { coverImageUrl, formatPrice } from '../utils/format';

const STATUS_COLORS = {
  available: '#4aba7a',
  reserved: '#e8a838',
  sold: '#e05050',
};

export default function ExploreFeedCard({ artwork, width, onPress }) {
  const { colors, radius, fontSize, spacing } = useTheme();
  const { t, lang } = useT();
  const s = useMemo(
    () => makeStyles({ colors, radius, fontSize, spacing }),
    [colors, radius, fontSize, spacing],
  );

  // Card height follows each image's true aspect ratio (width / height).
  // Default to 1 (square) so there's no layout jump before the image loads,
  // and so missing-image cards still render with a sensible height.
  const [ratio, setRatio] = useState(1);

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
  const statusLabel = t(`artworkStatus_${artwork.status}`) ?? artwork.status;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { width, marginBottom: spacing.lg },
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={[s.card, { width, height: width / ratio }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={s.image}
            resizeMode="cover"
            onLoad={(e) => {
              const { width: w, height: h } = e.nativeEvent.source;
              if (w && h) setRatio(w / h);
            }}
          />
        ) : (
          <View style={[s.image, s.placeholder]} />
        )}

        {/* Status chip top-right */}
        {statusColor && (
          <View style={s.statusChip}>
            <View style={[s.statusDot, { backgroundColor: statusColor }]} />
            <Text style={s.statusChipText}>{statusLabel}</Text>
          </View>
        )}

        {/* Bottom gradient scrim + info */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={s.scrim}
        >
          <Text style={s.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={s.metaRow}>
            {!!artistName && (
              <Text style={s.artist} numberOfLines={1}>
                {artistName}
              </Text>
            )}
            {!!priceLabel && <Text style={s.price}>{priceLabel}</Text>}
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}

function makeStyles({ colors, radius, fontSize, spacing }) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.lg ?? 16,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },
    image: { width: '100%', height: '100%' },
    placeholder: { backgroundColor: colors.borderLight ?? '#E5E5E5' },
    statusChip: {
      position: 'absolute',
      top: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    scrim: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 40,
      paddingBottom: 16,
    },
    title: { color: '#fff', fontSize: fontSize.xl, fontWeight: '700' },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    artist: {
      color: 'rgba(255,255,255,0.88)',
      fontSize: fontSize.md,
      flex: 1,
    },
    price: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '700',
      marginLeft: 12,
    },
  });
}