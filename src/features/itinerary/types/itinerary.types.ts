export type ItineraryStatus = 'ongoing' | 'upcoming' | 'past';

/**
 * Represents a stop/destination within an itinerary
 */
export interface ItineraryStop {
    id: string;
    name: string;
    /** Duration in minutes at this stop */
    durationMinutes: number;
    /** Optional image URL for the stop */
    imageUrl?: string;
    /** Order in the itinerary */
    order: number;
}

export interface Itinerary {
    id: string;
    title: string;
    startDate: string;
    endDate?: string;
    status: ItineraryStatus;
    locations?: string[];
    note?: string;
    /** User-uploaded cover image URL (optional, defaults to first stop's image) */
    coverImageUrl?: string;
    /** Stops/destinations in the itinerary */
    stops?: ItineraryStop[];
}

/**
 * Helper to get the cover image for an itinerary
 * Priority: coverImageUrl > first stop's image > default placeholder
 */
export function getItineraryCoverImage(itinerary: Itinerary): string {
    if (itinerary.coverImageUrl) {
        return itinerary.coverImageUrl;
    }
    if (itinerary.stops?.[0]?.imageUrl) {
        return itinerary.stops[0].imageUrl;
    }
    // Default placeholder
    return 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop';
}

/**
 * Calculate total duration from stops (in hours)
 * Returns null if no stops available
 */
export function calculateItineraryDuration(itinerary: Itinerary): number | null {
    if (!itinerary.stops || itinerary.stops.length === 0) {
        return null;
    }
    const totalMinutes = itinerary.stops.reduce((sum, stop) => sum + stop.durationMinutes, 0);
    return Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal
}

/**
 * Get destinations count from stops or locations
 */
export function getItineraryDestinationsCount(itinerary: Itinerary): number {
    return itinerary.stops?.length ?? itinerary.locations?.length ?? 0;
}

export interface ItineraryShareStop {
    id: string;
    time: string;
    name: string;
    address: string;
    note?: string;
    order: number;
}

export interface ItineraryShareData {
    id: string;
    dayLabel: string;
    date: string;
    stopsCount: number;
    timeRange: string;
    tags: string[];
    stops: ItineraryShareStop[];
}
