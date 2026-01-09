export type ItineraryStatus = 'ongoing' | 'upcoming' | 'past';

export interface Itinerary {
    id: string;
    title: string;
    startDate: string;
    endDate?: string;
    status: ItineraryStatus;
    locations?: string[];
    note?: string;
}
