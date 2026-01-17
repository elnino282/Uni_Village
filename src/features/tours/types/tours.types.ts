/**
 * Tours Types
 * TypeScript types for Tours feature
 */

import type { PlaceResponse } from '@/features/places/types/places.types';
import type { TourStatus, Visibility } from '@/shared/types/enums.types';

// ============================================
// Tour Types
// ============================================

export interface TourRequest {
    name: string;
    description?: string;
    startTime?: string;
    endTime?: string;
}

export interface TourResponse {
    id: number;
    userId: number;
    userName: string;
    name: string;
    description: string | null;
    startTime: string | null;
    endTime: string | null;
    status: TourStatus;
    sharedAsPost: boolean;
    originalTourId: number | null;
    stops: TourStopResponse[];
    staticMapUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TourShareRequest {
    postTitle: string;
    visibility?: Visibility;
}

// ============================================
// Tour Stop Types
// ============================================

export interface TourStopRequest {
    placeId: number;
    note?: string;
    sequenceOrder?: number;
}

export interface TourStopResponse {
    id: number;
    tourId: number;
    placeId: number;
    placeName: string;
    sequenceOrder: number;
    note: string | null;
    place: PlaceResponse | null;
}

export interface TourStopReorderRequest {
    stops: TourStopReorderItem[];
}

export interface TourStopReorderItem {
    stopId: number;
    sequenceOrder: number;
}

// ============================================
// Check-in Types
// ============================================

export interface CheckInRequest {
    placeId: number;
    tourId?: number;
    note?: string;
    checkedInAt?: string;
}

export interface CheckInResponse {
    id: number;
    userId: number;
    tourId: number | null;
    placeId: number;
    placeName: string;
    checkedInAt: string;
    note: string | null;
}

// ============================================
// Tour Search Params
// ============================================

export interface TourSearchParams {
    status?: TourStatus;
    page?: number;
    size?: number;
}

export interface CheckInSearchParams {
    placeId?: number;
    tourId?: number;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
}

// ============================================
// AI Itinerary Types
// ============================================

export interface ItinerarySuggestRequest {
    mood?: string;
    startLatitude: number;
    startLongitude: number;
    radiusKm?: number;
    maxStops?: number;
    maxDurationHours?: number;
    placeTypes?: string[];
}

export interface SuggestedItinerary {
    name: string;
    mood: string;
    stops: SuggestedStop[];
    totalDistanceKm: number;
    totalDurationMinutes: number;
    routePolyline: string;
    mapPreviewUrl: string;
}

export interface SuggestedStop {
    sequenceOrder: number;
    googlePlaceId: string;
    placeName: string;
    address: string;
    latitude: number;
    longitude: number;
    rating: number;
    suggestedDurationMinutes: number;
    aiReason: string;
}
