import { Colors } from "@/shared/constants";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Easing,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Destination {
  id: string;
  name: string;
  thumbnail: string;
  order: number;
}

export default function ItinerarySuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Safely parse destinations
  const destinations: Destination[] = React.useMemo(() => {
    try {
      if (params.destinations && typeof params.destinations === 'string') {
        return JSON.parse(params.destinations);
      }
      return [];
    } catch (error) {
      console.error('Failed to parse destinations:', error);
      return [];
    }
  }, [params.destinations]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  
  const [countdown, setCountdown] = useState(10);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Scale animation for check icon
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Defer navigation to avoid setState during render
          setTimeout(() => {
            router.replace("/(tabs)/itinerary");
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, scaleAnim, fadeAnim]);

  const handleViewItinerary = () => {
    router.replace("/(tabs)/itinerary");
  };

  const handleGoHome = () => {
    router.replace("/(tabs)/itinerary");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: "#4CAF50",
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Tạo lịch trình thành công! 🎉
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Lịch trình của bạn tại chi tiết đang chờ bạn{"\n"}cùng bạn bè trải nghiệm!
          </Text>
        </Animated.View>

        {/* Itinerary Preview Card */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardBadge}>
              <Ionicons name="calendar" size={14} color="#007AFF" />
              <Text style={styles.cardBadgeText}>Chuyến đi #4</Text>
            </View>
          </View>

          <View style={styles.cardRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.cardText, { color: colors.text }]}>
              25/1/2025 • 18:06
            </Text>
          </View>

          <View style={styles.cardRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.cardText, { color: colors.text }]}>
              Điểm đến
            </Text>
          </View>
          <Text style={[styles.cardDestinations, { color: colors.textSecondary }]}>
            {destinations.length} địa điểm đã chọn
          </Text>

          <View style={styles.cardRow}>
            <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.cardText, { color: colors.text }]}>
              Sở thích
            </Text>
          </View>
          <Text style={[styles.cardDestinations, { color: colors.textSecondary }]}>
            Vì lí hơn em
          </Text>

          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            Các điểm đến trong lịch trình
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewImagesScroll}>
            <View style={styles.previewImages}>
              {destinations.slice(0, 5).map((dest) => (
                <Image
                  key={dest.id}
                  source={{ uri: dest.thumbnail }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          </ScrollView>
          <Text style={[styles.previewPlaceName, { color: colors.text }]}>
            {destinations.map(d => d.name).slice(0, 3).join(", ")}{destinations.length > 3 ? "..." : ""}
          </Text>
        </Animated.View>

        {/* Action Button */}
        <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
          <Pressable
            style={[styles.button, { backgroundColor: "#007AFF" }]}
            onPress={handleViewItinerary}
          >
            <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Xem lịch trình chi tiết</Text>
          </Pressable>
        </Animated.View>

        {/* Auto redirect info */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Pressable onPress={handleGoHome}>
            <Text style={[styles.autoRedirect, { color: colors.textSecondary }]}>
              Tự động về trang chủ sau {countdown}s
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  cardBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardDestinations: {
    fontSize: 14,
    marginLeft: 24,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 12,
  },
  previewImagesScroll: {
    marginBottom: 8,
  },
  previewImages: {
    flexDirection: "row",
    gap: 8,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  previewPlaceName: {
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  autoRedirect: {
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
  },
});
