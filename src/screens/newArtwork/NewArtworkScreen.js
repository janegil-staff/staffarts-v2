// src/screens/newArtwork/NewArtworkScreen.js
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { X } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";

const HEADER_BG = "#2D4A6E";

export default function NewArtworkScreen() {
  const { colors, spacing, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.headerBand,
          { paddingTop: insets.top + 8, paddingBottom: 16 },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={({ pressed }) => [
            styles.closeBtn,
            pressed && { opacity: 0.6 },
          ]}
        >
          <X size={22} color="#fff" strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>New Artwork</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.placeholderTitle, { color: colors.text, fontSize: fontSize.lg }]}>
          Add a new artwork
        </Text>
        <Text style={[styles.placeholderSub, { color: colors.textMuted, fontSize: fontSize.sm }]}>
          Form coming soon — title, medium, dimensions, images, price.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBand: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
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
    maxWidth: 280,
  },
});
