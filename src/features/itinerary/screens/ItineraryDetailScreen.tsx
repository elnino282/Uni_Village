import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, useColorScheme } from "@/shared";

interface Destination {
  id: string;
  name: string;
  thumbnail: string;
  order: number;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  departureTime?: string;
}

export function ItineraryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const tripData = useMemo(() => {
    try {
      return {
        tripName: params.tripName as string || "Chuyến đi #4",
        startDate: params.startDate ? new Date(params.startDate as string) : new Date(),
        startTime: params.startTime ? new Date(params.startTime as string) : new Date(),
        destinations: params.destinations 
          ? JSON.parse(params.destinations as string) as Destination[]
          : [],
      };
    } catch (error) {
      console.error('Failed to parse trip data:', error);
      return {
        tripName: "Chuyến đi #4",
        startDate: new Date(),
        startTime: new Date(),
        destinations: [],
      };
    }
  }, [params]);

  const formatDate = (date: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      {/* Header with blue background */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: "#007AFF" }]}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          
          <View style={styles.headerCenter}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SẮP TỚI</Text>
            </View>
            <Text style={styles.headerTitle}>{tripData.tripName}</Text>
          </View>

          <View style={styles.backButton} />
        </View>

        {/* Date and Time */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeItem}>
            <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
            <Text style={styles.dateTimeText}>{formatDate(tripData.startDate)}</Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Ionicons name="time-outline" size={16} color="#FFFFFF" />
            <Text style={styles.dateTimeText}>{formatTime(tripData.startTime)}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Starting Point */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="navigate" size={20} color="#4CAF50" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Điểm xuất phát</Text>
          </View>
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>Vị trí hiện tại</Text>
        </View>

        {/* Destinations */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
            Điểm đến ({tripData.destinations.length})
          </Text>

          {tripData.destinations.map((dest, index) => (
            <Pressable
              key={dest.id}
              style={[styles.destinationCard, { borderBottomColor: colors.border }]}
            >
              <View style={styles.destinationNumber}>
                <Text style={styles.destinationNumberText}>{dest.order}</Text>
              </View>

              <Image
                source={{ uri: dest.thumbnail }}
                style={styles.destinationImage}
                resizeMode="cover"
              />

              <View style={styles.destinationInfo}>
                <Text style={[styles.destinationName, { color: colors.text }]} numberOfLines={1}>
                  {dest.name}
                </Text>

                <View style={styles.destinationMeta}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={[styles.ratingText, { color: colors.text }]}>
                      {dest.rating || 4.5}
                    </Text>
                    <Text style={[styles.reviewText, { color: colors.textSecondary }]}>
                      ({dest.reviewCount || 234})
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      Cách {dest.distance || 1.2} km
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      Xuất phát: {dest.departureTime || "18:08"}
                    </Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </Pressable>
          ))}
        </View>

        {/* Actions Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Thao tác</Text>
          
          <Pressable style={styles.actionRow}>
            <Ionicons name="share-social-outline" size={20} color={colors.icon} />
            <Text style={[styles.actionText, { color: colors.text }]}>Chia sẻ lịch trình</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable style={styles.startButton}>
          <Ionicons name="play-circle" size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Bắt đầu chuyến đi</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 16,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateTimeText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  locationText: {
    fontSize: 14,
    marginLeft: 28,
  },
  destinationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  destinationNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  destinationNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  destinationImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  destinationInfo: {
    flex: 1,
    gap: 4,
  },
  destinationName: {
    fontSize: 15,
    fontWeight: "600",
  },
  destinationMeta: {
    gap: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  reviewText: {
    fontSize: 13,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
