// src/screens/home/HomeScreen.js
import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";

import client from "../../api/client";
import { useAuthStore } from "../../stores/authStore";
import { useTheme } from "../../theme/ThemeContext";
import { useT } from "../../i18n";

const HEADER_BG = "#2D4A6E"; // Staff Arts navy
const HEADER_FG = "#FFFFFF";

const ARTWORKS_LIMIT = 6;
const SHOWS_LIMIT = 3;
const FETCH_LIMIT_PER_KIND = 10;

const EVENT_TYPE_KEYS = {
  opening: "homeBadgeOpening",
  workshop: "homeBadgeWorkshop",
  talk: "homeBadgeTalk",
  fair: "homeBadgeFair",
  concert: "homeBadgeConcert",
  dj_set: "homeBadgeDjSet",
  live_performance: "homeBadgeLive",
  open_mic: "homeBadgeOpenMic",
  festival: "homeBadgeFestival",
  album_release: "homeBadgeRelease",
};

// ── API ────────────────────────────────────────────────────────────────────

const fetchArtworks = async () => {
  const { data } = await client.get("/artworks", {
    params: { limit: ARTWORKS_LIMIT, sort: "-createdAt" },
  });
  return data?.data ?? [];
};
const fetchEvents = async () => {
  const { data } = await client.get("/events", {
    params: { limit: FETCH_LIMIT_PER_KIND, sort: "date" },
  });
  return data?.data ?? [];
};
const fetchExhibitions = async () => {
  const { data } = await client.get("/exhibitions", {
    params: { limit: FETCH_LIMIT_PER_KIND },
  });
  return data?.data ?? [];
};
const fetchTracks = async () => {
  const { data } = await client.get("/tracks", {
    params: { limit: FETCH_LIMIT_PER_KIND },
  });
  return data?.tracks ?? data?.data?.tracks ?? data?.data ?? [];
};

// ── Helpers ────────────────────────────────────────────────────────────────

const greetingKey = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return "homeGreetingMorning";
  if (h < 18) return "homeGreetingAfternoon";
  return "homeGreetingEvening";
};

const firstNameOf = (user, fallback) =>
  user?.name?.trim().split(" ")[0] || fallback;

const initialOf = (user) => {
  const first = user?.name?.trim().charAt(0);
  return first ? first.toUpperCase() : "?";
};

