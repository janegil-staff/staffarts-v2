// src/screens/explore/ExploreScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";

const HEADER_BG = "#2D4A6E";

export default function ExploreScreen() {
  const { colors, spacing, fontSize } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.headerBand,
          { paddingTop: insets.top + 8, paddingBottom: 16 },
        ]}
      >
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.placeholderTitle, { color: colors.text, fontSize: fontSize.lg }]}>
          Discover artists and artworks
        </Text>
        <Text style={[styles.placeholderSub, { color: colors.textMuted, fontSize: fontSize.sm }]}>
          Coming soon.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBand: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0.4,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  placeholderTitle: {
    fontWeight: "300",
    textAlign: "center",
  },
  placeholderSub: {
    marginTop: 8,
    textAlign: "center",
  },
});
