// src/screens/explore/ExploreScreen.js
//
// Browse + search all artworks. Search matches title / medium / artist
// name (server-side). A "For sale" chip filters to available pieces.
// Single-column immersive feed (Hinge/Instagram profile-scroll style):
// big full-width image-forward cards, one per row.
//
// Card height is no longer fixed — each ExploreFeedCard sizes itself to its
// image's own aspect ratio so artwork is never cropped. This screen only
// computes the card width (screen minus horizontal padding).

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, X } from 'lucide-react-native';

import Header from '../../components/Header';
import ExploreFeedCard from '../../components/ExploreFeedCard';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useExploreArtworks } from '../../hooks/useExploreArtworks';

export default function ExploreScreen() {
  const { colors, fontSize, spacing, radius } = useTheme();
  const { t } = useT();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  const [search, setSearch] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const {
    artworks,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefreshing,
    refetch,
    isSearching,
  } = useExploreArtworks({ search, availableOnly });

  const s = makeStyles({ colors, fontSize, spacing, radius });

  // Card width = screen minus horizontal padding. Height now follows each
  // image's own aspect ratio (handled inside ExploreFeedCard).
  const H_PAD = spacing.lg;
  const cardWidth = useMemo(() => screenWidth - H_PAD * 2, [screenWidth, H_PAD]);

  const onCardPress = useCallback(
    (artwork) => navigation.navigate('ArtworkDetail', { artwork }),
    [navigation],
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }) => (
      <ExploreFeedCard
        artwork={item}
        width={cardWidth}
        onPress={() => onCardPress(item)}
      />
    ),
    [cardWidth, onCardPress],
  );

  const ListHeader = (
    <View>
      <View style={s.searchBar}>
        <Search size={18} color={colors.textMuted} strokeWidth={2} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('exploreSearchPlaceholder') ?? 'Search artworks, artists…'}
          placeholderTextColor={colors.placeholder ?? colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          selectionColor={colors.accent}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <X size={18} color={colors.textMuted} strokeWidth={2} />
          </Pressable>
        )}
      </View>

      <View style={s.chipRow}>
        <FilterChip s={s} colors={colors} label={t('exploreAll') ?? 'All'} active={!availableOnly} onPress={() => setAvailableOnly(false)} />
        <FilterChip s={s} colors={colors} label={t('exploreForSale') ?? 'For sale'} active={availableOnly} onPress={() => setAvailableOnly(true)} />
      </View>
    </View>
  );

  const ListEmpty = !isLoading ? (
    <View style={s.emptyWrap}>
      <Text style={s.emptyText}>
        {isSearching
          ? (t('exploreNoResults') ?? 'No artworks match your search.')
          : (t('exploreEmpty') ?? 'No artworks yet.')}
      </Text>
    </View>
  ) : null;

  const ListFooter = isFetchingNextPage ? (
    <View style={s.footerLoad}>
      <ActivityIndicator color={colors.accent} />
    </View>
  ) : (
    <View style={{ height: 80 }} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('exploreTitle') ?? 'Explore'} />

      {isLoading ? (
        <View style={s.centerLoad}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={artworks}
          keyExtractor={(item, i) => item._id ?? String(i)}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          onRefresh={refetch}
          refreshing={isRefreshing}
          contentContainerStyle={{ paddingHorizontal: H_PAD, paddingTop: spacing.md }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function FilterChip({ s, colors, label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active && { backgroundColor: colors.accent, borderColor: colors.accent }]}
    >
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

function makeStyles({ colors, fontSize, spacing, radius }) {
  return StyleSheet.create({
    centerLoad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingHorizontal: 12,
      height: 44,
      marginBottom: spacing.md,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: fontSize.md,
      paddingVertical: 0,
    },
    chipRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.borderLight ?? '#ccc',
    },
    chipText: { color: colors.text, fontWeight: '600', fontSize: fontSize.sm },
    emptyWrap: { paddingVertical: 60, alignItems: 'center' },
    emptyText: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
    footerLoad: { paddingVertical: 24, alignItems: 'center' },
  });
}