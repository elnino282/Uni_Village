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
    MockMapView,
    PlacesAutocomplete,
    RouteOverlay,
    SearchBar,
    SuggestionCard
} from './components';

// Store
export {
    useActiveCategory,
    useMapRegion,
    useMapStore,
    useSearchQuery,
    useSelectedPlaceId,
    useUserLocation
} from './store';

// Services (re-export key functions)
export {
    autocomplete,
    geocode,
    getDistance,
    getPlaceDetails,
    getReadableAddress,
    reverseGeocode,
    searchNearby
} from './services';

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

