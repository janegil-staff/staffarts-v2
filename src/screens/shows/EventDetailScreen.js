// src/screens/shows/EventDetailScreen.js
//
// Event detail. Receives the event via route params for instant render,
// refetches by id for full data. Owner sees Edit / Delete.

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
import { X, Pencil, Trash2, Calendar, MapPin, Ticket } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { coverImageUrl, formatPrice } from '../../utils/format';
import { useAuthStore } from '../../stores/authStore';
import * as eventApi from '../../api/event';

const CATEGORY_BADGE_KEY = {
  opening: 'homeBadgeOpening',
  exhibition: 'homeBadgeExhibition',
  workshop: 'homeBadgeWorkshop',
  talk: 'homeBadgeTalk',
  fair: 'homeBadgeFair',
  concert: 'homeBadgeConcert',
  performance: 'homeBadgeLive',
  other: 'homeBadgeEvent',
};

export default function EventDetailScreen({ route }) {
  const { colors, spacing, fontSize, radius } = useTheme();
  const { t, lang } = useT();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const queryClient = useQueryClient();

  const passed = route.params?.event ?? {};
  const id = passed._id || route.params?.id;

  const { data } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.fetchEvent(id),
    enabled: !!id,
    initialData: passed._id ? passed : undefined,
    staleTime: 30_000,
  });

  const event = data ?? passed;
  const user = useAuthStore((sel) => sel.user);
  const myId = user?._id || user?.id || null;
  const ownerId =
    (event.createdBy && (event.createdBy._id || event.createdBy.id)) ||
    event.createdBy ||
    null;
  const isOwner = !!myId && !!ownerId && String(myId) === String(ownerId);

  const cover = coverImageUrl(event.coverImage);
  const organizerName =
    event.createdBy?.displayName ?? event.createdBy?.name ?? '';

  const when = event.date ? new Date(event.date) : null;
  const dateStr = when
    ? when.toLocaleDateString(lang || undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  const timeStr = when
    ? when.toLocaleTimeString(lang || undefined, { hour: '2-digit', minute: '2-digit' })
    : '';
  const badge = t(CATEGORY_BADGE_KEY[event.category] || 'homeBadgeEvent');
  const priceLabel =
    !event.isFree && event.ticketPrice != null
      ? formatPrice(event.ticketPrice, event.currency, lang)
      : '';

  const s = makeStyles({ colors, spacing, fontSize, radius });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['event', id] });
  };

  const onEdit = () => navigation.navigate('NewEvent', { event });

  const onDelete = () => {
    Alert.alert(
      t('eventDeleteTitle') ?? 'Delete event?',
      t('eventDeleteMsg') ?? 'This permanently removes this event. This cannot be undone.',
      [
        { text: t('cancel') ?? 'Cancel', style: 'cancel' },
        {
          text: t('eventDeleteConfirm') ?? 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventApi.deleteEvent(id);
              refreshAll();
              navigation.goBack();
            } catch (e) {
              Alert.alert(
                t('eventDeleteFailed') ?? 'Could not delete event',
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
        <View style={{ position: 'relative' }}>
          {cover ? (
            <Image source={{ uri: cover }} style={{ width: screenWidth, height: screenWidth * 0.66 }} resizeMode="cover" />
          ) : (
            <View style={{ width: screenWidth, height: screenWidth * 0.5, backgroundColor: colors.surface }} />
          )}

          <View style={[s.backWrap, { top: spacing.lg + 24 }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={10}
              style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.8 }]}
              accessibilityLabel={t('close') ?? 'Close'}
            >
              <X size={22} color="#fff" strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        <View style={{ padding: spacing.lg }}>
          <View style={s.badgeRow}>
            <View style={s.badge}>
              <Text style={s.badgeText}>{badge}</Text>
            </View>
            {event.isFree && (
              <View style={[s.badge, s.freeBadge]}>
                <Text style={[s.badgeText, { color: colors.accent }]}>
                  {t('homeFreeBadge') ?? 'Free'}
                </Text>
              </View>
            )}
          </View>

          <Text style={s.title}>{event.title || (t('eventTitle') ?? 'Event')}</Text>

          {isOwner && (
            <View style={s.ownerActions}>
              <Pressable onPress={onEdit} style={({ pressed }) => [s.ownerBtn, pressed && { opacity: 0.7 }]}>
                <Pencil size={16} color={colors.accent} strokeWidth={2} />
                <Text style={[s.ownerBtnText, { color: colors.accent }]}>{t('eventEdit') ?? 'Edit'}</Text>
              </Pressable>
              <Pressable
                onPress={onDelete}
                style={({ pressed }) => [s.ownerBtn, { borderColor: '#dc2626' }, pressed && { opacity: 0.7 }]}
              >
                <Trash2 size={16} color="#dc2626" strokeWidth={2} />
                <Text style={[s.ownerBtnText, { color: '#dc2626' }]}>{t('eventDelete') ?? 'Delete'}</Text>
              </Pressable>
            </View>
          )}

          {/* When */}
          {!!dateStr && (
            <View style={s.infoRow}>
              <Calendar size={18} color={colors.textMuted} strokeWidth={2} />
              <Text style={s.infoText}>{`${dateStr} · ${timeStr}`}</Text>
            </View>
          )}

          {/* Where */}
          {!!event.location && (
            <View style={s.infoRow}>
              <MapPin size={18} color={colors.textMuted} strokeWidth={2} />
              <Text style={s.infoText}>{event.location}</Text>
            </View>
          )}

          {/* Ticket price / free */}
          <View style={s.infoRow}>
            <Ticket size={18} color={colors.textMuted} strokeWidth={2} />
            <Text style={s.infoText}>
              {event.isFree
                ? (t('homeFreeBadge') ?? 'Free')
                : priceLabel || (t('eventPriceTBA') ?? 'Price to be announced')}
            </Text>
          </View>

          {/* Organizer */}
          {!!organizerName && (
            <Text style={s.organizer}>
              {(t('eventBy') ?? 'By')} {organizerName}
            </Text>
          )}

          {/* Description */}
          {!!event.description && (
            <Text style={s.description}>{event.description}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }) {
  return StyleSheet.create({
    backWrap: { position: 'absolute', left: spacing.lg },
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
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    badge: {
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    freeBadge: { borderWidth: 1, borderColor: colors.accent },
    badgeText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted },
    title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
    ownerActions: { flexDirection: 'row', gap: 12, marginTop: spacing.md },
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
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.md },
    infoText: { color: colors.text, fontSize: fontSize.md, flex: 1 },
    organizer: { marginTop: spacing.md, color: colors.textMuted, fontSize: fontSize.sm },
    description: { marginTop: spacing.md, color: colors.text, fontSize: fontSize.sm, lineHeight: 22 },
  });
}