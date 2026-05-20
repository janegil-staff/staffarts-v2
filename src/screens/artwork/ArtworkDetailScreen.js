// src/screens/artwork/ArtworkDetailScreen.js
//
// Artwork detail. Receives the artwork object via route params (from the
// card tap) for instant render, then refetches the full record by id to
// fill in anything the list view didn't include (full artist, all images).

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { coverImageUrl, formatPrice } from '../../utils/format';
import * as artworkApi from '../../api/artwork';

const STATUS_COLORS = {
  available: '#4aba7a',
  reserved: '#e8a838',
  sold: '#e05050',
};

function imagesOf(artwork) {
  if (Array.isArray(artwork?.images) && artwork.images.length) {
    return artwork.images.map((im) => coverImageUrl(im)).filter(Boolean);
  }
  const single = coverImageUrl(artwork?.coverImage) || coverImageUrl(artwork?.image);
  return single ? [single] : [];
}

export default function ArtworkDetailScreen({ route }) {
  const { colors, spacing, fontSize, radius } = useTheme();
  const { t, lang } = useT();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  const passed = route.params?.artwork ?? {};
  const id = passed._id || route.params?.id;

  // Refetch full record; fall back to the passed object while loading.
  const { data } = useQuery({
    queryKey: ['artwork', id],
    queryFn: () => artworkApi.fetchArtwork(id),
    enabled: !!id,
    initialData: passed._id ? passed : undefined,
    staleTime: 30_000,
  });

  const artwork = data ?? passed;
  const images = imagesOf(artwork);
  const [activeIdx, setActiveIdx] = useState(0);

  const artistName =
    artwork.artist?.displayName ??
    artwork.artist?.name ??
    artwork.artistName ??
    '';
  const artistAvatar = coverImageUrl(artwork.artist?.profileImage);

  const priceLabel = formatPrice(artwork.price, artwork.currency, lang);
  const statusColor = STATUS_COLORS[artwork.status] || colors.textMuted;
  const statusLabel = t(`artworkStatus_${artwork.status}`) ?? artwork.status;

  const dims = artwork.dimensions || {};
  const dimsStr = [dims.width, dims.height, dims.depth]
    .filter((v) => v != null && v !== '')
    .join(' × ');

  const s = makeStyles({ colors, spacing, fontSize, radius });

  const onScrollImages = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    setActiveIdx(Math.round(x / screenWidth));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Image gallery (horizontal pager) */}
        <View style={{ position: 'relative' }}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollImages}
            >
              {images.map((uri, i) => (
                <Image
                  key={`${uri}-${i}`}
                  source={{ uri }}
                  style={{ width: screenWidth, height: screenWidth }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={{ width: screenWidth, height: screenWidth, backgroundColor: colors.surface }} />
          )}

          {/* Back button overlaid on the image — solid dark circle for
              guaranteed visibility against any artwork. */}
          <View style={[s.backWrap, { top: spacing.lg + 24 }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityLabel={t('navBack') ?? 'Back'}
              hitSlop={10}
              style={({ pressed }) => [
                s.backBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <ChevronLeft size={24} color="#fff" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Pager dots */}
          {images.length > 1 && (
            <View style={s.dots}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    s.dot,
                    {
                      backgroundColor:
                        i === activeIdx ? '#fff' : 'rgba(255,255,255,0.5)',
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ padding: spacing.lg }}>
          {/* Title + status */}
          <View style={s.titleRow}>
            <Text style={s.title}>{artwork.title || (t('artworkTitlePlaceholder') ?? 'Untitled')}</Text>
            <View style={s.statusPill}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[s.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Artist */}
          {!!artistName && (
            <View style={s.artistRow}>
              {artistAvatar ? (
                <Image source={{ uri: artistAvatar }} style={s.artistAvatar} />
              ) : (
                <View style={[s.artistAvatar, s.artistAvatarFallback]}>
                  <Text style={s.artistInitial}>
                    {artistName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={s.artistName}>{artistName}</Text>
            </View>
          )}

          {/* Price */}
          {!!priceLabel && <Text style={s.price}>{priceLabel}</Text>}

          {/* Description */}
          {!!artwork.description && (
            <Text style={s.description}>{artwork.description}</Text>
          )}

          {/* Meta */}
          <View style={s.metaBlock}>
            {!!artwork.medium && (
              <MetaRow s={s} label={t('artworkMedium') ?? 'Medium'} value={artwork.medium} />
            )}
            {!!dimsStr && (
              <MetaRow
                s={s}
                label={t('artworkDimensions') ?? 'Dimensions'}
                value={`${dimsStr} ${dims.unit || 'cm'}`}
              />
            )}
            {!!artwork.year && (
              <MetaRow s={s} label={t('artworkYear') ?? 'Year'} value={String(artwork.year)} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MetaRow({ s, label, value }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }) {
  return StyleSheet.create({
    backWrap: {
      position: 'absolute',
      left: spacing.lg,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 5,
    },
    dots: {
      position: 'absolute',
      bottom: 12,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    dot: { width: 7, height: 7, borderRadius: 4 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      flex: 1,
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.text,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: colors.surface,
      marginTop: 4,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: fontSize.xs, fontWeight: '700' },
    artistRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: spacing.md,
    },
    artistAvatar: { width: 32, height: 32, borderRadius: 16 },
    artistAvatarFallback: {
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    artistInitial: { color: colors.text, fontWeight: '600' },
    artistName: {
      fontSize: fontSize.md,
      color: colors.text,
      fontWeight: '500',
    },
    price: {
      marginTop: spacing.md,
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    description: {
      marginTop: spacing.md,
      fontSize: fontSize.sm,
      color: colors.text,
      lineHeight: 22,
    },
    metaBlock: { marginTop: spacing.lg },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight ?? '#eee',
      gap: 16,
    },
    metaLabel: { color: colors.textMuted, fontSize: fontSize.sm },
    metaValue: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: '500',
      flex: 1,
      textAlign: 'right',
    },
  });
}