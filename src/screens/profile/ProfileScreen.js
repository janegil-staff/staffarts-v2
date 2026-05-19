// src/screens/profile/ProfileScreen.js
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Settings } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useAuthStore } from "../../stores/authStore";

const HEADER_BG = "#2D4A6E";

export default function ProfileScreen() {
  const { colors, spacing, fontSize, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.headerBand,
          { paddingTop: insets.top + 8, paddingBottom: 16 },
        ]}
      >
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable
          onPress={() => navigation.navigate("Settings")}
          hitSlop={8}
          style={({ pressed }) => [
            styles.settingsBtn,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Settings size={20} color="#fff" strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.text }]}>
            {user?.name?.trim().charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text
          style={[styles.name, { color: colors.text, fontSize: fontSize.xl }]}
        >
          {user?.name || "Your name"}
        </Text>
        {user?.email && (
          <Text
            style={[
              styles.email,
              { color: colors.textMuted, fontSize: fontSize.sm },
            ]}
          >
            {user.email}
          </Text>
        )}
        <Text
          style={[
            styles.placeholderSub,
            { color: colors.textMuted, fontSize: fontSize.sm },
          ]}
        >
          Profile details coming soon.
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
  settingsBtn: {
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
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "300",
  },
  name: {
    fontWeight: "300",
  },
  email: {
    marginTop: 4,
  },
  placeholderSub: {
    marginTop: 24,
    textAlign: "center",
  },
});
