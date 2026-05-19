// src/screens/artwork/ArtworkDetailScreen.js
import React from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useT } from "../../i18n";

export default function ArtworkDetailScreen({ route, navigation }) {
  const { colors, spacing, fontSize, radius } = useTheme();
  const { t } = useT();
  const artwork = route.params?.artwork ?? {};

  const imageUrl =
    (typeof artwork.coverImage === "object" && artwork.coverImage?.url) ||
    (typeof artwork.coverImage === "string" ? artwork.coverImage : "") ||
    (Array.isArray(artwork.images) && artwork.images[0]?.url) ||
    "";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <Pressable
        onPress={() => navigation.goBack()}
        style={{ padding: spacing.lg, paddingBottom: spacing.sm }}
      >
        <Text style={{ color: colors.accent, fontSize: fontSize.md }}>
          ‹ Back
        </Text>
      </Pressable>

      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: "100%",
            aspectRatio: 1,
            backgroundColor: colors.surface,
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            aspectRatio: 1,
            backgroundColor: colors.surface,
          }}
        />
      )}

      <View style={{ padding: spacing.lg }}>
        <Text
          style={{
            fontSize: fontSize.xl,
            fontWeight: "600",
            color: colors.text,
          }}
        >
          {artwork.title ?? "Untitled"}
        </Text>
        {!!(artwork.artist?.name || artwork.artistName) && (
          <Text
            style={{
              marginTop: 4,
              fontSize: fontSize.md,
              color: colors.textMuted,
            }}
          >
            {artwork.artist?.name ?? artwork.artistName}
          </Text>
        )}
        {!!artwork.description && (
          <Text
            style={{
              marginTop: spacing.md,
              fontSize: fontSize.sm,
              color: colors.text,
              lineHeight: 20,
            }}
          >
            {artwork.description}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
