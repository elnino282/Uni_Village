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
  checkedInAt?: string;
}

interface TripData {
  id: string;
  tripName: string;
  startDate: string;
  startTime: string;
  destinations: Destination[];
  status: string;
}

export function CompletedTripScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadTripData();
    
    // Show success modal if coming from end trip
    if (params.showSuccess === 'true') {
      setShowSuccessModal(true);
    }
  }, [params.tripId, params.showSuccess]);

  const loadTripData = async () => {
    try {
      const tripsJson = await AsyncStorage.getItem('@trips');
      if (tripsJson) {
        const trips = JSON.parse(tripsJson);
        const trip = trips.find((t: any) => t.id === params.tripId);
        if (trip) {
          setTripData(trip);
        }
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
    }
  };

  const calculateDuration = () => {
    if (!tripData) return "0 giờ";
    
    const startTime = new Date(tripData.startTime);
    const checkedInDestinations = tripData.destinations.filter(d => d.isCheckedIn && d.checkedInAt);
    
    if (checkedInDestinations.length === 0) {
      return "0 giờ";
    }
    
    const lastCheckedIn = checkedInDestinations[checkedInDestinations.length - 1];
    const endTime = new Date(lastCheckedIn.checkedInAt!);
    
    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `~${hours} giờ ${minutes} phút`;
    }
    return `~${minutes} phút`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (!tripData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  const completedDestinations = tripData.destinations.filter(d => d.isCheckedIn).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.icon} />
        </Pressable>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Chuyến đi đã kết thúc</Text>
        </View>

        <Pressable style={styles.backButton} onPress={() => {}}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.icon} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={[styles.tripTitle, { color: colors.text }]}>{tripData.tripName}</Text>
              <Text style={[styles.tripSubtitle, { color: colors.textSecondary }]}>
                Chuyến đi đã hoàn thành
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.statusText, { color: '#4CAF50' }]}>Hoàn thành</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          {/* Trip Info */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="calendar-outline" size={20} color="#2196F3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Khởi hành</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(tripData.startDate)} • {formatTime(tripData.startTime)}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="location-outline" size={20} color="#FF9800" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Điểm xuất phát</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>Vị trí hiện tại</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="navigate-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Kết thúc</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>Đi cà phê chill</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="time-outline" size={20} color="#9C27B0" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Thời lượng</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {calculateDuration()}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="flag-outline" size={20} color="#FF9800" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Số điểm đã ghé</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {completedDestinations} địa điểm
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={[styles.section, { marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hành trình chi tiết
          </Text>

          <View style={styles.timelineContainer}>
            {tripData.destinations.map((dest, index) => {
              const isLast = index === tripData.destinations.length - 1;
              const isCheckedIn = dest.isCheckedIn;
              const isSkipped = dest.isSkipped;

              return (
                <View key={dest.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    {!isLast && (
                      <View style={[styles.timelineLine, styles.timelineLineTop, { 
                        backgroundColor: (isCheckedIn || isSkipped) ? (isCheckedIn ? '#4CAF50' : '#9E9E9E') : colors.border 
                      }]} />
                    )}
                    <View style={[
                      styles.timelineCircle,
                      { 
                        backgroundColor: isCheckedIn ? '#4CAF50' : isSkipped ? '#9E9E9E' : colors.background,
                        borderColor: isCheckedIn ? '#4CAF50' : isSkipped ? '#9E9E9E' : colors.border,
                      },
                    ]}>
                      {isCheckedIn && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                      {isSkipped && <Ionicons name="close" size={16} color="#FFFFFF" />}
                    </View>
                    {!isLast && (
                      <View style={[styles.timelineLine, styles.timelineLineBottom, { 
                        backgroundColor: (isCheckedIn || isSkipped) ? (isCheckedIn ? '#4CAF50' : '#9E9E9E') : colors.border 
                      }]} />
                    )}
                  </View>

                  <View style={[styles.destinationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.destinationHeader}>
                      {dest.time && (
                        <Text style={[styles.destinationTime, { color: colors.textSecondary }]}>
                          {dest.time}
                        </Text>
                      )}
                      <Text style={[styles.destinationName, { color: colors.text }]}>
                        {dest.name}
                      </Text>
                    </View>

                    <View style={styles.destinationContent}>
                      <Image
                        source={{ uri: dest.thumbnail }}
                        style={styles.destinationImage}
                        resizeMode="cover"
                      />
                      <View style={styles.destinationInfo}>
                        {dest.rating && (
                          <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#FFB800" />
                            <Text style={[styles.ratingText, { color: colors.text }]}>
                              {dest.rating}
                            </Text>
                          </View>
                        )}
                        
                        {isCheckedIn && dest.checkedInAt && (
                          <View style={styles.checkedInRow}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <Text style={[styles.checkedInText, { color: '#4CAF50' }]}>
                              Check-in lúc {formatTime(dest.checkedInAt)}
                            </Text>
                          </View>
                        )}
                        
                        {isSkipped && (
                          <View style={styles.checkedInRow}>
                            <Ionicons name="close-circle" size={16} color="#9E9E9E" />
                            <Text style={[styles.checkedInText, { color: '#9E9E9E' }]}>
                              Đã bỏ qua
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable 
          style={[styles.actionButton, styles.reuseButton, { backgroundColor: colors.info }]}
          onPress={async () => {
            if (!tripData) return;
            
            try {
              // Create NEW trip from completed trip (don't modify the original)
              const now = new Date();
              const newTripId = Date.now().toString();
              
              const resetDestinations = tripData.destinations.map(d => ({
                id: d.id,
                name: d.name,
                thumbnail: d.thumbnail,
                order: d.order,
                rating: d.rating,
                reviewCount: d.reviewCount,
                time: d.time,
                lat: d.lat,
                lng: d.lng,
                // Reset check-in status
                isCheckedIn: false,
                isSkipped: false,
                checkedInAt: undefined,
              }));
              
              const newTrip = {
                id: newTripId,
                tripName: tripData.tripName + ' (Lặp lại)',
                status: 'upcoming',
                startDate: now.toISOString(),
                startTime: now.toISOString(),
                destinations: resetDestinations,
                createdAt: now.toISOString(),
              };
              
              // Add new trip to AsyncStorage (keep original completed trip)
              const tripsJson = await AsyncStorage.getItem('@trips');
              const trips = tripsJson ? JSON.parse(tripsJson) : [];
              trips.push(newTrip);
              await AsyncStorage.setItem('@trips', JSON.stringify(trips));
              
              // Navigate to trip detail for editing
              router.push({
                pathname: "/(modals)/itinerary-detail" as any,
                params: {
                  tripId: newTripId,
                  tripName: newTrip.tripName,
                  startDate: newTrip.startDate,
                  startTime: newTrip.startTime,
                  destinations: JSON.stringify(resetDestinations),
                }
              });
            } catch (error) {
              console.error('Failed to reuse trip:', error);
            }
          }}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Sử dụng lại</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.actionButton, styles.shareButton, { backgroundColor: colors.background, borderColor: colors.info, borderWidth: 1 }]}
          onPress={() => {}}
        >
          <Ionicons name="share-social-outline" size={20} color={colors.info} />
          <Text style={[styles.actionButtonText, { color: colors.info }]}>Chia sẻ</Text>
        </Pressable>
      </View>

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowSuccessModal(false)}
          >
            <View style={[styles.successModal, { backgroundColor: colors.card }]}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
              </View>
              <Text style={[styles.successTitle, { color: colors.text }]}>
                Hoàn thành chuyến đi! 🎉
              </Text>
              <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
                Bạn đã hoàn thành {completedDestinations}/{tripData?.destinations.length} điểm đến
              </Text>
              <Pressable 
                style={[styles.successButton, { backgroundColor: colors.info }]}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.successButtonText}>Xem chi tiết</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
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
  content: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  tripSubtitle: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E0E0E0",
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  timelineContainer: {
    paddingBottom: 20,
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
    borderWidth: 1,
    gap: 12,
  },
  destinationHeader: {
    gap: 4,
  },
  destinationTime: {
    fontSize: 13,
    fontWeight: "600",
  },
  destinationName: {
    fontSize: 15,
    fontWeight: "700",
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  reuseButton: {
    flex: 1,
  },
  shareButton: {
    flex: 1,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successModal: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
