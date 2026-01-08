import { Spacing } from '@/shared/constants/spacing';
import { useColorScheme } from '@/shared/hooks/useColorScheme';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    Alert,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPlaceById, getPlacesByCategory, searchPlaces } from '../services/mockPlaces';
import { useMapStore } from '../store/mapStore';
import type { MapMarker, Place, PlaceCategory } from '../types';
import { CategoryChips } from './CategoryChips';
import { MapAdapter, MapAdapterRef } from './MapAdapter';
import { MapControls } from './MapControls';
import { SearchBar } from './SearchBar';
import { SuggestionCard } from './SuggestionCard';

export function MapScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const mapRef = useRef<MapAdapterRef>(null);

    const {
        selectedPlaceId,
        activeCategory,
        searchQuery,
        region,
        userLocation,
        isLoadingLocation,
        setSelectedPlaceId,
        setActiveCategory,
        setSearchQuery,
        setUserLocation,
        setIsLoadingLocation,
    } = useMapStore();

    const filteredPlaces = useMemo(() => {
        let places = getPlacesByCategory(activeCategory);
        if (searchQuery.trim()) {
            places = searchPlaces(searchQuery);
        }
        return places;
    }, [activeCategory, searchQuery]);

    const markers: MapMarker[] = useMemo(() => {
        return filteredPlaces.map((place) => ({
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

    const selectedPlace = useMemo(() => {
        if (!selectedPlaceId) {
            return filteredPlaces[0] || null;
        }
        return getPlaceById(selectedPlaceId) || null;
    }, [selectedPlaceId, filteredPlaces]);

    const getCurrentLocation = useCallback(async () => {
        setIsLoadingLocation(true);
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy ?? undefined,
                timestamp: location.timestamp,
            });
        } catch (error) {
            console.error('Error getting location:', error);
        } finally {
            setIsLoadingLocation(false);
        }
    }, [setIsLoadingLocation, setUserLocation]);

    const requestLocationPermission = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location permission not granted');
                return;
            }
            getCurrentLocation();
        } catch (error) {
            console.error('Error requesting location permission:', error);
        }
    }, [getCurrentLocation]);

    useEffect(() => {
        requestLocationPermission();
    }, [requestLocationPermission]);

    const handleSearchChange = useCallback((text: string) => {
        setSearchQuery(text);
    }, [setSearchQuery]);

    const handleCategoryPress = useCallback((category: PlaceCategory | 'all') => {
        setActiveCategory(category);
        setSelectedPlaceId(null);
    }, [setActiveCategory, setSelectedPlaceId]);

    const handleMarkerPress = useCallback((markerId: string) => {
        setSelectedPlaceId(markerId);
        const place = getPlaceById(markerId);
        if (place) {
            mapRef.current?.animateToCoordinate({
                latitude: place.lat,
                longitude: place.lng,
            });
        }
    }, [setSelectedPlaceId]);

    const handleMapPress = useCallback(() => {
        setSelectedPlaceId(null);
    }, []);

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

    const handleLayersPress = useCallback(() => {
        Alert.alert('Lớp bản đồ', 'Tính năng đang phát triển');
    }, []);

    const handlePlacePress = useCallback((place: Place) => {
        Alert.alert(place.name, place.description || 'Chi tiết địa điểm');
    }, []);

    const handleMicPress = useCallback(() => {
        Alert.alert('Tìm kiếm giọng nói', 'Tính năng đang phát triển');
    }, []);

    const handleProfilePress = useCallback(() => {
        router.push('/(tabs)/profile' as any);
    }, [router]);

    const handleExpandSuggestions = useCallback(() => {
        Alert.alert('Xem tất cả', 'Tính năng đang phát triển');
    }, []);

    return (
        <View style={styles.container}>
            {/* Map Layer (background) */}
            <MapAdapter
                ref={mapRef}
                markers={markers}
                selectedMarkerId={selectedPlaceId}
                userLocation={userLocation}
                initialRegion={region}
                onMarkerPress={handleMarkerPress}
                onMapPress={handleMapPress}
                showsUserLocation
                colorScheme={colorScheme}
            />

            {/* Overlay UI */}
            <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        onMicPress={handleMicPress}
                        onProfilePress={handleProfilePress}
                        colorScheme={colorScheme}
                    />
                </View>

                {/* Category Chips */}
                <View style={styles.chipsContainer}>
                    <CategoryChips
                        activeCategory={activeCategory}
                        onCategoryPress={handleCategoryPress}
                        colorScheme={colorScheme}
                    />
                </View>
            </SafeAreaView>

            {/* Map Controls (right side floating buttons) */}
            <MapControls
                onLayersPress={handleLayersPress}
                onMyLocationPress={handleMyLocationPress}
                isLoadingLocation={isLoadingLocation}
                colorScheme={colorScheme}
            />

            {/* Bottom Suggestion Card */}
            <SuggestionCard
                place={selectedPlace}
                onPlacePress={handlePlacePress}
                onExpand={handleExpandSuggestions}
                colorScheme={colorScheme}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    searchContainer: {
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.sm,
    },
    chipsContainer: {
    },
});
