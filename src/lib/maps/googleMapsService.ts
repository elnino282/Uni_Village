/**
 * Google Maps Service
 * 
 * Provides navigation and routing functionality.
 * Uses Google Directions API for real routes.
 * Falls back to mock data if API key is not configured.
 * 
 * Required APIs: Directions API
 * Docs: https://developers.google.com/maps/documentation/directions
 */

import { env } from '@/config/env';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface RouteStep {
  distance: string; // e.g., "200 m"
  duration: string; // e.g., "2 phút"
  instruction: string; // e.g., "Rẽ trái vào đường Nguyễn Văn Cừ"
  maneuver?: 'turn-left' | 'turn-right' | 'straight' | 'u-turn' | 'merge' | 'roundabout-left' | 'roundabout-right';
}

export interface NavigationRoute {
  distance: string; // Total distance: "2.5 km"
  duration: string; // Total duration: "8 phút"
  polylinePoints: Location[]; // Array of coordinates for the route
  steps: RouteStep[]; // Turn-by-turn instructions
}

export type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';

export interface DirectionsOptions {
  mode?: TravelMode;
  language?: string;
  alternatives?: boolean;
  avoid?: ('tolls' | 'highways' | 'ferries')[];
}

const DIRECTIONS_API_BASE = 'https://maps.googleapis.com/maps/api/directions/json';

/**
 * Get directions from origin to destination using Google Directions API
 * Falls back to mock data if API key is not configured
 */
export async function getDirections(
  origin: Location,
  destination: Location,
  options: DirectionsOptions = {}
): Promise<NavigationRoute> {
  const apiKey = env.GOOGLE_MAPS_API_KEY;

  // If no API key, use mock data
  if (!apiKey) {
    console.warn('Google Maps API key not configured, using mock data');
    return getMockDirections(origin, destination);
  }

  try {
    const params = new URLSearchParams({
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      mode: options.mode || 'driving',
      language: options.language || 'vi',
      key: apiKey,
    });

    if (options.alternatives) {
      params.append('alternatives', 'true');
    }

    if (options.avoid && options.avoid.length > 0) {
      params.append('avoid', options.avoid.join('|'));
    }

    const response = await fetch(`${DIRECTIONS_API_BASE}?${params}`);

    if (!response.ok) {
      throw new Error(`Directions API HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Directions API error: ${data.status}`);
    }

    return parseDirectionsResponse(data);
  } catch (error) {
    console.error('Error fetching directions:', error);
    // Fallback to mock data on error
    return getMockDirections(origin, destination);
  }
}

/**
 * Get mock directions (fallback when API is unavailable)
 */
function getMockDirections(origin: Location, destination: Location): Promise<NavigationRoute> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const latDiff = destination.latitude - origin.latitude;
      const lngDiff = destination.longitude - origin.longitude;

      resolve({
        distance: '2.5 km',
        duration: '8 phút',
        polylinePoints: [
          origin,
          {
            latitude: origin.latitude + latDiff * 0.3,
            longitude: origin.longitude + lngDiff * 0.3,
          },
          {
            latitude: origin.latitude + latDiff * 0.6,
            longitude: origin.longitude + lngDiff * 0.6,
          },
          destination,
        ],
        steps: [
          {
            distance: '500 m',
            duration: '2 phút',
            instruction: 'Đi thẳng theo đường hiện tại',
            maneuver: 'straight',
          },
          {
            distance: '800 m',
            duration: '3 phút',
            instruction: 'Rẽ trái vào đường Nguyễn Văn Cừ',
            maneuver: 'turn-left',
          },
          {
            distance: '1.2 km',
            duration: '3 phút',
            instruction: 'Tiếp tục đi thẳng, điểm đến ở bên phải',
            maneuver: 'straight',
          },
        ],
      });
    }, 500);
  });
}


/**
 * Parse Google Directions API response to NavigationRoute format
 * This function will be used when you have real API
 */
function parseDirectionsResponse(data: any): NavigationRoute {
  const route = data.routes[0];
  const leg = route.legs[0];

  const steps: RouteStep[] = leg.steps.map((step: any) => ({
    distance: step.distance.text,
    duration: step.duration.text,
    instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
    maneuver: mapManeuver(step.maneuver),
  }));

  const polylinePoints = decodePolyline(route.overview_polyline.points);

  return {
    distance: leg.distance.text,
    duration: leg.duration.text,
    polylinePoints,
    steps,
  };
}

/**
 * Map Google Maps maneuver to our maneuver types
 */
function mapManeuver(maneuver?: string): RouteStep['maneuver'] {
  if (!maneuver) return 'straight';

  const maneuverMap: Record<string, RouteStep['maneuver']> = {
    'turn-left': 'turn-left',
    'turn-right': 'turn-right',
    'straight': 'straight',
    'uturn-left': 'u-turn',
    'uturn-right': 'u-turn',
    'merge': 'merge',
    'roundabout-left': 'roundabout-left',
    'roundabout-right': 'roundabout-right',
  };

  return maneuverMap[maneuver] || 'straight';
}

/**
 * Decode Google Maps polyline to array of coordinates
 * Reference: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(encoded: string): Location[] {
  const points: Location[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}

/**
 * Calculate distance between two points (Haversine formula)
 * Useful for fallback or validation
 */
export function calculateDistance(from: Location, to: Location): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.latitude)) *
    Math.cos(toRad(to.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimate duration based on distance (fallback)
 * Assumes average speed of 30 km/h in city
 */
export function estimateDuration(distanceKm: number): string {
  const hours = distanceKm / 30;
  const minutes = Math.round(hours * 60);

  if (minutes < 60) {
    return `${minutes} phút`;
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} giờ ${m} phút`;
}
