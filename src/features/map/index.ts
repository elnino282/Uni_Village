/**
 * Map Feature Module
 *
 * Provides Google Maps integration with:
 * - Places search & autocomplete
 * - Directions & routing
 * - Geocoding
 * - Distance calculations
 */

// Components
export {
    CategoryChips,
    LocationPicker,
    MapAdapter,
    MapControls,
    MapScreen,
    MapSearchOverlay,
    MapTypeSelectorModal,
    MockMapView,
    NavigationControls,
    PlacesAutocomplete,
    RouteOverlay,
    SearchBar,
    SkeletonPlaceCard,
    SkeletonPlaceList,
    SuggestionCard
} from './components';

// Hooks
export {
    useDirections,
    useNearbyPlaces,
    useUserLocation
} from './hooks';

// Store
export {
    useActiveCategory,
    useMapRegion,
    useMapStore,
    useSearchQuery,
    useSelectedPlaceId,
    useUserLocation as useUserLocationFromStore
} from './store';

// Services (re-export key functions)
export {
    autocomplete,
    geocode,
    getDistance,
    getGoogleMapsClient,
    getPlaceDetails,
    getReadableAddress, GoogleMapsClient,
    MapError, reverseGeocode,
    searchNearby
} from './services';

// Constants
export {
    CATEGORY_CONFIG,
    CATEGORY_TO_GOOGLE_TYPES,
    GOOGLE_TYPE_TO_CATEGORY,
    MAP_CONFIG,
    MAP_TYPE_OPTIONS
} from './constants';
export type { MapTypeOption } from './constants';

// Utils
export {
    convertNearbyPlaceToPlace,
    convertPlaceDetailsToPlace,
    formatDistance,
    getPlacePhotoUrl,
    mapGoogleTypeToCategory
} from './utils';

// Types
export type {
    CategoryChip,
    MapMarker,
    MapRegion,
    MapState,
    Place,
    PlaceCategory,
    RouteInfo,
    SearchResult,
    SelectedLocation,
    UserLocation,
    Waypoint
} from './types';

// Service types
export type {
    NearbyPlace,
    PlaceDetails,
    PlacePrediction
} from './services';

// Hook types
export type {
    LatLng,
    UseDirectionsOptions,
    UseDirectionsResult,
    UseNearbyPlacesOptions,
    UseNearbyPlacesResult,
    UseUserLocationResult
} from './hooks';

