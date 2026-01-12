/**
 * Itinerary Feature - Public API
 */

// Screens
export { ActiveTripScreen } from './screens/ActiveTripScreen';
export { CreateItineraryScreen } from './screens/CreateItineraryScreen';
export { ItineraryDetailScreen } from './screens/ItineraryDetailScreen';
export { ItineraryScreen } from './screens/ItineraryScreen';
export { default as ItinerarySuccessScreen } from './screens/ItinerarySuccessScreen';
export { SelectDestinationsScreen } from './screens/SelectDestinationsScreen';

// Components
export { DestinationMap } from './components/DestinationMap';
export type { DestinationMapRef } from './components/DestinationMap';
export { SelectDestinationsMap } from './components/SelectDestinationsMap';
export type { SelectDestinationsMapRef } from './components/SelectDestinationsMap';

// Hooks
export { useItineraries } from './hooks/useItineraries';

// Services
export { fetchItineraries } from './services/itineraryService';

// Types
export type { Itinerary, ItineraryStatus } from './types/itinerary.types';

