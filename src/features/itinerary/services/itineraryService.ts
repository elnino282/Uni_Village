import type { Itinerary, TourResponse, TourStatus } from '../types/itinerary.types';
import * as itineraryApi from '../api';

/**
 * Itinerary Service - Business logic layer
 * Maps backend responses to frontend types
 */

/**
 * Map backend TourStatus to frontend ItineraryStatus
 */
function mapTourStatusToItineraryStatus(status: TourStatus): 'ongoing' | 'upcoming' | 'past' {
    switch (status) {
        case 'IN_PROGRESS':
            return 'ongoing';
        case 'SCHEDULED':
            return 'upcoming';
        case 'COMPLETED':
        case 'CANCELLED':
            return 'past';
        default:
            return 'upcoming';
    }
}

/**
 * Map backend TourResponse to frontend Itinerary
 */
function mapTourToItinerary(tour: TourResponse): Itinerary {
    return {
        id: tour.id.toString(),
        title: tour.tourName,
        startDate: tour.startDate,
        endDate: tour.status === 'COMPLETED' ? tour.updatedAt : undefined,
        status: mapTourStatusToItineraryStatus(tour.status),
        locations: tour.stops.map(stop => stop.placeName),
        coverImageUrl: tour.stops[0]?.placeImageUrl,
        stops: tour.stops.map(stop => ({
            id: stop.id.toString(),
            name: stop.placeName,
            durationMinutes: 60, // Default 1 hour, adjust as needed
            imageUrl: stop.placeImageUrl,
            order: stop.order,
        })),
    };
}

/**
 * Fetch user's itineraries with optional status filter
 */
export async function fetchItineraries(status?: 'ongoing' | 'upcoming' | 'past'): Promise<Itinerary[]> {
    try {
        // Map frontend status to backend status
        let backendStatus: TourStatus | undefined;
        if (status === 'ongoing') backendStatus = 'IN_PROGRESS';
        else if (status === 'upcoming') backendStatus = 'SCHEDULED';
        else if (status === 'past') backendStatus = 'COMPLETED';

        const result = await itineraryApi.getMyTours(backendStatus, 0, 50);
        return result.content.map(mapTourToItinerary);
    } catch (error) {
        console.error('Failed to fetch itineraries:', error);
        return [];
    }
}

/**
 * Get current ongoing itinerary
 */
export async function getCurrentItinerary(): Promise<Itinerary | null> {
    try {
        const tour = await itineraryApi.getCurrentTour();
        return tour ? mapTourToItinerary(tour) : null;
    } catch (error) {
        console.error('Failed to fetch current itinerary:', error);
        return null;
    }
}

/**
 * Get itinerary details by ID
 */
export async function getItineraryById(id: string): Promise<Itinerary | null> {
    try {
        const tour = await itineraryApi.getTourById(parseInt(id));
        return mapTourToItinerary(tour);
    } catch (error) {
        console.error('Failed to fetch itinerary:', error);
        return null;
    }
}

/**
 * Create a new itinerary
 */
export async function createItinerary(data: {
    tourName: string;
    startDate: Date;
    startTime: Date;
}): Promise<Itinerary> {
    const tour = await itineraryApi.createTour({
        tourName: data.tourName,
        startDate: data.startDate.toISOString(),
        startTime: data.startTime.toISOString(),
    });
    return mapTourToItinerary(tour);
}

/**
 * Complete an itinerary
 */
export async function completeItinerary(id: string): Promise<Itinerary> {
    const tour = await itineraryApi.completeTour(parseInt(id));
    return mapTourToItinerary(tour);
}

/**
 * Copy/reuse an itinerary
 */
export async function copyItinerary(id: string): Promise<Itinerary> {
    const tour = await itineraryApi.copyTour(parseInt(id));
    return mapTourToItinerary(tour);
}

/**
 * Check in at a destination
 */
export async function checkInAtDestination(placeId: number, tourId?: number, tourStopId?: number) {
    return await itineraryApi.checkIn({
        placeId,
        tourId,
        tourStopId,
    });
}

/**
 * Get AI itinerary suggestions
 */
export async function getAISuggestions(data: {
    mood: string;
    budget: string;
    location: { lat: number; lng: number };
}) {
    return await itineraryApi.suggestItinerary({
        mood: data.mood,
        budget: data.budget,
        startLocation: data.location,
    });
}
