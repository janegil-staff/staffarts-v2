// src/components/ArtworkGrid.js
//
// 3-column responsive grid of ArtworkCards. Column width is computed from
// the screen width passed in by the parent.

import { useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import ArtworkCard from "./ArtworkCard";

const COLUMNS = 3;

export default function ArtworkGrid({ artworks, onPress }) {
  const { spacing } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const colWidth = useMemo(() => {
    const colGap = spacing.xs;
    const hPad = spacing.lg;
    return (screenWidth - hPad * 2 - colGap * (COLUMNS - 1)) / COLUMNS;
  }, [screenWidth, spacing.xs, spacing.lg]);

  return (
    <View style={[styles.wrap, { paddingHorizontal: spacing.lg }]}>
      {artworks.map((artwork, i) => (
        <ArtworkCard
          key={artwork._id ?? i}
          artwork={artwork}
          width={colWidth}
          marginLeft={i % COLUMNS === 0 ? 0 : spacing.xs}
          onPress={() => onPress(artwork)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
});