const formatMonthDay = (date, lang) => {
  if (!(date instanceof Date) || isNaN(date)) return "";
  try {
    return new Intl.DateTimeFormat(lang || "en", {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
};

const coverImageUrl = (cover) => {
  if (!cover) return "";
  if (typeof cover === "string") return cover;
  if (typeof cover === "object" && cover.url) return String(cover.url);
  return "";
};

const buildShowsFeed = (events, exhibitions, tracks, t) => {
  const items = [];
  const now = Date.now();

  for (const e of events ?? []) {
    if (!e || typeof e !== "object") continue;
    const d = e.date ? new Date(e.date) : null;
    if (!d || isNaN(d)) continue;
    items.push({
      ...e,
      _kind: "event",
      _date: d,
      _imageUrl: coverImageUrl(e.coverImage),
      _badge: t(EVENT_TYPE_KEYS[e.type] || "homeBadgeEvent"),
    });
  }
  for (const ex of exhibitions ?? []) {
    if (!ex || typeof ex !== "object") continue;
    const d = ex.startDate ? new Date(ex.startDate) : null;
    if (!d || isNaN(d)) continue;
    items.push({
      ...ex,
      _kind: "exhibition",
      _date: d,
      _imageUrl: coverImageUrl(ex.coverImage),
      _badge: t("homeBadgeExhibition"),
    });
  }
  for (const tr of tracks ?? []) {
    if (!tr || typeof tr !== "object") continue;
    items.push({
      ...tr,
      _kind: "music",
      _date: new Date(),
      _imageUrl: typeof tr.coverImage === "string" ? tr.coverImage : "",
      _badge:
        tr.genre && String(tr.genre).length > 0
          ? String(tr.genre)
          : t("homeBadgeMusic"),
    });
  }

  return items
    .filter((i) => i._date.getTime() >= now)
    .sort((a, b) => a._date - b._date)
    .slice(0, SHOWS_LIMIT);
};

// ── Screen ─────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { t, lang } = useT();
  const { colors, spacing, radius, fontSize } = useTheme();
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () => makeStyles({ colors, spacing, radius, fontSize }),
    [colors, spacing, radius, fontSize],
  );

  const artworksQ = useQuery({
    queryKey: ["artworks", "home"],
    queryFn: fetchArtworks,
    staleTime: 60_000,
  });
  const eventsQ = useQuery({
    queryKey: ["events", "home"],
    queryFn: fetchEvents,
    staleTime: 60_000,
  });
  const exhibitionsQ = useQuery({
    queryKey: ["exhibitions", "home"],
    queryFn: fetchExhibitions,
    staleTime: 60_000,
  });
  const tracksQ = useQuery({
    queryKey: ["tracks", "home"],
    queryFn: fetchTracks,
    staleTime: 60_000,
  });

  const shows = useMemo(
    () => buildShowsFeed(eventsQ.data, exhibitionsQ.data, tracksQ.data, t),
    [eventsQ.data, exhibitionsQ.data, tracksQ.data, t],
  );
  const artworks = useMemo(
    () => (artworksQ.data ?? []).slice(0, ARTWORKS_LIMIT),
    [artworksQ.data],
  );

  const isLoading =
    artworksQ.isLoading &&
    eventsQ.isLoading &&
    exhibitionsQ.isLoading &&
    tracksQ.isLoading;
  const isRefreshing =
    artworksQ.isFetching ||
    eventsQ.isFetching ||
    exhibitionsQ.isFetching ||
    tracksQ.isFetching;

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["artworks", "home"] });
    queryClient.invalidateQueries({ queryKey: ["events", "home"] });
    queryClient.invalidateQueries({ queryKey: ["exhibitions", "home"] });
    queryClient.invalidateQueries({ queryKey: ["tracks", "home"] });
  }, [queryClient]);

  const onShowPress = useCallback(
    (item) => {
      const id = item?._id ? String(item._id) : "";
      if (!id) return;
      if (item._kind === "event") {
        navigation.navigate("EventDetail", { id });
      } else if (item._kind === "exhibition") {
        navigation.navigate("ExhibitionDetail", { id });
      }
    },
    [navigation],
  );

  const onArtworkPress = useCallback(
    (artwork) => {
      navigation.navigate("ArtworkDetail", { artwork });
    },
    [navigation],
  );

  const onSettingsPress = useCallback(() => {
    navigation.navigate("Settings");
  }, [navigation]);

  const isEmpty =
    artworks.length === 0 &&
    shows.length === 0 &&
    !artworksQ.isLoading &&
    !eventsQ.isLoading &&
    !exhibitionsQ.isLoading &&
    !tracksQ.isLoading;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Navy header band ──────────────────────────────────────────── */}
      <View
        style={[
          styles.headerBand,
          {
            paddingTop: insets.top + 8,
            paddingBottom: 16,
          },
        ]}
      >
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle} numberOfLines={1}>
          Staff Arts
        </Text>
        <Pressable
          onPress={onSettingsPress}
          style={({ pressed }) => [
            styles.avatarBtn,
            pressed && { opacity: 0.6 },
          ]}
          hitSlop={8}
          accessibilityLabel={t("homeOpenSettings") || "Open settings"}
        >
          <Text style={styles.avatarText}>{initialOf(user)}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing && !isLoading}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* ── Greeting (in body, below the band) ────────────────────── */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingMuted}>{t(greetingKey())},</Text>
          <Text style={styles.greetingName} numberOfLines={1}>
            {firstNameOf(user, t("homeGreetingFallback"))}
          </Text>
        </View>

        {shows.length > 0 && (
          <>
            <SectionHeader label={t("homeShowsAndMusic")} styles={styles} />
            <View style={styles.showsWrap}>
              {shows.map((item) => (
                <ShowRow
                  key={`${item._kind}-${item._id ?? item._date.getTime()}`}
                  item={item}
                  lang={lang}
                  t={t}
                  styles={styles}
                  onPress={() => onShowPress(item)}
                />
              ))}
            </View>
          </>
        )}

        {artworks.length > 0 && (
          <>
            <SectionHeader label={t("homeJustAdded")} styles={styles} />
            <ArtworkGrid
              artworks={artworks}
              screenWidth={screenWidth}
              spacing={spacing}
              styles={styles}
              onPress={onArtworkPress}
            />
          </>
        )}

        {isEmpty && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🎨</Text>
            <Text style={styles.emptyTitle}>{t("homeEmptyTitle")}</Text>
            <Text style={styles.emptyBody}>{t("homeEmptyBody")}</Text>
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

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({ label, styles }) {
  return (
    <View style={styles.sectionHeaderWrap}>
      <Text style={styles.sectionHeaderText}>{label}</Text>
      <View style={styles.sectionHeaderRule} />
    </View>
  );
}

function ShowRow({ item, lang, t, styles, onPress }) {
  const palette = useMemo(() => {
    if (item._kind === "exhibition")
      return { color: "#60a5fa", bg: "#1e2d4a", icon: "🏛" };
    if (item._kind === "music")
      return { color: "#c084fc", bg: "#2d1b4e", icon: "♪" };
    return { color: "#2dd4a0", bg: "#0d3b2e", icon: "◆" };
  }, [item._kind]);

  const dateStr = item._kind === "music" ? "" : formatMonthDay(item._date, lang);
  const title = String(item.title ?? "");
  const location = String(item.location ?? "");
  const badge = String(item._badge ?? "");
  const isFree = item.isFree === true;
  const hasImage = !!item._imageUrl;

  const details = [badge, dateStr, location].filter(Boolean).join("  ·  ");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.showRow, pressed && { opacity: 0.6 }]}
    >
      {hasImage ? (
        <Image
          source={{ uri: item._imageUrl }}
          style={styles.showThumb}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.showThumb, { backgroundColor: palette.bg }]}>
          <Text style={[styles.showThumbIcon, { color: palette.color }]}>
            {palette.icon}
          </Text>
        </View>
      )}

      <View style={styles.showBody}>
        <Text style={styles.showTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.showMeta}>
          <View style={[styles.showDot, { backgroundColor: palette.color }]} />
          <Text style={styles.showDetails} numberOfLines={1}>
            {details}
          </Text>
        </View>
      </View>

      {isFree && (
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>{t("homeFreeBadge")}</Text>
        </View>
      )}
      <Text style={styles.showChevron}>›</Text>
    </Pressable>
  );
}

