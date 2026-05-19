// src/screens/shows/ExhibitionDetailScreen.js
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function ExhibitionDetailScreen({ route, navigation }) {
  const { colors, spacing, fontSize } = useTheme();
  const id = route.params?.id ?? "—";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: spacing.lg }}>
        <Text style={{ color: colors.accent, fontSize: fontSize.md }}>‹ Back</Text>
      </Pressable>
      <Text style={{ fontSize: fontSize.xl, color: colors.text, fontWeight: "600" }}>
        Exhibition
      </Text>
      <Text style={{ marginTop: 4, color: colors.textMuted, fontSize: fontSize.sm }}>
        ID: {id}
      </Text>
      <Text style={{ marginTop: spacing.lg, color: colors.textMuted, fontSize: fontSize.sm }}>
        Detail screen not yet implemented.
      </Text>
    </View>
  );
}