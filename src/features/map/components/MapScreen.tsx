/**
 * MapScreen - Fully integrated with Google Maps APIs (Redesigned UI/UX)
 *
 * Features:
 * - Places Autocomplete for search
 * - Nearby search based on user location
 * - Directions with route overlay
 * - Category filtering
 * - Bottom Sheet for place details (Gorhom)
 * - Navigation Banner for turn-by-turn
 * - Map type switching
 * - Optimized performance
 */

import {
    getDirections,
    type NavigationRoute,
    type TravelMode,
} from "@/lib/maps/googleMapsService";
import { Spacing } from "@/shared/constants/spacing";
import { useColorScheme } from "@/shared/hooks/useColorScheme";
import * as ExpoLocation from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Alert, Keyboard, StyleSheet, View, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    getPlaceDetails,
    searchNearby,
    type NearbyPlace,
    type PlaceDetails,
} from "../services/placesService";
import { useMapStore } from "../store/mapStore";
import type { MapMarker, Place, PlaceCategory, UserLocation } from "../types";
import { CategoryChips } from "./CategoryChips";
import { MapAdapter, MapAdapterRef } from "./MapAdapter";
import { MapControls } from "./MapControls";
import { NavigationBanner } from "./NavigationBanner";
import { PlaceBottomSheet, PlaceBottomSheetRef } from "./PlaceBottomSheet";
import { PlacesAutocomplete } from "./PlacesAutocomplete";
import { RouteOverlay } from "./RouteOverlay";
import { SearchBar } from "./SearchBar";
import { DirectionsSetup } from "./DirectionsSetup";
import { SortControl, SortOption } from "./SortControl";

// Type mapping from Google Place types to app categories
const GOOGLE_TYPE_TO_CATEGORY: Record<string, PlaceCategory> = {
    restaurant: "restaurant",
    food: "restaurant",
    cafe: "cafe",
    coffee_shop: "cafe",
    lodging: "hotel",
    hotel: "hotel",
    shopping_mall: "shopping",
    store: "shopping",
    supermarket: "shopping",
    movie_theater: "entertainment",
    amusement_park: "entertainment",
    night_club: "entertainment",
    school: "education",
    university: "education",
    library: "education",
};

// Category to Google Place types mapping
const CATEGORY_TO_GOOGLE_TYPES: Record<PlaceCategory, string[]> = {
    restaurant: ["restaurant"],
    cafe: ["cafe"],
    hotel: ["lodging"],
    shopping: ["shopping_mall", "store"],
    entertainment: ["movie_theater", "amusement_park"],
    education: ["school", "university"],
    home: [],
    other: [],
};

function mapGoogleTypeToCategory(types: string[]): PlaceCategory {
    for (const type of types) {
        if (GOOGLE_TYPE_TO_CATEGORY[type]) {
            return GOOGLE_TYPE_TO_CATEGORY[type];
        }
    }
    return "other";
}

function convertNearbyPlaceToPlace(nearbyPlace: NearbyPlace): Place {
    return {
        id: nearbyPlace.placeId,
        name: nearbyPlace.name,
        category: mapGoogleTypeToCategory(nearbyPlace.types),
        rating: nearbyPlace.rating || 4.0,
        ratingCount: nearbyPlace.userRatingCount,
        distanceKm: (nearbyPlace.distanceMeters || 0) / 1000,
        tags: [],
        thumbnail:
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
        lat: nearbyPlace.location.latitude,
        lng: nearbyPlace.location.longitude,
        address: nearbyPlace.formattedAddress,
        isOpen: undefined,
    };
}

