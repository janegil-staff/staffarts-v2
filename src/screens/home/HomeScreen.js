// src/screens/home/HomeScreen.js
//
// Composes Header, greeting, shows feed, and artwork grid. All heavy
// lifting lives in useHomeFeed and the individual components.

import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '../../components/Header';
import SectionHeader from '../../components/SectionHeader';
import ShowRow from '../../components/ShowRow';
import ArtworkGrid from '../../components/ArtworkGrid';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useHomeFeed } from '../../hooks/useHomeFeed';

const greetingKey = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return 'homeGreetingMorning';
  if (h < 18) return 'homeGreetingAfternoon';
  return 'homeGreetingEvening';
};

const firstNameOf = (user, fallback) =>
  user?.name?.trim().split(' ')[0] ||
  user?.displayName?.trim().split(' ')[0] ||
  fallback;

export default function HomeScreen() {
  const { t, lang } = useT();
  const { colors, spacing, fontSize } = useTheme();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  const styles = useMemo(
    () => makeStyles({ colors, spacing, fontSize }),
    [colors, spacing, fontSize],
  );

  const { artworks, shows, isLoading, isRefreshing, isEmpty, refresh } =
    useHomeFeed();

  const onShowPress = useCallback(
    (item) => {
      const id = item?._id ? String(item._id) : '';
      if (!id) return;
      if (item._kind === 'event') {
        navigation.navigate('EventDetail', { id });
      } else if (item._kind === 'exhibition') {
        navigation.navigate('ExhibitionDetail', { id });
      }
    },
    [navigation],
  );

  const onArtworkPress = useCallback(
    (artwork) => {
      navigation.navigate('ArtworkDetail', { artwork });
    },
    [navigation],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing && !isLoading}
            onRefresh={refresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingMuted}>{t(greetingKey())},</Text>
          <Text style={styles.greetingName} numberOfLines={1}>
            {firstNameOf(user, t('homeGreetingFallback'))}
          </Text>
        </View>

        {shows.length > 0 && (
          <>
            <SectionHeader label={t('homeShowsAndMusic')} />
            <View style={{ paddingHorizontal: spacing.md }}>
              {shows.map((item) => (
                <ShowRow
                  key={`${item._kind}-${item._id ?? item._date.getTime()}`}
                  item={item}
                  lang={lang}
                  onPress={() => onShowPress(item)}
                />
              ))}
            </View>
          </>
        )}

        {artworks.length > 0 && (
          <>
            <SectionHeader label={t('homeJustAdded')} />
            <ArtworkGrid artworks={artworks} onPress={onArtworkPress} />
          </>
        )}

        {isEmpty && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🎨</Text>
            <Text style={styles.emptyTitle}>{t('homeEmptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('homeEmptyBody')}</Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.accent} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles({ colors, spacing, fontSize }) {
  return StyleSheet.create({
    scrollContent: { paddingBottom: 100 },
    greetingWrap: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg + 4,
      paddingBottom: spacing.lg,
    },
    greetingMuted: { fontSize: fontSize.sm, color: colors.textMuted },
    greetingName: {
      fontSize: fontSize.xxl,
      fontWeight: '300',
      color: colors.text,
      marginTop: 2,
    },
    emptyWrap: {
      alignItems: 'center',
      marginTop: 60,
      paddingHorizontal: spacing.lg,
    },
    emptyEmoji: { fontSize: 48 },
    emptyTitle: {
      marginTop: spacing.md,
      fontSize: fontSize.lg,
      fontWeight: '500',
      color: colors.text,
    },
    emptyBody: {
      marginTop: spacing.xs,
      fontSize: fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
    loadingWrap: { padding: 40, alignItems: 'center' },
  });
}