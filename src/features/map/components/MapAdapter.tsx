import { Colors, MapColors, Shadows } from "@/shared/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef
} from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from "react-native-maps";
import type {
  MapMarker,
  MapRegion,
  PlaceCategory,
  UserLocation,
} from "../types";

/** Coordinate for polyline rendering */
export interface PolylineCoord {
  latitude: number;
  longitude: number;
}

export interface MapAdapterProps {
  markers: MapMarker[];
  selectedMarkerId?: string | null;
  userLocation?: UserLocation | null;
  initialRegion: MapRegion;
  /** Route polyline coordinates */
  routePolyline?: PolylineCoord[];
  /** Polyline color (default: theme tint) */
  polylineColor?: string;
  onMarkerPress?: (markerId: string) => void;
  onRegionChange?: (region: MapRegion) => void;
  onMapPress?: () => void;
  showsUserLocation?: boolean;
  colorScheme?: "light" | "dark";
}


export interface MapAdapterRef {
  animateToRegion: (region: MapRegion, duration?: number) => void;
  animateToCoordinate: (coordinate: {
    latitude: number;
    longitude: number;
  }) => void;
}

function getMarkerColor(
  category: PlaceCategory,
  isSelected: boolean,
  colorScheme: "light" | "dark"
): string {
  if (isSelected) {
    return MapColors[colorScheme].markerSelected;
  }
  return MapColors[colorScheme].markerDefault;
}

function getCategoryIcon(category: PlaceCategory): string {
  const iconMap: Record<PlaceCategory, string> = {
    home: "home",
    restaurant: "restaurant",
    hotel: "hotel",
    shopping: "shopping-bag",
    cafe: "local-cafe",
    entertainment: "sports-esports",
    education: "school",
    other: "place",
  };
  return iconMap[category] || "place";
}

export const MapAdapter = forwardRef<MapAdapterRef, MapAdapterProps>(
  function MapAdapter(
    {
      markers,
      selectedMarkerId,
      userLocation,
      initialRegion,
      routePolyline,
      polylineColor,
      onMarkerPress,
      onRegionChange,
      onMapPress,
      showsUserLocation = true,
      colorScheme = "light",
    },
    ref
  ) {
    const mapRef = useRef<MapView>(null);
    const colors = Colors[colorScheme];
    const thePolylineColor = polylineColor || colors.tint;

    useImperativeHandle(ref, () => ({
      animateToRegion: (region: MapRegion, duration = 500) => {
        mapRef.current?.animateToRegion(region, duration);
      },
      animateToCoordinate: (coordinate: { latitude: number; longitude: number }) => {
        mapRef.current?.animateToRegion(
          {
            ...coordinate,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          500
        );
      },
    }));

    const handleRegionChangeComplete = useCallback(
      (region: Region) => {
        onRegionChange?.({
          latitude: region.latitude,
          longitude: region.longitude,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        });
      },
      [onRegionChange]
    );

    const handleMarkerPress = useCallback(
      (markerId: string) => {
        onMarkerPress?.(markerId);
      },
      [onMarkerPress]
    );

    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={initialRegion}
          showsUserLocation={showsUserLocation}
          showsMyLocationButton={false}
          showsCompass={false}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={onMapPress}
          mapPadding={{ top: 120, right: 0, bottom: 200, left: 0 }}
        >
          {markers.map((marker) => {
            const isSelected = marker.id === selectedMarkerId;
            const markerColor = getMarkerColor(
              marker.category,
              isSelected,
              colorScheme
            );

            return (
              <Marker
                key={marker.id}
                identifier={marker.id}
                coordinate={marker.coordinate}
                title={marker.title}
                description={marker.description}
                onPress={() => handleMarkerPress(marker.id)}
              >
                <View
                  style={[
                    styles.markerContainer,
                    isSelected && styles.markerContainerSelected,
                    { backgroundColor: markerColor },
                  ]}
                >
                  <MaterialIcons
                    name={getCategoryIcon(marker.category) as any}
                    size={isSelected ? 20 : 16}
                    color="#fff"
                  />
                </View>
              </Marker>
            );
          })}

          {/* Route Polyline */}
          {routePolyline && routePolyline.length > 0 && (
            <Polyline
              coordinates={routePolyline}
              strokeColor={thePolylineColor}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}
        </MapView>
      </View>
    );
  }
);
export function MockMapView({
  markers,
  selectedMarkerId,
  onMarkerPress,
  colorScheme = "light",
}: Pick<
  MapAdapterProps,
  "markers" | "selectedMarkerId" | "onMarkerPress" | "colorScheme"
>) {
  return (
    <View style={[styles.container, styles.mockContainer]}>
      <View style={styles.mockMapBackground}>
        <MaterialIcons
          name="map"
          size={120}
          color={Colors[colorScheme].muted}
        />
        <Text style={[styles.mockText, { color: Colors[colorScheme].text }]}>
          Map View
        </Text>
        <Text style={[styles.mockSubtext, { color: Colors[colorScheme].icon }]}>
          {markers.length} địa điểm gần đây
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
  },
  markerContainerSelected: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#fff",
  },
  mockContainer: {
    backgroundColor: "#e8f4f8",
  },
  mockMapBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mockText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  mockSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});