function ArtworkGrid({ artworks, screenWidth, spacing, styles, onPress }) {
  const colGap = spacing.xs;
  const hPad = spacing.lg;
  const colWidth = (screenWidth - hPad * 2 - colGap * 2) / 3;

  return (
    <View style={[styles.gridWrap, { paddingHorizontal: hPad }]}>
      {artworks.map((artwork, i) => (
        <ArtworkCard
          key={artwork._id ?? i}
          artwork={artwork}
          width={colWidth}
          marginLeft={i % 3 === 0 ? 0 : colGap}
          styles={styles}
          onPress={() => onPress(artwork)}
        />
      ))}
    </View>
  );
}

function ArtworkCard({ artwork, width, marginLeft, styles, onPress }) {
  const imageUrl =
    coverImageUrl(artwork.coverImage) ||
    coverImageUrl(artwork.image) ||
    (Array.isArray(artwork.images) && artwork.images.length > 0
      ? coverImageUrl(artwork.images[0])
      : "");

  const title = String(artwork.title ?? "");
  const artistName = artwork.artist?.name ?? artwork.artistName ?? "";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { width, marginLeft, marginBottom: styles._spacing.md },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.artworkImageWrap, { width, height: width }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.artworkImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.artworkPlaceholder} />
        )}
      </View>
      <Text style={styles.artworkTitle} numberOfLines={1}>
        {title}
      </Text>
      {!!artistName && (
        <Text style={styles.artworkArtist} numberOfLines={1}>
          {artistName}
        </Text>
      )}
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

function makeStyles({ colors, spacing, radius, fontSize }) {
  return StyleSheet.create({
    _spacing: spacing,

    // Header
    headerBand: {
      backgroundColor: HEADER_BG,
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      color: HEADER_FG,
      fontSize: fontSize.lg,
      fontWeight: "500",
      letterSpacing: 0.4,
    },
    avatarBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: HEADER_FG,
      fontSize: fontSize.sm,
      fontWeight: "600",
    },

    // Body
    scrollContent: { paddingBottom: 100 },
    greetingWrap: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg + 4,
      paddingBottom: spacing.lg,
    },
    greetingMuted: { fontSize: fontSize.sm, color: colors.textMuted },
    greetingName: {
      fontSize: fontSize.xxl,
      fontWeight: "300",
      color: colors.text,
      marginTop: 2,
    },

    // Section header
    sectionHeaderWrap: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    sectionHeaderText: {
      fontSize: fontSize.xs,
      fontWeight: "700",
      color: colors.accent,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginRight: spacing.sm,
    },
    sectionHeaderRule: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderLight,
    },

    // Shows
    showsWrap: { paddingHorizontal: spacing.md },
    showRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    showThumb: {
      width: 48,
      height: 48,
      borderRadius: radius.sm,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    showThumbIcon: { fontSize: 18 },
    showBody: { flex: 1, marginLeft: spacing.md, minWidth: 0 },
    showTitle: { fontSize: fontSize.md, fontWeight: "500", color: colors.text },
    showMeta: { flexDirection: "row", alignItems: "center", marginTop: 3 },
    showDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    showDetails: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted },
    freeBadge: {
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: radius.full,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: spacing.xs,
    },
    freeBadgeText: { fontSize: 9, color: colors.accent, fontWeight: "600" },
    showChevron: {
      marginLeft: spacing.sm,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },

    // Artwork grid
    gridWrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" },
    artworkImageWrap: {
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
      overflow: "hidden",
    },
    artworkImage: { width: "100%", height: "100%" },
    artworkPlaceholder: { flex: 1, backgroundColor: colors.borderLight },
    artworkTitle: {
      marginTop: 6,
      fontSize: fontSize.xs,
      fontWeight: "500",
      color: colors.text,
    },
    artworkArtist: { fontSize: fontSize.xs, color: colors.textMuted },

    // States
    emptyWrap: { alignItems: "center", marginTop: 60, paddingHorizontal: spacing.lg },
    emptyEmoji: { fontSize: 48 },
    emptyTitle: {
      marginTop: spacing.md,
      fontSize: fontSize.lg,
      fontWeight: "500",
      color: colors.text,
    },
    emptyBody: {
      marginTop: spacing.xs,
      fontSize: fontSize.sm,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 18,
    },
    loadingWrap: { padding: 40, alignItems: "center" },
  });
}