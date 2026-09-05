import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import type { JournalLocation } from '../types';

let loaderPromise: Promise<typeof google> | null = null;
let cachedApiKey: string | null = null;

/**
 * Retrieves the Google Maps API key from the backend configuration endpoint.
 */
export async function getMapsApiKey(): Promise<string> {
  if (cachedApiKey !== null) {
    return cachedApiKey;
  }

  try {
    const res = await fetch('/api/maps/config');
    if (!res.ok) {
      cachedApiKey = '';
      return '';
    }
    const json = await res.json();
    cachedApiKey = json?.data?.apiKey || '';
    return cachedApiKey;
  } catch (err) {
    console.warn('Unable to load Maps config from server:', err);
    cachedApiKey = '';
    return '';
  }
}

/**
 * Dynamically loads the Google Maps JavaScript API with places and marker libraries.
 */
export async function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window !== 'undefined' && window.google?.maps) {
    return window.google;
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  const apiKey = await getMapsApiKey();

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  setOptions({
    key: apiKey,
    v: 'weekly',
  });

  loaderPromise = (async () => {
    await Promise.all([
      importLibrary('maps'),
      importLibrary('places'),
      importLibrary('marker'),
      importLibrary('geocoding')
    ]);
    return window.google;
  })().catch((err) => {
    loaderPromise = null;
    throw err;
  });

  return loaderPromise;
}

/**
 * Reverse geocodes latitude/longitude coordinates to a friendly place name.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const googleInstance = await loadGoogleMaps();
    const geocoder = new googleInstance.maps.Geocoder();
    const response = await geocoder.geocode({ location: { lat, lng } });

    if (response.results && response.results.length > 0) {
      // Find the most appropriate formatted address or establishment name
      const best = response.results[0];
      return best.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  } catch (err) {
    console.warn('Reverse geocoding unavailable:', err);
  }
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}

/**
 * Generates an external Google Maps link for the given coordinates or place name.
 */
export function getGoogleMapsUrl(location: JournalLocation): string {
  const query = encodeURIComponent(
    location.placeName || `${location.lat},${location.lng}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=&center=${location.lat},${location.lng}`;
}

/**
 * Generates a Google Maps embed URL for interactive iframe preview.
 */
export function getGoogleMapsEmbedUrl(location: JournalLocation, apiKey?: string): string {
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${location.lat},${location.lng}&zoom=14`;
  }
  return `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=14&output=embed`;
}
