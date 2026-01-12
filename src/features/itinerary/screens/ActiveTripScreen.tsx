import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
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
  time?: string;
  isCheckedIn?: boolean;
  isSkipped?: boolean;
}

interface TripData {
  id: string;
  tripName: string;
  startDate: string;
  startTime: string;
  destinations: Destination[];
}

export function ActiveTripScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [showEndTripModal, setShowEndTripModal] = useState(false);

  useEffect(() => {
    loadTripData();
  }, [params.tripId]);

  const loadTripData = async () => {
    try {
      const tripsJson = await AsyncStorage.getItem('@trips');
      if (tripsJson) {
        const trips = JSON.parse(tripsJson);
        const trip = trips.find((t: any) => t.id === params.tripId);
        if (trip) {
          setTripData({
            ...trip,
            destinations: trip.destinations.map((d: any) => ({
              ...d,
              rating: d.rating,
              reviewCount: d.reviewCount,
              time: d.time,
              isCheckedIn: d.isCheckedIn || false,
              isSkipped: d.isSkipped || false,
            })),
          });
        }
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
    }
  };

  const handleSkip = async (destinationId: string) => {
    if (!tripData) return;

    const updatedDestinations = tripData.destinations.map(d => 
      d.id === destinationId ? { ...d, isSkipped: true } : d
    );

    setTripData({
      ...tripData,
      destinations: updatedDestinations,
    });

    // Update AsyncStorage
    try {
      const tripsJson = await AsyncStorage.getItem('@trips');
      if (tripsJson) {
        const trips = JSON.parse(tripsJson);
        const updatedTrips = trips.map((t: any) => 
          t.id === tripData.id ? { ...t, destinations: updatedDestinations } : t
        );
        await AsyncStorage.setItem('@trips', JSON.stringify(updatedTrips));
      }
    } catch (error) {
      console.error('Failed to update skip:', error);
    }
  };

  const handleCheckIn = async (destinationId: string) => {
    if (!tripData) return;

    const updatedDestinations = tripData.destinations.map(d => 
      d.id === destinationId ? { ...d, isCheckedIn: true } : d
    );

    setTripData({
      ...tripData,
      destinations: updatedDestinations,
    });

    // Update AsyncStorage
    try {
      const tripsJson = await AsyncStorage.getItem('@trips');
      if (tripsJson) {
        const trips = JSON.parse(tripsJson);
        const updatedTrips = trips.map((t: any) => 
          t.id === tripData.id ? { ...t, destinations: updatedDestinations } : t
        );
        await AsyncStorage.setItem('@trips', JSON.stringify(updatedTrips));
      }
    } catch (error) {
      console.error('Failed to update check-in:', error);
    }
  };

  const handleEndTrip = () => {
    const uncheckedCount = tripData?.destinations.filter(d => !d.isCheckedIn && !d.isSkipped).length || 0;
    if (uncheckedCount > 0) {
      setShowEndTripModal(true);
    } else {
      confirmEndTrip();
    }
  };

  const confirmEndTrip = async () => {
    if (!tripData) return;

    try {
      const tripsJson = await AsyncStorage.getItem('@trips');
      if (tripsJson) {
        const trips = JSON.parse(tripsJson);
        const updatedTrips = trips.map((t: any) => 
          t.id === tripData.id ? { ...t, status: 'past' } : t
        );
        await AsyncStorage.setItem('@trips', JSON.stringify(updatedTrips));
      }
      router.replace("/(tabs)/itinerary");
    } catch (error) {
      console.error('Failed to end trip:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!tripData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 50 }}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  const uncheckedCount = tripData.destinations.filter(d => !d.isCheckedIn && !d.isSkipped).length;
  const totalDestinations = tripData.destinations.length;
  const allCompleted = uncheckedCount === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.icon} />
        </Pressable>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Lịch trình của tôi</Text>
        </View>

        <Pressable style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={22} color={colors.icon} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Header Card */}
        <View style={[styles.tripHeaderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.tripHeaderTop}>
            <Text style={[styles.tripTitle, { color: colors.text }]}>{tripData.tripName}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Đang diễn ra</Text>
            </View>
          </View>
          
          <Text style={[styles.tripDate, { color: colors.textSecondary }]}>
            {formatDate(tripData.startDate)} • {totalDestinations} điểm dừng
          </Text>
        </View>

        {/* Destinations Timeline */}
        <View style={styles.timelineContainer}>
          {tripData.destinations.map((dest, index) => {
            const isFirst = index === 0;
            const isLast = index === tripData.destinations.length - 1;
            const isCheckedIn = dest.isCheckedIn;
            const isSkipped = dest.isSkipped;
            const isCurrent = !isCheckedIn && !isSkipped && tripData.destinations.slice(0, index).every(d => d.isCheckedIn || d.isSkipped);

            return (
              <View key={dest.id} style={styles.timelineItem}>
                {/* Timeline Line & Circle */}
                <View style={styles.timelineLeft}>
                  {!isFirst && (
                    <View style={[styles.timelineLine, styles.timelineLineTop, { 
                      backgroundColor: (isCheckedIn || isSkipped) ? (isCheckedIn ? '#4CAF50' : '#9E9E9E') : colors.border 
                    }]} />
                  )}
                  <View style={[
                    styles.timelineCircle,
                    { 
                      backgroundColor: isCheckedIn ? '#4CAF50' : dest.isSkipped ? '#9E9E9E' : isCurrent ? '#FF9800' : colors.border,
                      borderColor: isCheckedIn ? '#4CAF50' : dest.isSkipped ? '#9E9E9E' : isCurrent ? '#FF9800' : colors.border,
                    }
                  ]}>
                    {isCheckedIn && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    {dest.isSkipped && <Ionicons name="close" size={16} color="#FFFFFF" />}
                  </View>
                  {!isLast && (
                    <View style={[styles.timelineLine, styles.timelineLineBottom, { 
                      backgroundColor: (isCheckedIn || isSkipped) ? (isCheckedIn ? '#4CAF50' : '#9E9E9E') : colors.border 
                    }]} />
                  )}
                </View>

                {/* Destination Card */}
                <View style={[
                  styles.destinationCard, 
                  { 
                    backgroundColor: colors.card, 
                    borderColor: isCurrent ? '#FF9800' : colors.border,
                    borderWidth: isCurrent ? 2 : 1,
                  }
                ]}>
                  <View style={styles.destinationHeader}>
                    <Text style={[styles.destinationTime, { color: colors.text }]}>{dest.time || `${8 + index}:00`}</Text>
                    <Text style={[styles.destinationName, { color: colors.text }]}>{dest.name}</Text>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Điểm kế tiếp</Text>
                      </View>
                    )}
                    {!isCheckedIn && !dest.isSkipped && (
                      <Pressable 
                        onPress={() => handleSkip(dest.id)}
                        style={styles.skipButton}
                      >
                        <Ionicons name="close" size={20} color="#FF9800" />
                      </Pressable>
                    )}
                  </View>

                  <View style={styles.destinationContent}>
                    <Image source={{ uri: dest.thumbnail }} style={styles.destinationImage} />
                    
                    <View style={styles.destinationInfo}>
                      <View style={styles.statusRow}>
                        {isCheckedIn ? (
                          <>
                            <View style={styles.statusTag}>
                              <Text style={[styles.statusTagText, { color: '#4CAF50' }]}>Cả phê</Text>
                            </View>
                            <View style={[styles.statusTag, { backgroundColor: '#FFEBEE' }]}>
                              <Text style={[styles.statusTagText, { color: '#F44336' }]}>Rẻ chục</Text>
                            </View>
                          </>
                        ) : isCurrent ? (
                          <>
                            <View style={[styles.statusTag, { backgroundColor: '#FFF3E0' }]}>
                              <Text style={[styles.statusTagText, { color: '#FF9800' }]}>Tên lớn</Text>
                            </View>
                          </>
                        ) : (
                          <>
                            <View style={[styles.statusTag, { backgroundColor: '#FFEBEE' }]}>
                              <Text style={[styles.statusTagText, { color: '#F44336' }]}>Ăn uống</Text>
                            </View>
                            <View style={[styles.statusTag, { backgroundColor: '#FFEBEE' }]}>
                              <Text style={[styles.statusTagText, { color: '#F44336' }]}>Nhà hàng</Text>
                            </View>
                          </>
                        )}
                      </View>

                      <View style={styles.ratingRow}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.ratingText, { color: colors.text }]}>
                          Xuất phát: {dest.time}
                        </Text>
                        <Ionicons name="star" size={14} color="#FFB800" style={{ marginLeft: 8 }} />
                        <Text style={[styles.ratingText, { color: colors.text }]}>
                          {dest.rating || 4.6}
                        </Text>
                      </View>

                      {isCurrent && (
                        <View style={styles.actionButtons}>
                          <Pressable 
                            style={[styles.actionButton, { backgroundColor: colors.info }]}
                            onPress={() => {/* Navigate to map */}}
                          >
                            <Ionicons name="navigate" size={16} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Chỉ đường</Text>
                          </Pressable>

                          <Pressable 
                            style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
                            onPress={() => handleCheckIn(dest.id)}
                          >
                            <Ionicons name="checkmark-circle-outline" size={16} color={colors.text} />
                            <Text style={[styles.actionButtonText, { color: colors.text }]}>Check-in</Text>
                          </Pressable>
                        </View>
                      )}

                      {isCheckedIn && (
                        <View style={styles.checkedInRow}>
                          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                          <Text style={[styles.checkedInText, { color: '#4CAF50' }]}>Đã check-in</Text>
                        </View>
                      )}
                      
                      {dest.isSkipped && (
                        <View style={styles.checkedInRow}>
                          <Ionicons name="close-circle" size={16} color="#9E9E9E" />
                          <Text style={[styles.checkedInText, { color: '#9E9E9E' }]}>Đã bỏ qua</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable 
          style={[styles.endButton, { backgroundColor: allCompleted ? '#4CAF50' : '#F44336' }]}
          onPress={handleEndTrip}
        >
          <Text style={styles.endButtonText}>{allCompleted ? 'Hoàn thành & Đóng' : 'Kết thúc chuyến đi'}</Text>
        </Pressable>
      </View>

      {/* End Trip Confirmation Modal */}
      <Modal
        visible={showEndTripModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndTripModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowEndTripModal(false)}
        >
          <Pressable 
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Xác nhận kết thúc chuyến đi
              </Text>
              <Pressable onPress={() => setShowEndTripModal(false)}>
                <Ionicons name="close" size={24} color={colors.icon} />
              </Pressable>
            </View>

            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Vẫn còn {uncheckedCount} điểm chưa ghé. Bạn có chắc muốn kết thúc chuyến đi?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setShowEndTripModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Tiếp tục chuyến đi</Text>
              </Pressable>

              <Pressable 
                style={[styles.modalButton, { backgroundColor: '#F44336' }]}
                onPress={() => {
                  setShowEndTripModal(false);
                  confirmEndTrip();
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Kết thúc</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  tripHeaderCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tripHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "600",
  },
  tripDate: {
    fontSize: 14,
  },
  timelineContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timelineLeft: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
  },
  timelineLine: {
    width: 2,
    flex: 1,
  },
  timelineLineTop: {
    marginBottom: -2,
  },
  timelineLineBottom: {
    marginTop: -2,
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  destinationCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  destinationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  destinationTime: {
    fontSize: 15,
    fontWeight: "600",
  },
  destinationName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  currentBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: "#FF9800",
    fontSize: 11,
    fontWeight: "600",
  },
  skipButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  destinationContent: {
    flexDirection: "row",
    gap: 12,
  },
  destinationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  destinationInfo: {
    flex: 1,
    gap: 8,
  },
  statusRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  statusTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  checkedInRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  checkedInText: {
    fontSize: 13,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  endButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  endButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
