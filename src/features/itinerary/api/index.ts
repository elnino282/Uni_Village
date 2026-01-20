/**
 * Itinerary API Client
 * Integration with backend API for tours, check-ins, and AI suggestions
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
    TourResponse,
    TourRequest,
    TourStopRequest,
    TourStopResponse,
    CheckInRequest,
    CheckInResponse,
    ItinerarySuggestRequest,
    SuggestedItinerary,
    TourStatus,
} from '../types/itinerary.types';

// ============================================
// Tours (Itineraries)
// ============================================

/**
 * Get user's tours with optional status filter
 */
export async function getMyTours(status?: TourStatus, page = 0, size = 10) {
    const response = await apiClient.get<{
        code: number;
        message: string;
        result: {
            content: TourResponse[];
            totalElements: number;
            totalPages: number;
        };
    }>(API_ENDPOINTS.TOURS.MY_TOURS, {
        params: { status, page, size },
    });
    return response.data.result;
}

/**
 * Get current ongoing tour
 */
export async function getCurrentTour() {
    const response = await apiClient.get<{
        code: number;
        message: string;
        result: TourResponse | null;
    }>(API_ENDPOINTS.TOURS.CURRENT_TOUR);
    return response.data.result;
}

/**
 * Create a new tour
 */
export async function createTour(data: TourRequest) {
    const response = await apiClient.post<{
        code: number;
        message: string;
        result: TourResponse;
    }>(API_ENDPOINTS.TOURS.CREATE, data);
    return response.data.result;
}

/**
 * Get tour details by ID
 */
export async function getTourById(id: number) {
    const response = await apiClient.get<{
        code: number;
        message: string;
        result: TourResponse;
    }>(API_ENDPOINTS.TOURS.DETAIL(id));
    return response.data.result;
}

/**
 * Update tour
 */
export async function updateTour(id: number, data: TourRequest) {
    const response = await apiClient.patch<{
        code: number;
        message: string;
        result: TourResponse;
    }>(API_ENDPOINTS.TOURS.UPDATE(id), data);
    return response.data.result;
}

/**
 * Complete tour
 */
export async function completeTour(id: number) {
    const response = await apiClient.post<{
        code: number;
        message: string;
        result: TourResponse;
    }>(API_ENDPOINTS.TOURS.COMPLETE(id));
    return response.data.result;
}

/**
 * Cancel tour
 */
export async function cancelTour(id: number) {
    const response = await apiClient.post<{
        code: number;
        message: string;
        result: TourResponse;
    }>(API_ENDPOINTS.TOURS.CANCEL(id));
    return response.data.result;
}

/**
 * Copy tour (reuse itinerary)
 */
export async function copyTour(id: number) {
    const response = await apiClient.post<{
        code: number;
        message: string;
        result: TourResponse;
    }>(API_ENDPOINTS.TOURS.COPY(id));
    return response.data.result;
}

// ============================================
// Tour Stops
// ============================================

/**
 * Get stops for a tour
 */
export async function getTourStops(tourId: number) {
    const response = await apiClient.get<{
        code: number;
        message: string;
        result: TourStopResponse[];
    }>(API_ENDPOINTS.TOUR_STOPS.LIST(tourId));
    return response.data.result;
}

/**
 * Add stop to tour
 */
export async function addTourStop(tourId: number, data: TourStopRequest) {
    const response = await apiClient.post<{
        code: number;
        message: string;
        result: TourStopResponse;
    }>(API_ENDPOINTS.TOUR_STOPS.ADD(tourId), data);
    return response.data.result;
}

/**
 * Reorder tour stops
 */
export async function reorderTourStops(tourId: number, stopIds: number[]) {
    const response = await apiClient.put<{
        code: number;
        message: string;
        result: TourStopResponse[];
    }>(API_ENDPOINTS.TOUR_STOPS.REORDER(tourId), { stopIds });
    return response.data.result;
}

/**
 * Remove stop from tour
 */
export async function removeTourStop(tourId: number, stopId: number) {
    await apiClient.delete(API_ENDPOINTS.TOUR_STOPS.REMOVE(tourId, stopId));
}

// ============================================
// Check-ins
// ============================================

/**
 * Check in at a place
 */
export async function checkIn(data: CheckInRequest) {
    const response = await apiClient.post<{
        code: number;
        message: string;
        result: CheckInResponse;
    }>(API_ENDPOINTS.CHECK_INS.CREATE, data);
    return response.data.result;
}

/**
 * Get user's check-in history
 */
export async function getMyCheckIns(
    filters?: {
        placeId?: number;
        tourId?: number;
        from?: string;
        to?: string;
    },
    page = 0,
    size = 10
) {
    const response = await apiClient.get<{
        code: number;
        message: string;
        result: {
            content: CheckInResponse[];
            totalElements: number;
            totalPages: number;
        };
    }>(API_ENDPOINTS.CHECK_INS.MY_CHECK_INS, {
        params: { ...filters, page, size },
    });
    return response.data.result;
}

// ============================================
// AI Itinerary Suggestions
// ============================================

/**
 * Get AI-powered itinerary suggestions
 */
export async function suggestItinerary(data: ItinerarySuggestRequest) {
    const response = await apiClient.post<SuggestedItinerary>(
        API_ENDPOINTS.AI.SUGGEST_ITINERARY,
        data
    );
    return response.data;
}

export {};
