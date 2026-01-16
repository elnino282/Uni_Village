/**
 * Map Hooks
 *
 * Custom hooks for map-related functionality.
 */

export { useDirections, type LatLng, type UseDirectionsOptions, type UseDirectionsResult } from './useDirections';
export { useNearbyPlaces, type UseNearbyPlacesOptions, type UseNearbyPlacesResult } from './useNearbyPlaces';
export { useUserLocation, type LocationOptions, type UseUserLocationResult } from './useUserLocation';

// Camera animation for navigation
export {
    calculateHeading, msToKmh, useCameraAnimation, type CameraConfig,
    type UseCameraAnimationOptions,
    type UseCameraAnimationResult
} from './useCameraAnimation';

