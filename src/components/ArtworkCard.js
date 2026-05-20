// src/components/ArtworkCard.js
//
// Single artwork tile with image, title, artist name. Square image, fixed
// width passed in by the parent grid for consistent column sizing.

import { useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { coverImageUrl } from '../utils/format';

export default function ArtworkCard({ artwork, width, marginLeft = 0, onPress }) {
  const { colors, spacing, radius, fontSize } = useTheme();
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
  const artistName = artwork.artist?.name ?? artwork.artistName ?? '';

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
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {!!artistName && (
        <Text style={styles.artist} numberOfLines={1}>
          {artistName}
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
    },
    image: { width: '100%', height: '100%' },
    placeholder: { flex: 1, backgroundColor: colors.borderLight },
    title: {
      marginTop: 6,
      fontSize: fontSize.xs,
      fontWeight: '500',
      color: colors.text,
    },
    artist: { fontSize: fontSize.xs, color: colors.textMuted },
  });
}