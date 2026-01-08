import { create } from 'zustand';
import { DEFAULT_REGION } from '../services/mockPlaces';
import type { MapRegion, MapState, PlaceCategory, UserLocation } from '../types';

const initialState = {
    selectedPlaceId: null,
    activeCategory: 'all' as PlaceCategory | 'all',
    searchQuery: '',
    isSearchFocused: false,
    region: DEFAULT_REGION,
    userLocation: null,
    isLoadingLocation: false,
};

export const useMapStore = create<MapState>((set) => ({
    // Initial state
    ...initialState,

    // Actions
    setSelectedPlaceId: (id: string | null) => 
        set({ selectedPlaceId: id }),

    setActiveCategory: (category: PlaceCategory | 'all') => 
        set({ activeCategory: category }),

    setSearchQuery: (query: string) => 
        set({ searchQuery: query }),

    setIsSearchFocused: (focused: boolean) => 
        set({ isSearchFocused: focused }),

    setRegion: (region: MapRegion) => 
        set({ region }),

    setUserLocation: (location: UserLocation | null) => 
        set({ userLocation: location }),

    setIsLoadingLocation: (loading: boolean) => 
        set({ isLoadingLocation: loading }),

    resetMapState: () => 
        set(initialState),
}));

/**
 * Selector hooks for specific state slices
 */
export const useSelectedPlaceId = () => useMapStore((state) => state.selectedPlaceId);
export const useActiveCategory = () => useMapStore((state) => state.activeCategory);
export const useSearchQuery = () => useMapStore((state) => state.searchQuery);
export const useMapRegion = () => useMapStore((state) => state.region);
export const useUserLocation = () => useMapStore((state) => state.userLocation);
