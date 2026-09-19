import type { JournalLocation } from '../types';

let loaderPromise: Promise<typeof google> | null = null;
let isOptionsConfigured = false;
let cachedApiKey: string | null = null;
let apiKeyFetchPromise: Promise<string> | null = null;

/**
 * Retrieves the Google Maps API key from the backend configuration endpoint.
 * Memoizes the key and coalesces in-flight requests.
 */
export async function getMapsApiKey(): Promise<string> {
  if (cachedApiKey !== null) {
    return cachedApiKey;
  }

  if (apiKeyFetchPromise) {
    return apiKeyFetchPromise;
  }

  apiKeyFetchPromise = (async () => {
    try {
      const res = await fetch('/api/maps/config');
      if (!res.ok) {
        cachedApiKey = '';
        return '';
      }
      const json = await res.json();
      cachedApiKey = typeof json?.data?.apiKey === 'string' ? json.data.apiKey : '';
      return cachedApiKey;
    } catch (err) {
      console.warn('Unable to load Maps config from server:', err);
      cachedApiKey = '';
      return '';
    } finally {
      apiKeyFetchPromise = null;
    }
  })();

  return apiKeyFetchPromise;
}

/**
 * Dynamically loads the Google Maps JavaScript API with places, marker, and geocoding libraries.
 * Guards setOptions() to execute strictly once to eliminate redundant configuration warnings.
 */
export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window !== 'undefined' && window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (typeof window !== 'undefined' && (window as any).googleMapsAuthFailed) {
    return Promise.reject(new Error('GOOGLE_MAPS_REFERER_NOT_ALLOWED'));
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  // Synchronously initialize loaderPromise to prevent parallel concurrent setup races
  loaderPromise = (async () => {
    const [apiKey, { setOptions, importLibrary }] = await Promise.all([
      getMapsApiKey(),
      import('@googlemaps/js-api-loader')
    ]);

    if (!apiKey) {
      throw new Error('NO_API_KEY');
    }

    // Ensure setOptions is strictly called once across the entire application runtime
    if (!isOptionsConfigured) {
      setOptions({
        key: apiKey,
        v: 'weekly',
        solutionChannel: 'gmp_mcp_codeassist_v1_aistudio',
      });
      isOptionsConfigured = true;
    }

    await Promise.all([
      importLibrary('maps'),
      importLibrary('places'),
      importLibrary('marker'),
      importLibrary('geocoding')
    ]);

    return window.google;
  })().catch((err) => {
    // Reset loaderPromise to allow retry on transient network errors,
    // while keeping isOptionsConfigured true so setOptions is never called again.
    loaderPromise = null;
    throw err;
  });

  return loaderPromise;
}

export interface ReverseGeocodeResult {
  placeName: string;
  formattedAddress?: string;
  country?: string;
  city?: string;
  lat: number;
  lng: number;
  isFallbackCoordinates: boolean;
  source?: 'google_maps' | 'google_maps_client' | 'osm_fallback' | 'coordinates';
  geocodingApiNotEnabled?: boolean;
}

/**
 * Reverse geocodes latitude/longitude coordinates to a comprehensive address object
 * including formatted address, country, city, and fallback coordinates.
 */
export async function reverseGeocodeDetailed(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  // 1. Primary: Server-side reverse geocoding proxy (uses Google Maps Geocoding API with resilient fallbacks)
  try {
    const res = await fetch(`/api/maps/reverse-geocode?lat=${lat}&lng=${lng}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        // If server resolved a readable address, return it immediately
        if (!json.data.isFallbackCoordinates && json.data.placeName) {
          return json.data as ReverseGeocodeResult;
        }
      }
    }
  } catch (err) {
    console.warn('[Reverse Geocode] Server proxy lookup unavailable, trying client fallback:', err);
  }

  // 2. Secondary: Client-side Google Maps Geocoder if JS API is loaded
  if (typeof window !== 'undefined' && !(window as any).googleMapsAuthFailed) {
    try {
      const googleInstance = await loadGoogleMaps();
      const geocoder = new googleInstance.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });

      if (response.results && response.results.length > 0) {
        const best = response.results[0];
        const formattedAddress = best.formatted_address || '';
        let country = '';
        let city = '';

        if (Array.isArray(best.address_components)) {
          for (const comp of best.address_components) {
            const types = comp.types || [];
            if (types.includes('country') && comp.long_name) {
              country = comp.long_name;
            }
            if ((types.includes('locality') || types.includes('postal_town')) && comp.long_name && !city) {
              city = comp.long_name;
            } else if (types.includes('administrative_area_level_2') && comp.long_name && !city) {
              city = comp.long_name;
            }
          }
        }

        if (formattedAddress) {
          return {
            placeName: formattedAddress,
            formattedAddress,
            country,
            city,
            lat,
            lng,
            isFallbackCoordinates: false,
            source: 'google_maps_client',
          };
        }
      }
    } catch (err) {
      console.warn('[Reverse Geocode] Client-side Google Geocoder unavailable:', err);
    }
  }

  // 3. Final Fallback: Coordinates representation
  return {
    placeName: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
    formattedAddress: '',
    country: '',
    city: '',
    lat,
    lng,
    isFallbackCoordinates: true,
    source: 'coordinates',
  };
}

/**
 * Reverse geocodes latitude/longitude coordinates to a friendly place name string.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const result = await reverseGeocodeDetailed(lat, lng);
  return result.placeName || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
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
