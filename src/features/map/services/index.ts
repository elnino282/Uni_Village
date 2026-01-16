/**
 * Map Services Index
 * 
 * Exports all map-related services for Google Maps API integration.
 */

// Places API Service
export {
    autocomplete,
    clearPlacesCache,
    getPhotoUrl,
    getPlaceDetails,
    mapPlaceTypeToCategory,
    searchNearby,
    type AutocompleteOptions,
    type NearbyPlace,
    type NearbySearchOptions,
    type PlaceDetails,
    type PlacePhoto,
    type PlacePrediction
} from './placesService';

// Geocoding API Service
export {
    clearGeocodingCache,
    geocode,
    geocodeFirst,
    getReadableAddress,
    parseAddressComponents,
    reverseGeocode,
    reverseGeocodeFirst,
    type AddressComponent,
    type GeocodeOptions,
    type GeocodingResult,
    type ReverseGeocodeOptions,
    type StructuredAddress
} from './geocodingService';

// Distance Matrix API Service
export {
    clearDistanceCache,
    findNearest,
    formatDistanceText,
    formatDuration,
    getDistance,
    getDistanceMatrix,
    getDistancesFromOrigin,
    sortByDistance,
    type DistanceMatrixElement,
    type DistanceMatrixLocation,
    type DistanceMatrixOptions,
    type DistanceMatrixResult,
    type DistanceMatrixRow,
    type TravelMode
} from './distanceMatrixService';

