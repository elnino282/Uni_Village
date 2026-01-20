import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BorderRadius, Colors, Shadows, Spacing } from "@/shared/constants";
import { useColorScheme } from "@/shared/hooks";

interface Destination {
  id: string;
  name: string;
  thumbnail: string;
  order: number;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  departureTime?: string;
  time?: string;
}

interface TripData {
  tripName: string;
  startDate: Date;
  startTime: Date;
  destinations: Destination[];
}

export function ItineraryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [tripData, setTripData] = useState<TripData>({
    tripName: "Chuyến đi #4",
    startDate: new Date(),
    startTime: new Date(),
    destinations: [],
  });

  // Load trip data from AsyncStorage when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadTripData();
    }, [params.tripId])
  );

  const loadTripData = async () => {
    try {
      const tripId = params.tripId as string;
      
      if (tripId) {
        // Load from AsyncStorage
        const tripsJson = await AsyncStorage.getItem('@trips');
        if (tripsJson) {
          const trips = JSON.parse(tripsJson);
          const trip = trips.find((t: any) => t.id === tripId);
          
          if (trip) {
            setTripData({
              tripName: trip.tripName,
              startDate: new Date(trip.startDate),
              startTime: new Date(trip.startTime),
              destinations: trip.destinations || [],
            });
            return;
          }
        }
      }
      
      // Fallback to params if not found in AsyncStorage
      setTripData({
        tripName: params.tripName as string || "Chuyến đi #4",
        startDate: params.startDate ? new Date(params.startDate as string) : new Date(),
        startTime: params.startTime ? new Date(params.startTime as string) : new Date(),
        destinations: params.destinations 
          ? JSON.parse(params.destinations as string) as Destination[]
          : [],
      });
    } catch (error) {
      console.error('Failed to load trip data:', error);
    }
  };

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

  const handleStartTrip = async () => {
    try {
      // Get tripId from params
      const tripId = params.tripId as string;
      
      if (!tripId) {
        console.error('No tripId provided');
        return;
      }

      // Update trip status to 'ongoing' in AsyncStorage
      const tripsJson = await AsyncStorage.getItem('@trips');
      if (tripsJson) {
        const trips = JSON.parse(tripsJson);
        const updatedTrips = trips.map((t: any) => 
          t.id === tripId ? { ...t, status: 'ongoing' } : t
        );
        await AsyncStorage.setItem('@trips', JSON.stringify(updatedTrips));
      }

      // Navigate to active trip screen
      router.push({
        pathname: "/(modals)/active-trip" as any,
        params: { tripId }
      });
    } catch (error) {
      console.error('Failed to start trip:', error);
    }
  };

  const handleShare = async () => {
    try {
      const destinationsList = tripData.destinations
        .map((d, i) => `${i + 1}. ${d.name}`)
        .join('\n');
      
      const message = `🎉 Lịch trình: ${tripData.tripName}\n\n` +
        `📅 Ngày: ${formatDate(tripData.startDate)}\n` +
        `⏰ Giờ: ${formatTime(tripData.startTime)}\n\n` +
        `📍 Điểm đến (${tripData.destinations.length}):\n${destinationsList}\n\n` +
        `Tạo bằng Uni Village App 🚀`;
      
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#3b82f6', '#2563eb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
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

          <Pressable onPress={handleShare} style={styles.backButton}>
            <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
          </Pressable>
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
      </LinearGradient>

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
                  {dest.rating && (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text style={[styles.ratingText, { color: colors.text }]}>
                        {dest.rating}
                      </Text>
                      {dest.reviewCount && (
                        <Text style={[styles.reviewText, { color: colors.textSecondary }]}>
                          ({dest.reviewCount})
                        </Text>
                      )}
                    </View>
                  )}

                  {dest.distance && (
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        Cách {dest.distance} km
                      </Text>
                    </View>
                  )}

                  {dest.departureTime && (
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        Xuất phát: {dest.departureTime}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </Pressable>
          ))}
        </View>

        {/* Actions Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Thao tác</Text>
          
          <Pressable 
            style={styles.actionRow}
            onPress={() => {
              router.push({
                pathname: "/(modals)/select-destinations" as any,
                params: {
                  tripId: params.tripId as string,
                  tripName: tripData.tripName,
                  startDate: tripData.startDate.toString(),
                  startTime: tripData.startTime.toString(),
                  existingDestinations: JSON.stringify(tripData.destinations),
                  isAddingToExisting: 'true',
                }
              });
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.info} />
            <Text style={[styles.actionText, { color: colors.text }]}>Thêm địa điểm mới</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Pressable style={styles.actionRow} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={colors.icon} />
            <Text style={[styles.actionText, { color: colors.text }]}>Chia sẻ lịch trình</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Button with gradient */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable style={styles.startButtonWrapper} onPress={handleStartTrip}>
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButton}
          >
            <Ionicons name="play-circle" size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Bắt đầu chuyến đi</Text>
          </LinearGradient>
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
    paddingBottom: Spacing.screenPadding,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md - 4,
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
    gap: Spacing.xs,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: Spacing.md - 4,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg - 4,
    paddingHorizontal: Spacing.screenPadding,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateTimeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.screenPadding,
    padding: Spacing.cardPadding,
    borderRadius: BorderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.card,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 28,
  },
  destinationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md - 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md - 4,
  },
  destinationNumber: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  destinationNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  destinationImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  destinationInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  destinationName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  destinationMeta: {
    gap: Spacing.xs,
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
    gap: Spacing.md - 4,
    paddingVertical: Spacing.sm,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.screenPadding,
    marginVertical: Spacing.sm,
  },
  bottomBar: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md - 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Shadows.sm,
  },
  startButtonWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.buttonPadding + 2,
    borderRadius: BorderRadius.lg,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
