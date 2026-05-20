// src/screens/shows/ShowsScreen.js
//
// Upcoming events. Category filter chips across the top, a vertical list of
// events (reusing ShowRow), infinite scroll, and a "+" to create one
// (gated to the auth flow when logged out).

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';

import Header from '../../components/Header';
import ShowRow from '../../components/ShowRow';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents';

const CATEGORIES = [
  null, // All
  'opening',
  'exhibition',
  'workshop',
  'talk',
  'fair',
  'concert',
  'performance',
];

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

export default function ShowsScreen() {
  const { colors, fontSize, spacing } = useTheme();
  const { t, lang } = useT();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  const [category, setCategory] = useState(null);

  const {
    events,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefreshing,
    refetch,
  } = useUpcomingEvents({ category });

  const s = makeStyles({ colors, fontSize, spacing });

  // Map raw event → the shape ShowRow expects.
  const toRow = useCallback(
    (e) => ({
      ...e,
      _kind: e.category === 'exhibition' ? 'exhibition' : 'event',
      _date: e.date ? new Date(e.date) : new Date(),
      _imageUrl: typeof e.coverImage === 'string' ? e.coverImage : '',
      _badge: t(CATEGORY_BADGE_KEY[e.category] || 'homeBadgeEvent'),
    }),
    [t],
  );

  const onPress = useCallback(
    (e) => navigation.navigate('EventDetail', { event: e, id: e._id }),
    [navigation],
  );

  const onCreate = useCallback(() => {
    if (user) navigation.navigate('NewEvent');
    else navigation.navigate('AuthGate');
  }, [user, navigation]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const ListHeader = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.chipRow}
    >
      {CATEGORIES.map((c) => {
        const active = category === c;
        const label = c
          ? (t(`eventCat_${c}`) ?? c)
          : (t('exploreAll') ?? 'All');
        return (
          <Pressable
            key={c ?? 'all'}
            onPress={() => setCategory(c)}
            style={[s.chip, active && { backgroundColor: colors.accent, borderColor: colors.accent }]}
          >
            <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('showsTitle') ?? 'Shows'} />

      {isLoading ? (
        <View style={s.centerLoad}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item, i) => item._id ?? String(i)}
          renderItem={({ item }) => (
            <ShowRow item={toRow(item)} lang={lang} onPress={() => onPress(item)} />
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>
                {t('showsEmpty') ?? 'No upcoming events yet. Tap + to add one.'}
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={s.footerLoad}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : (
              <View style={{ height: 90 }} />
            )
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          onRefresh={refetch}
          refreshing={isRefreshing}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create FAB */}
      <Pressable
        onPress={onCreate}
        style={({ pressed }) => [
          s.fab,
          { backgroundColor: colors.accent },
          pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
        ]}
        accessibilityLabel={t('eventNewTitle') ?? 'New event'}
      >
        <Plus size={26} color="#fff" strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

function makeStyles({ colors, fontSize, spacing }) {
  return StyleSheet.create({
    centerLoad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    chipRow: { gap: 8, paddingVertical: spacing.sm, paddingRight: spacing.lg },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.borderLight ?? '#ccc',
    },
    chipText: { color: colors.text, fontWeight: '600', fontSize: fontSize.sm },
    emptyWrap: { paddingVertical: 60, alignItems: 'center', paddingHorizontal: 24 },
    emptyText: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 20 },
    footerLoad: { paddingVertical: 24, alignItems: 'center' },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 28,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
  });
}