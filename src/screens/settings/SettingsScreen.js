// src/screens/settings/SettingsScreen.js
import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useT } from "../../i18n";
import { useAuthStore } from "../../stores/authStore";

const HEADER_BG = "#2D4A6E";

export default function SettingsScreen() {
  const { colors, spacing, fontSize, radius, toggleTheme, isDark } = useTheme();
  const { t, lang, setLanguage, supported } = useT();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header band */}
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
            styles.backBtn,
            pressed && { opacity: 0.6 },
          ]}
        >
          <ChevronLeft size={22} color="#fff" strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t("settingsTitle") || "Settings"}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>
        {user && (
          <View
            style={{
              padding: spacing.md,
              borderRadius: radius.sm,
              backgroundColor: colors.surface,
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
              {t("settingsSignedInAs") || "Signed in as"}
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: fontSize.md,
                fontWeight: "500",
                marginTop: 2,
              }}
            >
              {user.name ?? user.email ?? "—"}
            </Text>
          </View>
        )}

        <Pressable
          onPress={toggleTheme}
          style={({ pressed }) => ({
            padding: spacing.md,
            borderRadius: radius.sm,
            backgroundColor: colors.surface,
            marginBottom: spacing.sm,
            opacity: pressed ? 0.7 : 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          })}
        >
          <Text style={{ color: colors.text, fontSize: fontSize.md }}>
            {t("settingsTheme") || "Theme"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
            {isDark
              ? t("settingsThemeDark") || "Dark"
              : t("settingsThemeLight") || "Light"}
          </Text>
        </Pressable>

        <View
          style={{
            padding: spacing.md,
            borderRadius: radius.sm,
            backgroundColor: colors.surface,
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: fontSize.md,
              marginBottom: spacing.sm,
            }}
          >
            {t("settingsLanguage") || "Language"}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {supported.map((code) => (
              <Pressable
                key={code}
                onPress={() => setLanguage(code)}
                style={({ pressed }) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: radius.full,
                  backgroundColor:
                    code === lang ? colors.accent : "transparent",
                  borderWidth: 1,
                  borderColor:
                    code === lang ? colors.accent : colors.borderLight,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: code === lang ? "#fff" : colors.text,
                    fontSize: fontSize.xs,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  {code}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {user && (
          <Pressable
            onPress={async () => {
              await signOut();
              navigation.goBack();
            }}
            style={({ pressed }) => ({
              padding: spacing.md,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: "#dc2626",
              marginTop: spacing.lg,
              opacity: pressed ? 0.7 : 1,
              alignItems: "center",
            })}
          >
            <Text
              style={{
                color: "#dc2626",
                fontSize: fontSize.md,
                fontWeight: "500",
              }}
            >
              {t("settingsSignOut") || "Sign out"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
});
