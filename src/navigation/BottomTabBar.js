// src/navigation/BottomTabBar.js
//
// Custom bottom tab bar for Staff Arts 2.
// Layout: [Tab1] [Tab2] [ FAB ] [Tab3] [Tab4]
//
// The 4th tab (Profile) changes its LABEL + ICON based on auth:
//   - Logged OUT → "About" + info icon
//   - Logged IN  → "Profile" + user icon
// In both cases it navigates to the Profile tab route — the ProfileScreen
// itself renders About-content when logged out, so the tab bar stays visible.
//
// The FAB ("+") opens the create-artwork wizard when logged in, or the
// AuthGate modal when logged out.

import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Compass, Calendar, User, Info, Plus } from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";
import { useT } from "../i18n";
import { useAuthStore } from "../stores/authStore";

const NAVY = "#2D4A6E";

const TAB_ITEMS = [
  { key: "Home",    Icon: Home,     side: "left"  },
  { key: "Explore", Icon: Compass,  side: "left"  },
  { key: "Shows",   Icon: Calendar, side: "right" },
  { key: "Profile", Icon: User,     side: "right" },
];

export default function BottomTabBar({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;

  const labelFor = (key) => {
    switch (key) {
      case "Home": return t("tabHome") ?? "Home";
      case "Explore": return t("tabExplore") ?? "Explore";
      case "Shows": return t("tabShows") ?? "Shows";
      case "Profile":
        return isLoggedIn
          ? (t("tabProfile") ?? "Profile")
          : (t("aboutAppTab") ?? "About");
      default: return key;
    }
  };

  const renderTab = (item) => {
    const route = state.routes.find((r) => r.name === item.key);
    if (!route) return <View key={item.key} style={styles.tabSlot} />;

    const isProfileTab = item.key === "Profile";
    const showAboutLook = isProfileTab && !isLoggedIn;

    const isFocused = state.routes[state.index]?.name === item.key;
    const { options } = descriptors[route.key];

    // Icon swaps to info when logged out on the Profile tab.
    const Icon = showAboutLook ? Info : item.Icon;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const tint = isFocused ? NAVY : colors.textMuted;

    return (
      <Pressable
        key={item.key}
        onPress={onPress}
        style={({ pressed }) => [styles.tabSlot, pressed && { opacity: 0.6 }]}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
      >
        <Icon size={22} color={tint} strokeWidth={isFocused ? 2.2 : 1.8} />
        <Text
          style={[
            styles.tabLabel,
            { color: tint, fontWeight: isFocused ? "600" : "500" },
          ]}
          numberOfLines={1}
        >
          {labelFor(item.key)}
        </Text>
      </Pressable>
    );
  };

  const leftTabs = TAB_ITEMS.filter((t) => t.side === "left");
  const rightTabs = TAB_ITEMS.filter((t) => t.side === "right");

  const onFabPress = () => {
    if (isLoggedIn) navigation.navigate("NewArtwork");
    else navigation.navigate("AuthGate");
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: insets.bottom,
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
        },
      ]}
    >
      <View style={styles.row}>
        {leftTabs.map(renderTab)}
        <View style={styles.fabSpacer} />
        {rightTabs.map(renderTab)}
      </View>

      <Pressable
        onPress={onFabPress}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 18, backgroundColor: NAVY },
          pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel="New artwork"
      >
        <Plus size={28} color="#fff" strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

const FAB_SIZE = 60;

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  row: { flexDirection: "row", alignItems: "stretch", height: 58 },
  tabSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    paddingBottom: 4,
  },
  fabSpacer: { width: FAB_SIZE + 16 },
  tabLabel: { marginTop: 3, fontSize: 10, letterSpacing: 0.3 },
  fab: {
    position: "absolute",
    alignSelf: "center",
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: { elevation: 12 },
    }),
  },
});