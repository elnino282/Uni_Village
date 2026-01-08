export interface Place {
    id: string;
    name: string;
    category: PlaceCategory;
    rating: number;
    ratingCount?: number;
    distanceKm: number;
    tags: string[];
    thumbnail: string;
    lat: number;
    lng: number;
    address?: string;
    description?: string;
    isOpen?: boolean;
    priceLevel?: 1 | 2 | 3 | 4; // $ to $$$$
}

export type PlaceCategory = 
    | 'home'
    | 'restaurant'
    | 'hotel'
    | 'shopping'
    | 'cafe'
    | 'entertainment'
    | 'education'
    | 'other';

export interface CategoryChip {
    id: PlaceCategory | 'all';
    label: string;
    icon: string; 
}

export interface MapMarker {
    id: string;
    coordinate: {
        latitude: number;
        longitude: number;
    };
    title?: string;
    description?: string;
    category: PlaceCategory;
}

export interface MapRegion {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface UserLocation {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: number;
}

export interface MapState {
    selectedPlaceId: string | null;
    activeCategory: PlaceCategory | 'all';
    searchQuery: string;
    isSearchFocused: boolean;

    region: MapRegion;
    userLocation: UserLocation | null;
    isLoadingLocation: boolean;

    setSelectedPlaceId: (id: string | null) => void;
    setActiveCategory: (category: PlaceCategory | 'all') => void;
    setSearchQuery: (query: string) => void;
    setIsSearchFocused: (focused: boolean) => void;
    setRegion: (region: MapRegion) => void;
    setUserLocation: (location: UserLocation | null) => void;
    setIsLoadingLocation: (loading: boolean) => void;
    resetMapState: () => void;
}
