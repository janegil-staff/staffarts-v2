// src/screens/artwork/ArtworkDetailScreen.js
//
// Artwork detail. Receives the artwork object via route params (from the
// card tap) for instant render, then refetches the full record by id to
// fill in anything the list view didn't include (full artist, all images).
//
// Image gallery: a horizontal paging carousel. Because paging requires every
// slide to share the same width (screenWidth), the stage uses a single
// adaptive height (driven by the images' real aspect ratios) and shows each
// image with resizeMode="contain" — so the customer always sees the full,
// uncropped artwork. Letterbox space is filled with a neutral backdrop.

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { coverImageUrl, formatPrice } from '../../utils/format';
import { useAuthStore } from '../../stores/authStore';
import * as artworkApi from '../../api/artwork';

const STATUS_COLORS = {
  available: '#4aba7a',
  reserved: '#e8a838',
  sold: '#e05050',
};

// Bounds for the gallery stage height, expressed as a fraction of the screen
// width. Keeps very tall (portrait) or very wide (panoramic) pieces from
// producing an absurd stage while still respecting their true proportions.
const MIN_STAGE_RATIO = 0.6; // wide/panoramic floor  (height >= 0.6 * width)
const MAX_STAGE_RATIO = 1.4; // tall/portrait ceiling (height <= 1.4 * width)

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

  // Stage height follows the tallest image's aspect ratio (so no image is
  // cropped and the stage doesn't change height as you swipe), clamped to the
  // min/max bounds above. Starts at square and grows/shrinks as images load.
  const [stageHeight, setStageHeight] = useState(screenWidth);

  const onImageLoad = (e) => {
    const { width: w, height: h } = e.nativeEvent.source;
    if (!w || !h) return;
    const ratio = h / w; // height per unit width
    const clamped = Math.min(MAX_STAGE_RATIO, Math.max(MIN_STAGE_RATIO, ratio));
    const desired = Math.round(screenWidth * clamped);
    // Grow the stage to fit the tallest image so every piece shows in full.
    setStageHeight((prev) => Math.max(prev, desired));
  };

  const queryClient = useQueryClient();
  const user = useAuthStore((sel) => sel.user);
  const myId = user?._id || user?.id || null;
  // The artist field may be a populated object or a raw id string.
  const artistId =
    (artwork.artist && (artwork.artist._id || artwork.artist.id)) ||
    artwork.artist ||
    null;
  const isOwner = !!myId && !!artistId && String(myId) === String(artistId);

  const artistName =
    artwork.artist?.displayName ??
    artwork.artist?.name ??
    artwork.artistName ??
    '';
  const artistAvatar = coverImageUrl(artwork.artist?.profileImage);

  // Tappable only when there's a real artist id and the viewer isn't the
  // owner (no point routing to your own public profile from your own work).
  const canViewArtist = !!artistId && !isOwner;

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

  const onViewArtist = () => {
    if (!canViewArtist) return;
    navigation.navigate('PublicProfile', {
      userId: String(artistId),
      profile: typeof artwork.artist === 'object' ? artwork.artist : undefined,
    });
  };

  // ── Owner actions ────────────────────────────────────────────────────
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['artworks'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['artwork', id] });
  };

  const onEdit = () => navigation.navigate('NewArtwork', { artwork });

  const onChangeStatus = () => {
    const options = ['available', 'reserved', 'sold'];
    Alert.alert(
      t('artworkChangeStatus') ?? 'Change status',
      undefined,
      [
        ...options.map((st) => ({
          text: t(`artworkStatus_${st}`) ?? st,
          onPress: async () => {
            if (st === artwork.status) return;
            try {
              await artworkApi.updateArtwork(id, { status: st });
              refreshAll();
            } catch (e) {
              Alert.alert(
                t('artworkSaveFailed') ?? 'Could not save changes',
                e?.response?.data?.error || '',
              );
            }
          },
        })),
        { text: t('cancel') ?? 'Cancel', style: 'cancel' },
      ],
    );
  };

  const onDelete = () => {
    Alert.alert(
      t('artworkDeleteTitle') ?? 'Delete artwork?',
      t('artworkDeleteMsg') ??
        'This permanently removes this artwork. This cannot be undone.',
      [
        { text: t('cancel') ?? 'Cancel', style: 'cancel' },
        {
          text: t('artworkDeleteConfirm') ?? 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await artworkApi.deleteArtwork(id);
              refreshAll();
              navigation.goBack();
            } catch (e) {
              Alert.alert(
                t('artworkDeleteFailed') ?? 'Could not delete artwork',
                e?.response?.data?.error || '',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Image gallery (horizontal pager). Fixed-width slides with a single
            adaptive stage height; each image is shown in full via "contain"
            against a neutral backdrop so artwork is never cropped. */}
        <View style={{ position: 'relative' }}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollImages}
            >
              {images.map((uri, i) => (
                <View
                  key={`${uri}-${i}`}
                  style={[
                    s.slide,
                    { width: screenWidth, height: stageHeight },
                  ]}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: screenWidth, height: stageHeight }}
                    resizeMode="contain"
                    onLoad={onImageLoad}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View
              style={{
                width: screenWidth,
                height: stageHeight,
                backgroundColor: colors.surface,
              }}
            />
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
          {/* Title + status (status pill is tappable for the owner) */}
          <View style={s.titleRow}>
            <Text style={s.title}>{artwork.title || (t('artworkTitlePlaceholder') ?? 'Untitled')}</Text>
            <Pressable
              onPress={isOwner ? onChangeStatus : undefined}
              style={({ pressed }) => [
                s.statusPill,
                isOwner && s.statusPillOwner,
                pressed && isOwner && { opacity: 0.7 },
              ]}
            >
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[s.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
              {isOwner && (
                <Text style={[s.statusCaret, { color: statusColor }]}>▾</Text>
              )}
            </Pressable>
          </View>

          {/* Owner edit / delete actions */}
          {isOwner && (
            <View style={s.ownerActions}>
              <Pressable
                onPress={onEdit}
                style={({ pressed }) => [s.ownerBtn, pressed && { opacity: 0.7 }]}
              >
                <Pencil size={16} color={colors.accent} strokeWidth={2} />
                <Text style={[s.ownerBtnText, { color: colors.accent }]}>
                  {t('artworkEdit') ?? 'Edit'}
                </Text>
              </Pressable>

              <Pressable
                onPress={onDelete}
                style={({ pressed }) => [
                  s.ownerBtn,
                  { borderColor: '#dc2626' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Trash2 size={16} color="#dc2626" strokeWidth={2} />
                <Text style={[s.ownerBtnText, { color: '#dc2626' }]}>
                  {t('artworkDelete') ?? 'Delete'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Artist — tappable, routes to the artist's public profile */}
          {!!artistName && (
            <Pressable
              onPress={canViewArtist ? onViewArtist : undefined}
              disabled={!canViewArtist}
              accessibilityRole={canViewArtist ? 'button' : undefined}
              accessibilityLabel={
                canViewArtist
                  ? `${t('viewArtistProfile') ?? 'View profile'}: ${artistName}`
                  : undefined
              }
              style={({ pressed }) => [
                s.artistRow,
                pressed && canViewArtist && { opacity: 0.6 },
              ]}
            >
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
              {canViewArtist && (
                <ChevronRight
                  size={18}
                  color={colors.textMuted}
                  strokeWidth={2}
                  style={{ marginLeft: -2 }}
                />
              )}
            </Pressable>
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
    // Each carousel slide: a neutral backdrop so the letterbox space around a
    // "contain"-fit image reads as intentional rather than as a layout gap.
    slide: {
      backgroundColor: colors.surfaceMuted ?? colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
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
    statusPillOwner: {
      borderWidth: 1,
      borderColor: colors.borderLight ?? '#e5e5e5',
    },
    statusCaret: { fontSize: 10, marginLeft: -2 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: fontSize.xs, fontWeight: '700' },
    ownerActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: spacing.md,
    },
    ownerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    ownerBtnText: { fontSize: fontSize.sm, fontWeight: '700' },
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