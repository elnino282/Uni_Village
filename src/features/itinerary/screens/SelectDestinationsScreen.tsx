import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    BackHandler,
    Easing,
    Image,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SelectDestinationsMap, SelectDestinationsMapRef } from "@/features/itinerary/components/SelectDestinationsMap";
import { MOCK_PLACES } from "@/features/map/services/mockPlaces";
import type { MapMarker, MapRegion, Place } from "@/features/map/types";
import { Colors, useColorScheme } from "@/shared";

interface SelectedDestination {
  place: Place;
  order: number;
  visitTime?: Date;
}

interface SelectDestinationsScreenProps {
  tripData?: {
    tripName: string;
    startDate: Date;
    startTime: Date;
    categories: string[];
  };
  onBack?: () => void;
}

export function SelectDestinationsScreen({ tripData, onBack }: SelectDestinationsScreenProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const secondaryTextColor = colors.textSecondary || (colors as any).icon;
  const insets = useSafeAreaInsets();
  const mapRef = useRef<SelectDestinationsMapRef>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['30%', '65%', '90%'], []);

  const [selectedDestinations, setSelectedDestinations] = useState<SelectedDestination[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTimePickerFor, setShowTimePickerFor] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const confirmOpacity = useRef(new Animated.Value(0)).current;

  // Get nearby places
  const nearbyPlaces = useMemo(() => {
    return MOCK_PLACES.filter(p => p.distanceKm < 2);
  }, []);

  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return nearbyPlaces;
    return nearbyPlaces.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nearbyPlaces, searchQuery]);

  // Map region
  const initialRegion: MapRegion = useMemo(() => ({
    latitude: 10.7626,
    longitude: 106.6824,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  }), []);

  // Convert places to markers
  const markers: MapMarker[] = useMemo(() => {
    return filteredPlaces.map(place => ({
      id: place.id,
      coordinate: {
        latitude: place.lat,
        longitude: place.lng,
      },
      title: place.name,
      description: place.address,
      category: place.category,
    }));
  }, [filteredPlaces]);

  // Create map of selected markers with their order
  const selectedMarkersWithOrder = useMemo(() => {
    const map = new Map<string, number>();
    selectedDestinations.forEach(dest => {
      map.set(dest.place.id, dest.order);
    });
    return map;
  }, [selectedDestinations]);

  const getDestinationOrder = useCallback((placeId: string): number | null => {
    const dest = selectedDestinations.find(d => d.place.id === placeId);
    return dest ? dest.order : null;
  }, [selectedDestinations]);

  const toggleDestination = useCallback((place: Place) => {
    setSelectedDestinations(prev => {
      const existing = prev.find(d => d.place.id === place.id);
      if (existing) {
        // Remove and reorder
        const filtered = prev.filter(d => d.place.id !== place.id);
        return filtered.map((d, idx) => ({ ...d, order: idx + 1 }));
      } else {
        // Add to end with next order number
        const nextOrder = prev.length + 1;
        return [...prev, { place, order: nextOrder }];
      }
    });
  }, []);

  const isDirty = useMemo(() => {
    return selectedDestinations.length > 0;
  }, [selectedDestinations]);

  const requestClose = useCallback(() => {
    if (showTimePickerFor) {
      setShowTimePickerFor(null);
      return;
    }
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }, [isDirty, onBack, showTimePickerFor]);

  const handleMarkerPress = useCallback((markerId: string) => {
    const place = filteredPlaces.find(p => p.id === markerId);
    if (place) {
      toggleDestination(place);
      mapRef.current?.animateToCoordinate({
        latitude: place.lat,
        longitude: place.lng,
      });
    }
  }, [filteredPlaces, toggleDestination]);

  const handleSetTime = useCallback((placeId: string) => {
    const destination = selectedDestinations.find(d => d.place.id === placeId);
    setShowTimePickerFor(placeId);
    setTempTime(destination?.visitTime || new Date());
    if (Platform.OS === 'android') {
      setShowTimePicker(true);
    }
  }, [selectedDestinations]);

  const handleTimeConfirm = useCallback(() => {
    if (showTimePickerFor) {
      setSelectedDestinations(prev =>
        prev.map(d =>
          d.place.id === showTimePickerFor
            ? { ...d, visitTime: tempTime }
            : d
        )
      );
    }
    setShowTimePickerFor(null);
    setShowTimePicker(false);
  }, [showTimePickerFor, tempTime]);

  const handleBack = useCallback(() => {
    requestClose();
  }, [requestClose]);

  // Confirm modal fade animation
  useEffect(() => {
    Animated.timing(confirmOpacity, {
      toValue: showDiscardConfirm ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [confirmOpacity, showDiscardConfirm]);

  // Handle Android hardware back
  useEffect(() => {
    const onBackPress = () => {
      if (showTimePickerFor) {
        setShowTimePickerFor(null);
        return true;
      }
      if (showDiscardConfirm) {
        setShowDiscardConfirm(false);
        return true;
      }
      requestClose();
      return true;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [requestClose, showDiscardConfirm, showTimePickerFor]);

  const formatTime = (date?: Date) => {
    if (!date) return "Chọn giờ";
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  return (
    <GestureHandlerRootView style={styles.flex}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Map - Full screen background */}
        <View style={styles.mapContainer}>
          <SelectDestinationsMap
            ref={mapRef}
            markers={markers}
            selectedDestinations={selectedDestinations}
            initialRegion={initialRegion}
            onMarkerPress={handleMarkerPress}
            colorScheme={colorScheme}
          />
        </View>

        {/* Header - Overlay on top */}
        <View style={[
          styles.headerSafeArea,
          {
            paddingTop: insets.top,
            backgroundColor: colors.background,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          }
        ]}>
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.headerIcon}>
              <Ionicons name="arrow-back" size={22} color={colors.icon} />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {tripData?.tripName || "Chuyến đi #4"}
              </Text>
              <Text style={[styles.headerSubtitle, { color: secondaryTextColor }]}>
                Bước 2/2: Chọn điểm đến
              </Text>
            </View>

            <Pressable onPress={requestClose} hitSlop={10}>
              <Text style={[styles.skipText, { color: colors.info }]}>Bỏ qua</Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom Sheet with destinations list */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor: colors.background ?? '#ffffff' }}
          handleIndicatorStyle={{ backgroundColor: colors.border ?? '#e2e8f0' }}
          enablePanDownToClose={false}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.bottomSheetContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Search bar */}
            <View style={styles.searchSection}>
              <View style={[styles.searchBar, { backgroundColor: colors.card || "#fff", borderColor: colors.border }]}>
                <Ionicons name="search" size={18} color={colors.icon} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Tìm địa điểm, quán ăn"
                  placeholderTextColor={secondaryTextColor}
                  style={[styles.searchInput, { color: colors.text }]}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color={colors.icon} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Địa điểm gợi ý quanh đây ({filteredPlaces.length})
              </Text>
              {selectedDestinations.length > 0 && (
                <Text style={[styles.selectedCount, { color: colors.info }]}>
                  Đã chọn: {selectedDestinations.length}
                </Text>
              )}
            </View>

            {/* Destination List */}
            <View style={styles.listSection}>
              {filteredPlaces.map(place => {
                const order = getDestinationOrder(place.id);
                const isSelected = order !== null;
                const destination = selectedDestinations.find(d => d.place.id === place.id);

                return (
                  <View
                    key={place.id}
                    style={[
                      styles.placeCard,
                      {
                        backgroundColor: colors.card || "#fff",
                        borderColor: isSelected ? colors.info : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <Pressable
                      style={styles.placeContent}
                      onPress={() => {
                        toggleDestination(place);
                        mapRef.current?.animateToCoordinate({
                          latitude: place.lat,
                          longitude: place.lng,
                        });
                      }}
                    >
                      <Image
                        source={{ uri: place.thumbnail }}
                        style={styles.placeThumbnail}
                        resizeMode="cover"
                      />
                      <View style={styles.placeInfo}>
                        <Text style={[styles.placeName, { color: colors.text }]} numberOfLines={1}>
                          {place.name}
                        </Text>
                        <View style={styles.placeRow}>
                          <MaterialIcons name="star" size={12} color="#FFA500" />
                          <Text style={[styles.placeRating, { color: secondaryTextColor }]}>
                            {place.rating} ({place.ratingCount})
                          </Text>
                        </View>
                        <Text style={[styles.placeAddress, { color: secondaryTextColor }]} numberOfLines={1}>
                          {place.address || "Quán ở đâu"}
                        </Text>
                        <Text style={[styles.placeDistance, { color: colors.info }]}>
                          Cách {place.distanceKm} km
                        </Text>
                      </View>

                      {isSelected && order && (
                        <View style={styles.orderBadgeContainer}>
                          <View style={[styles.orderBadge, { backgroundColor: colors.info }]}>
                            <Text style={styles.orderBadgeText}>{order}</Text>
                          </View>
                        </View>
                      )}
                    </Pressable>

                    {isSelected && (
                      <View style={styles.placeActions}>
                        <Pressable
                          style={[styles.actionButton, { backgroundColor: colors.info }]}
                          onPress={() => handleSetTime(place.id)}
                        >
                          <Ionicons name="time-outline" size={16} color="#fff" />
                          <Text style={styles.actionButtonText}>
                            {destination?.visitTime ? formatTime(destination.visitTime) : "Chọn giờ"}
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[styles.actionButton, { backgroundColor: colors.success }]}
                          onPress={() => {}}
                        >
                          <Ionicons name="checkmark-circle" size={16} color="#fff" />
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Bottom padding for continue button */}
            <View style={{ height: 100 }} />
          </BottomSheetScrollView>
        </BottomSheet>

        {/* Bottom Button */}
        {selectedDestinations.length > 0 && (
          <View style={styles.bottomBarContainer}>
            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
              <Pressable
                style={[styles.continueButton, { backgroundColor: colors.info }]}
                onPress={async () => {
                  if (selectedDestinations.length === 0) {
                    alert("Vui lòng chọn ít nhất một địa điểm");
                    return;
                  }
                  
                  const destinationsData = selectedDestinations.map(d => ({
                    id: d.place.id,
                    name: d.place.name,
                    thumbnail: d.place.thumbnail,
                    order: d.order,
                    time: d.visitTime ? d.visitTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : undefined,
                  }));

                  // Save trip to AsyncStorage
                  try {
                    const tripId = Date.now().toString();
                    const newTrip = {
                      id: tripId,
                      tripName: tripData?.tripName || "Chuyến đi #4",
                      startDate: tripData?.startDate?.toISOString() || new Date().toISOString(),
                      startTime: tripData?.startTime?.toISOString() || new Date().toISOString(),
                      destinations: destinationsData,
                      createdAt: new Date().toISOString(),
                      status: 'upcoming' as const, // Default to upcoming
                    };

                    // Get existing trips
                    const tripsJson = await AsyncStorage.getItem('@trips');
                    const trips = tripsJson ? JSON.parse(tripsJson) : [];
                    
                    // Add new trip
                    trips.push(newTrip);
                    
                    // Save back to AsyncStorage
                    await AsyncStorage.setItem('@trips', JSON.stringify(trips));

                    // Navigate to success screen with tripId
                    router.replace({
                      pathname: "/(modals)/itinerary-success",
                      params: {
                        tripId: tripId,
                        tripName: tripData?.tripName || "Chuyến đi #4",
                        startDate: tripData?.startDate?.toISOString() || new Date().toISOString(),
                        startTime: tripData?.startTime?.toISOString() || new Date().toISOString(),
                        destinations: JSON.stringify(destinationsData),
                      },
                    });
                  } catch (error) {
                    console.error('Failed to save trip:', error);
                  }
                }}
              >
                <Text style={styles.continueButtonText}>
                  Hoàn tất lịch trình ({selectedDestinations.length}) →
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Discard Confirm Modal */}
        {showDiscardConfirm && (
          <Modal
            visible={showDiscardConfirm}
            transparent
            animationType="none"
            onRequestClose={() => setShowDiscardConfirm(false)}
          >
            <Animated.View style={[styles.confirmOverlay, { opacity: confirmOpacity }]}>
              <Pressable 
                style={StyleSheet.absoluteFill} 
                onPress={() => setShowDiscardConfirm(false)}
              />
              <View
                style={[
                  styles.confirmCard,
                  { backgroundColor: colors.card || "#fff", borderColor: colors.border },
                ]}
              >
                <Text style={[styles.confirmTitle, { color: colors.text }]}>Bỏ dở chuyến đi?</Text>
                <Text style={[styles.confirmBody, { color: secondaryTextColor }]}>
                  Các địa điểm bạn đã chọn sẽ bị mất nếu bạn thoát ngay bây giờ.
                </Text>
                <View style={styles.confirmActions}>
                  <Pressable
                    onPress={() => setShowDiscardConfirm(false)}
                    style={[styles.confirmButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                    hitSlop={8}
                  >
                    <Text style={[styles.confirmButtonText, { color: colors.text }]}>Ở lại</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setShowDiscardConfirm(false);
                      setTimeout(() => {
                        if (onBack) {
                          onBack();
                        } else {
                          router.back();
                        }
                      }, 100);
                    }}
                    style={[styles.confirmButton, styles.confirmButtonDanger]}
                    hitSlop={8}
                  >
                    <Text style={styles.confirmButtonDangerText}>Thoát</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </Modal>
        )}

      {/* Time Picker Modal */}
      {showTimePickerFor && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTimePickerFor(null)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowTimePickerFor(null)}
            />
            
            <View style={[styles.timePickerCard, { backgroundColor: colors.card || "#fff" }]}>
              <View style={styles.timePickerHeader}>
                <Text style={[styles.timePickerTitle, { color: colors.text }]}>
                  Chọn thời gian xuất phát
                </Text>
                <Pressable onPress={() => setShowTimePickerFor(null)}>
                  <Ionicons name="close" size={22} color={colors.icon} />
                </Pressable>
              </View>

              <View style={styles.timePickerBody}>
                <Text style={[styles.timePickerLabel, { color: secondaryTextColor }]}>
                  Địa điểm xuất phát: {selectedDestinations.find(d => d.place.id === showTimePickerFor)?.place.name}
                </Text>
                <Text style={[styles.timePickerHint, { color: secondaryTextColor }]}>
                  Thời gian xuất phát
                </Text>

                {Platform.OS === 'ios' ? (
                  <View style={styles.iosTimePickerContainer}>
                    <DateTimePicker
                      value={tempTime}
                      mode="time"
                      display="spinner"
                      onChange={(_, date) => {
                        if (date) setTempTime(date);
                      }}
                      textColor={colors.text}
                    />
                  </View>
                ) : (
                  <View style={styles.androidTimeDisplay}>
                    <Ionicons name="time-outline" size={32} color={colors.info} />
                    <Text style={[styles.androidTimeText, { color: colors.text }]}>
                      {formatTime(tempTime)}
                    </Text>
                  </View>
                )}

                <Text style={[styles.timePickerFootnote, { color: secondaryTextColor }]}>
                  Bạn có thể thay đổi sau khi tạo lịch trình
                </Text>
                <Text style={[styles.timePickerRecommend, { color: colors.info }]}>
                  Hệ thống gợi ý: {formatTime(new Date(new Date().setHours(14, 30)))}
                </Text>
              </View>

              <View style={styles.timePickerActions}>
                <Pressable
                  style={[styles.timePickerButton, { borderColor: colors.border }]}
                  onPress={() => setShowTimePickerFor(null)}
                >
                  <Text style={[styles.timePickerButtonText, { color: colors.text }]}>
                    Hủy
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.timePickerButton, styles.timePickerButtonPrimary, { backgroundColor: colors.info }]}
                  onPress={handleTimeConfirm}
                >
                  <Text style={styles.timePickerButtonPrimaryText}>
                    Xác nhận
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {Platform.OS === 'android' && showTimePicker && (
            <DateTimePicker
              value={tempTime}
              mode="time"
              display="default"
              onChange={(_, date) => {
                setShowTimePicker(false);
                if (date) {
                  setTempTime(date);
                  // Auto confirm on Android
                  setTimeout(() => handleTimeConfirm(), 100);
                }
              }}
            />
          )}
        </Modal>
      )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerSafeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIcon: {
    padding: 6,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  mapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheetContent: {
    paddingBottom: 100,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  selectedCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  listSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  placeCard: {
    borderRadius: 14,
    overflow: "hidden",
  },
  placeContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  placeThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  placeInfo: {
    flex: 1,
    gap: 4,
  },
  placeName: {
    fontSize: 15,
    fontWeight: "700",
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  placeRating: {
    fontSize: 12,
  },
  placeAddress: {
    fontSize: 12,
  },
  placeDistance: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderBadgeContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  orderBadgeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  placeActions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  confirmTitle: { fontSize: 17, fontWeight: "800" },
  confirmBody: { fontSize: 14, lineHeight: 20 },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  confirmButtonDanger: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  confirmButtonText: { fontSize: 14, fontWeight: "700" },
  confirmButtonDangerText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  timePickerCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  timePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  timePickerTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  timePickerBody: {
    padding: 16,
    gap: 12,
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  timePickerHint: {
    fontSize: 14,
  },
  iosTimePickerContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  androidTimeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
  },
  androidTimeText: {
    fontSize: 32,
    fontWeight: "700",
  },
  timePickerFootnote: {
    fontSize: 12,
    textAlign: "center",
  },
  timePickerRecommend: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  timePickerActions: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
  },
  timePickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  timePickerButtonPrimary: {
    borderWidth: 0,
  },
  timePickerButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  timePickerButtonPrimaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