function convertPlaceDetailsToPlace(details: PlaceDetails): Place {
    return {
        id: details.placeId,
        name: details.name,
        category: mapGoogleTypeToCategory(details.types),
        rating: details.rating || 4.0,
        ratingCount: details.userRatingCount,
        distanceKm: 0,
        tags: [],
        thumbnail:
            details.photos && details.photos.length > 0
                ? `https://places.googleapis.com/v1/${details.photos[0].name}/media?maxWidthPx=400&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
                : "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
        lat: details.location.latitude,
        lng: details.location.longitude,
        address: details.formattedAddress,
        isOpen: details.openingHours?.openNow,
        // Extended fields
        photos: details.photos,
        editorialSummary: details.editorialSummary,
        businessStatus: details.businessStatus,
        phone: details.phoneNumber,
        internationalPhone: details.internationalPhoneNumber,
        website: details.website,
        openingHoursText: details.openingHours?.weekdayDescriptions,
    };
}

export function MapScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? "light";
    const mapRef = useRef<MapAdapterRef>(null);
    const bottomSheetRef = useRef<PlaceBottomSheetRef>(null);

    // Store state
    const {
        activeCategory,
        searchQuery,
        region,
        userLocation,
        isLoadingLocation,
        setActiveCategory,
        setSearchQuery,
        setUserLocation,
        setIsLoadingLocation,
    } = useMapStore();

    // Local UI state
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [places, setPlaces] = useState<NearbyPlace[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
    const [recentlyViewed, setRecentlyViewed] = useState<Place[]>([]);

    // Enhanced UI state
    const [showDirectionsSetup, setShowDirectionsSetup] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('distance');

    // Map display state
    const [mapType, setMapType] = useState<"standard" | "satellite">("standard");

    // Route state
    const [navigationRoute, setNavigationRoute] =
        useState<NavigationRoute | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [showRouteOverlay, setShowRouteOverlay] = useState(false);

    // Navigation state
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Sorting Logic
    const sortedPlaces = useMemo(() => {
        const placesCopy = [...places];
        if (sortOption === 'distance') {
            return placesCopy.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
        } else {
            return placesCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
    }, [places, sortOption]);

    // Convert places to markers
    const markers: MapMarker[] = sortedPlaces.map((place) => ({
        id: place.placeId,
        coordinate: {
            latitude: place.location.latitude,
            longitude: place.location.longitude,
        },
        title: place.name,
        description: place.formattedAddress,
        category: mapGoogleTypeToCategory(place.types),
    }));

    // Fetch nearby places when location or category changes
    const fetchNearbyPlaces = useCallback(
        async (location: UserLocation, category: PlaceCategory | "all") => {
            setIsLoadingPlaces(true);
            try {
                const includedTypes =
                    category === "all" ? undefined : CATEGORY_TO_GOOGLE_TYPES[category];

                // Skip if category has no types (like 'home')
                if (includedTypes && includedTypes.length === 0) {
                    setPlaces([]);
                    setIsLoadingPlaces(false);
                    return;
                }

                const results = await searchNearby({
                    location: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    },
                    radius: 2000,
                    includedTypes,
                    maxResultCount: 20,
                });

                setPlaces(results);

                // Auto-select first place if none selected
                if (results.length > 0 && !selectedPlace) {
                    const firstPlace = convertNearbyPlaceToPlace(results[0]);
                    setSelectedPlace(firstPlace);
                }
            } catch (error) {
                console.error("Error fetching nearby places:", error);
            } finally {
                setIsLoadingPlaces(false);
            }
        },
        [selectedPlace]
    );

    // Effect to fetch places when location/category changes
    useEffect(() => {
        if (userLocation) {
            fetchNearbyPlaces(userLocation, activeCategory);
        }
    }, [userLocation, activeCategory, fetchNearbyPlaces]);

    // Get current location
    const getCurrentLocation = useCallback(async () => {
        setIsLoadingLocation(true);
        try {
            const location = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.Balanced,
            });

            const newLocation: UserLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy ?? undefined,
                timestamp: location.timestamp,
            };

            setUserLocation(newLocation);

            // Center map on user location
            mapRef.current?.animateToCoordinate({
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
            });
        } catch (error) {
            console.error("Error getting location:", error);
            Alert.alert(
                "Lỗi",
                "Không thể lấy vị trí hiện tại. Vui lòng kiểm tra cài đặt GPS."
            );
        } finally {
            setIsLoadingLocation(false);
        }
    }, [setIsLoadingLocation, setUserLocation]);

    // Request location permission on mount
    useEffect(() => {
        const requestPermission = async () => {
            try {
                const { status } =
                    await ExpoLocation.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    getCurrentLocation();
                } else {
                    Alert.alert(
                        "Cần quyền vị trí",
                        "Vui lòng cho phép truy cập vị trí để sử dụng đầy đủ tính năng bản đồ"
                    );
                }
            } catch (error) {
                console.error("Error requesting location permission:", error);
            }
        };

        requestPermission();
    }, [getCurrentLocation]);

    // Handle search text change
    const handleSearchChange = useCallback(
        (text: string) => {
            setSearchQuery(text);
            if (text.length >= 2) {
                setIsSearchFocused(true);
            }
        },
        [setSearchQuery]
    );

    // Handle place selection from autocomplete
    const handlePlaceSelectFromAutocomplete = useCallback(
        async (placeDetails: PlaceDetails) => {
            setIsSearchFocused(false);
            setSearchQuery(placeDetails.name);
            Keyboard.dismiss();

            const place = convertPlaceDetailsToPlace(placeDetails);
            setSelectedPlace(place);

            // Add to recently viewed
            setRecentlyViewed((prev) => {
                const filtered = prev.filter((p) => p.id !== place.id);
                return [place, ...filtered].slice(0, 10);
            });

            // Animate map to selected place
            mapRef.current?.animateToCoordinate({
                latitude: placeDetails.location.latitude,
                longitude: placeDetails.location.longitude,
            });
        },
        [setSearchQuery]
    );

    // Handle category change
    const handleCategoryPress = useCallback(
        (category: PlaceCategory | "all") => {
            setActiveCategory(category);
            setSelectedPlace(null);
        },
        [setActiveCategory]
    );

    // Handle marker press on map
    const handleMarkerPress = useCallback(
        async (markerId: string) => {
            const nearbyPlace = places.find((p) => p.placeId === markerId);

            if (nearbyPlace) {
                try {
                    const details = await getPlaceDetails(markerId);
                    if (details) {
                        const place = convertPlaceDetailsToPlace(details);
                        setSelectedPlace(place);

                        // Add to recently viewed
                        setRecentlyViewed((prev) => {
                            const filtered = prev.filter((p) => p.id !== place.id);
                            return [place, ...filtered].slice(0, 10);
                        });
                    } else {
                        setSelectedPlace(convertNearbyPlaceToPlace(nearbyPlace));
                    }
                } catch {
                    setSelectedPlace(convertNearbyPlaceToPlace(nearbyPlace));
                }

                mapRef.current?.animateToCoordinate({
                    latitude: nearbyPlace.location.latitude,
                    longitude: nearbyPlace.location.longitude,
                });
            }
        },
        [places]
    );

    // Handle map press (deselect)
    const handleMapPress = useCallback(() => {
        setIsSearchFocused(false);
        Keyboard.dismiss();
    }, []);

    // Handle my location button
    const handleMyLocationPress = useCallback(() => {
        if (userLocation) {
            mapRef.current?.animateToCoordinate({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
            });
        } else {
            getCurrentLocation();
        }
    }, [userLocation, getCurrentLocation]);

    // Handle Zoom
    const handleZoomIn = useCallback(async () => {
        const camera = await mapRef.current?.getCamera();
        if (camera) {
            mapRef.current?.animateCamera({ zoom: (camera.zoom || 15) + 1 });
        }
    }, []);

    const handleZoomOut = useCallback(async () => {
        const camera = await mapRef.current?.getCamera();
        if (camera) {
            mapRef.current?.animateCamera({ zoom: (camera.zoom || 15) - 1 });
        }
    }, []);

    // Handle layers button - toggle map type
    const handleLayersPress = useCallback(() => {
        Alert.alert("Lớp bản đồ", "Chọn kiểu bản đồ", [
            {
                text: "Tiêu chuẩn",
                onPress: () => setMapType("standard"),
            },
            {
                text: "Vệ tinh",
                onPress: () => setMapType("satellite"),
            },
            { text: "Hủy", style: "cancel" },
        ]);
    }, []);

    // Handle place selection from bottom sheet
    const handlePlaceSelect = useCallback((place: Place) => {
        setSelectedPlace(place);
        mapRef.current?.animateToCoordinate({
            latitude: place.lat,
            longitude: place.lng,
        });
    }, []);

    // Handle get directions (Setup)
    const handleGetDirections = useCallback(
        async (place: Place) => {
            if (!userLocation) {
                Alert.alert(
                    "Lỗi",
                    "Vui lòng bật định vị để sử dụng tính năng chỉ đường"
                );
                return;
            }
            setSelectedPlace(place);
            setShowDirectionsSetup(true);
        },
        [userLocation]
    );

    // Handle Confirm Directions
    const handleConfirmDirections = useCallback(async ({ origin, mode }: { origin: string; mode: TravelMode }) => {
        setShowDirectionsSetup(false);
        if (!selectedPlace || !userLocation) return;

        setIsLoadingRoute(true);
        setShowRouteOverlay(true);

        try {
            const route = await getDirections(
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: selectedPlace.lat, longitude: selectedPlace.lng },
                { mode }
            );
            setNavigationRoute(route);
        } catch (error) {
            console.error("Error getting directions:", error);
            Alert.alert("Lỗi", "Không thể lấy chỉ đường. Vui lòng thử lại.");
            setShowRouteOverlay(false);
        } finally {
            setIsLoadingRoute(false);
        }
    }, [selectedPlace, userLocation]);

    // Handle close route overlay
    const handleCloseRouteOverlay = useCallback(() => {
        setShowRouteOverlay(false);
        setNavigationRoute(null);
        setIsNavigating(false);
        setCurrentStepIndex(0);
    }, []);

    // Handle start navigation
    const handleStartNavigation = useCallback(() => {
        if (!navigationRoute) return;

        setIsNavigating(true);
        setShowRouteOverlay(false);
        setCurrentStepIndex(0);

        // Hide bottom sheet during navigation
        bottomSheetRef.current?.collapse();
    }, [navigationRoute]);

    // Handle exit navigation
    const handleExitNavigation = useCallback(() => {
        setIsNavigating(false);
        setNavigationRoute(null);
        setCurrentStepIndex(0);
    }, []);

    // Handle mic press
    const handleMicPress = useCallback(() => {
        Alert.alert("Tìm kiếm giọng nói", "Tính năng đang phát triển");
    }, []);

    // Handle profile press
    const handleProfilePress = useCallback(() => {
        router.push("/(tabs)/profile" as any);
    }, [router]);

    // Handle bottom sheet close
    const handleBottomSheetClose = useCallback(() => {
        // Bottom sheet closed
    }, []);

    // Get current navigation step
    const currentStep = isNavigating
        ? navigationRoute?.steps[currentStepIndex] || null
        : null;

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Map Layer */}
            <MapAdapter
                ref={mapRef}
                markers={markers}
                selectedMarkerId={selectedPlace?.id || null}
                userLocation={userLocation}
                initialRegion={region}
                mapType={mapType}
                routePolyline={navigationRoute?.polylinePoints}
                showPolylineStroke
                hideBusinessPOI={isNavigating}
                onMarkerPress={handleMarkerPress}
                onMapPress={handleMapPress}
                showsUserLocation
                colorScheme={colorScheme}
            />

            {/* Navigation Banner (shown during navigation) */}
            {isNavigating && currentStep && (
                <NavigationBanner
                    currentStep={currentStep}
                    distanceToTurn={currentStep.distance}
                    remainingDistance={navigationRoute?.distance}
                    eta={navigationRoute?.duration}
                    colorScheme={colorScheme}
                    isNavigating={isNavigating}
                />
            )}

            {/* Search Overlay (hidden during navigation) */}
            {!isNavigating && !showDirectionsSetup && (
                <SafeAreaView
                    style={styles.overlay}
                    edges={["top"]}
                    pointerEvents="box-none"
                >
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <SearchBar
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            onMicPress={handleMicPress}
                            onProfilePress={handleProfilePress}
                            colorScheme={colorScheme}
                        />

                        {/* Autocomplete Dropdown */}
                        <PlacesAutocomplete
                            query={searchQuery}
                            isVisible={isSearchFocused && searchQuery.length >= 2}
                            onPlaceSelect={handlePlaceSelectFromAutocomplete}
                            onClose={() => setIsSearchFocused(false)}
                            userLocation={userLocation ?? undefined}
                            colorScheme={colorScheme}
                        />
                    </View>

                    {/* Category Chips & Sort */}
                    <View style={styles.chipsContainer}>
                        <CategoryChips
                            activeCategory={activeCategory}
                            onCategoryPress={handleCategoryPress}
                            colorScheme={colorScheme}
                        />
                         <View style={styles.sortContainer}>
                             <SortControl
                                sortOption={sortOption}
                                onSortChange={setSortOption}
                                colorScheme={colorScheme}
                             />
                        </View>
                    </View>
                </SafeAreaView>
            )}

            {/* Directions Setup Overlay */}
            {showDirectionsSetup && selectedPlace && (
                <View style={styles.fullScreenOverlay}>
                    <DirectionsSetup
                        destination={selectedPlace}
                        onStartNavigation={handleConfirmDirections}
                        onClose={() => setShowDirectionsSetup(false)}
                        colorScheme={colorScheme}
                    />
                </View>
            )}

            {/* Map Controls (Hidden during navigation to show Nav Buttons) */}
            {!isNavigating ? (
                <MapControls
                    onLayersPress={handleLayersPress}
                    onMyLocationPress={handleMyLocationPress}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    isLoadingLocation={isLoadingLocation}
                    colorScheme={colorScheme}
                />
            ) : (
                <View style={styles.navigationButtons}>
                     <TouchableOpacity
                        style={[styles.navButton, { backgroundColor: '#EF4444' }]}
                        onPress={handleExitNavigation}
                    >
                        <MaterialIcons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                        onPress={() => Alert.alert("Voice", "Đã bật dẫn đường giọng nói")}
                    >
                        <MaterialIcons name="volume-up" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Place Bottom Sheet (hidden during navigation, route overlay and setup) */}
            {!isNavigating && !showRouteOverlay && !showDirectionsSetup && (
                <PlaceBottomSheet
                    ref={bottomSheetRef}
                    place={selectedPlace}
                    recentlyViewed={recentlyViewed}
                    onPlaceSelect={handlePlaceSelect}
                    onDirections={handleGetDirections}
                    onClose={handleBottomSheetClose}
                    colorScheme={colorScheme}
                />
            )}

            {/* Route Overlay */}
            {showRouteOverlay && (
                <RouteOverlay
                    route={navigationRoute}
                    isLoading={isLoadingRoute}
                    onStartNavigation={handleStartNavigation}
                    onClose={handleCloseRouteOverlay}
                    colorScheme={colorScheme}
                />
            )}
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    searchContainer: {
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.sm,
        position: "relative",
        zIndex: 20,
    },
    chipsContainer: {
        zIndex: 10,
        gap: Spacing.xs,
    },
    sortContainer: {
        paddingLeft: Spacing.screenPadding,
        alignItems: 'flex-start',
    },
    fullScreenOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 50,
        backgroundColor: '#fff',
    },
    navigationButtons: {
        position: 'absolute',
        bottom: Spacing.screenPadding + 20,
        right: Spacing.screenPadding,
        alignItems: 'center',
    },
    navButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        ...Shadows.lg,
    },
});
