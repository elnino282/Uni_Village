/**
 * ProfileFAB Component
 * Floating action button with avatar preview and plus badge overlay
 */

import { Colors, Shadows } from "@/shared/constants";
import { useColorScheme } from "@/shared/hooks";
import { getImageUrl } from "@/shared/utils/imageUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ms, s, vs } from "react-native-size-matters";

interface ProfileFABProps {
  onPress?: () => void;
  /** If true (default), uses absolute positioning. Set to false when using in flexbox layout. */
  absolute?: boolean;
  /** Avatar URL to display. If provided, shows the avatar image instead of person icon. */
  avatarUrl?: string | null;
  /** Display name for fallback initials when avatar URL is not available */
  displayName?: string;
}

const FAB_SIZE = s(56);
const BADGE_SIZE = s(20);

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return "#94a3b8";
  const colors = [
    "#f87171",
    "#fb923c",
    "#fbbf24",
    "#a3e635",
    "#4ade80",
    "#34d399",
    "#22d3d8",
    "#38bdf8",
    "#60a5fa",
    "#818cf8",
    "#a78bfa",
    "#c084fc",
    "#e879f9",
    "#f472b6",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function ProfileFAB({
  onPress,
  absolute = true,
  avatarUrl,
  displayName,
}: ProfileFABProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // In dark mode, tint is white, so we use background (dark) for the icon
  const iconColor = colorScheme === "dark" ? colors.background : "#fff";

  const absoluteUrl = getImageUrl(avatarUrl);

  // Render avatar content based on whether we have an avatar URL
  const renderAvatarContent = () => {
    if (absoluteUrl) {
      // Show actual avatar image
      return (
        <Image
          source={{ uri: absoluteUrl }}
          style={styles.avatarImage}
          contentFit="cover"
          transition={200}
        />
      );
    }

    if (displayName) {
      // Show initials fallback
      return (
        <View
          style={[
            styles.initialsContainer,
            { backgroundColor: getColorFromName(displayName) },
          ]}
        >
          <Text style={styles.initialsText}>{getInitials(displayName)}</Text>
        </View>
      );
    }

    // Default: show person icon
    return <MaterialIcons name="person" size={ms(28)} color={iconColor} />;
  };

  return (
    <View style={absolute ? styles.containerAbsolute : styles.containerInline}>
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor:
              absoluteUrl || displayName ? "transparent" : colors.tint,
          },
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        accessibilityLabel="Change avatar"
        accessibilityRole="button"
      >
        {renderAvatarContent()}
        {/* Plus badge overlay */}
        <View style={[styles.badge, { borderColor: colors.background }]}>
          <MaterialIcons name="add" size={ms(14)} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  containerAbsolute: {
    position: "absolute",
    right: s(16),
    top: vs(8),
    zIndex: 10,
  },
  containerInline: {
    // No positioning - uses parent flexbox layout
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: ms(FAB_SIZE / 2),
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.lg,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  badge: {
    position: "absolute",
    bottom: vs(2),
    right: s(2),
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: ms(BADGE_SIZE / 2),
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarImage: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
  },
  initialsContainer: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: ms(20),
  },
});
