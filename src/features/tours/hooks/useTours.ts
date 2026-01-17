/**
 * Tours Hooks
 * React Query hooks for Tours feature
 */

import { queryKeys } from '@/config/queryKeys';
import { getNextPageParam } from '@/shared/types/pagination.types';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiItineraryApi, checkInsApi, toursApi, tourStopsApi } from '../api/toursApi';
import type {
    CheckInRequest,
    CheckInSearchParams,
    ItinerarySuggestRequest,
    TourRequest,
    TourSearchParams,
    TourShareRequest,
    TourStopReorderRequest,
    TourStopRequest,
} from '../types/tours.types';

// ============================================
// Stale Time Configuration
// ============================================
const STALE_TIME = {
    TOURS: 2 * 60 * 1000,     // 2 minutes for tour list
    CURRENT_TOUR: 30 * 1000,  // 30 seconds for current tour (changes frequently)
    TOUR_DETAIL: 60 * 1000,   // 1 minute for tour detail
    CHECK_INS: 60 * 1000,     // 1 minute for check-ins
};

// ============================================
// Tours Hooks
// ============================================

export function useMyTours(params: TourSearchParams = {}) {
    return useInfiniteQuery({
        queryKey: queryKeys.tours.list(params),
        queryFn: async ({ pageParam = 0 }) => {
            const response = await toursApi.getMyTours({ ...params, page: pageParam });
            return response.result;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => getNextPageParam(lastPage),
        staleTime: STALE_TIME.TOURS,
    });
}

export function useCurrentTour() {
    return useQuery({
        queryKey: queryKeys.tours.current,
        queryFn: async () => {
            const response = await toursApi.getCurrentTour();
            return response.result;
        },
        staleTime: STALE_TIME.CURRENT_TOUR,
    });
}

export function useTourDetail(id: number | undefined) {
    return useQuery({
        queryKey: queryKeys.tours.detail(id!),
        queryFn: async () => {
            const response = await toursApi.getTourById(id!);
            return response.result;
        },
        staleTime: STALE_TIME.TOUR_DETAIL,
        enabled: !!id,
    });
}

export function useCreateTour() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TourRequest) => toursApi.createTour(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
        },
    });
}

export function useUpdateTour() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TourRequest }) => toursApi.updateTour(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.id) });
        },
    });
}

export function useCompleteTour() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => toursApi.completeTour(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
        },
    });
}

export function useCancelTour() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => toursApi.cancelTour(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
        },
    });
}

export function useShareTourAsPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TourShareRequest }) => toursApi.shareAsPost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        },
    });
}

export function useCopyTour() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => toursApi.copyTour(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
        },
    });
}

// ============================================
// Tour Stops Hooks
// ============================================

export function useTourStops(tourId: number | undefined) {
    return useQuery({
        queryKey: queryKeys.tours.stops(tourId!),
        queryFn: async () => {
            const response = await tourStopsApi.getTourStops(tourId!);
            return response.result;
        },
        staleTime: STALE_TIME.TOUR_DETAIL,
        enabled: !!tourId,
    });
}

export function useCreateTourStop() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tourId, data }: { tourId: number; data: TourStopRequest }) =>
            tourStopsApi.createTourStop(tourId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.stops(variables.tourId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.tourId) });
        },
    });
}

export function useReorderTourStops() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tourId, data }: { tourId: number; data: TourStopReorderRequest }) =>
            tourStopsApi.reorderTourStops(tourId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.stops(variables.tourId) });
        },
    });
}

export function useDeleteTourStop() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tourId, stopId }: { tourId: number; stopId: number }) =>
            tourStopsApi.deleteTourStop(tourId, stopId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.stops(variables.tourId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.tours.detail(variables.tourId) });
        },
    });
}

// ============================================
// Check-ins Hooks
// ============================================

export function useMyCheckIns(params: CheckInSearchParams = {}) {
    return useInfiniteQuery({
        queryKey: queryKeys.checkIns.list(params),
        queryFn: async ({ pageParam = 0 }) => {
            const response = await checkInsApi.getMyCheckIns({ ...params, page: pageParam });
            return response.result;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => getNextPageParam(lastPage),
        staleTime: STALE_TIME.CHECK_INS,
    });
}

export function useCreateCheckIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CheckInRequest) => checkInsApi.createCheckIn(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.checkIns.all });
        },
    });
}

// ============================================
// AI Itinerary Hooks
// ============================================

export function useSuggestItinerary() {
    return useMutation({
        mutationFn: (data: ItinerarySuggestRequest) => aiItineraryApi.suggestItinerary(data),
    });
}
