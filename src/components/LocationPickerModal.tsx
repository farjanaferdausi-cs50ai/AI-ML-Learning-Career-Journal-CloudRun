import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  Navigation, 
  X, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  Trash2,
  Info,
  AlertTriangle,
  Copy
} from 'lucide-react';
import { loadGoogleMaps, reverseGeocode, reverseGeocodeDetailed, type ReverseGeocodeResult, getMapsApiKey } from '../lib/googleMaps';
import type { JournalLocation } from '../types';

interface LocationPickerModalProps {
  isOpen: boolean;
  initialLocation?: JournalLocation | null;
  onClose: () => void;
  onSelectLocation: (location: JournalLocation | null) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  initialLocation,
  onClose,
  onSelectLocation,
}) => {
  const [lat, setLat] = useState<number | null>(initialLocation?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initialLocation?.lng ?? null);
  const [accuracy, setAccuracy] = useState<number | null>(initialLocation?.accuracy ?? null);
  const [placeName, setPlaceName] = useState<string>(initialLocation?.placeName ?? '');
  const [latestDetails, setLatestDetails] = useState<ReverseGeocodeResult | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoErrorType, setGeoErrorType] = useState<'denied' | 'unavailable' | 'timeout' | 'generic' | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isReferrerRestricted, setIsReferrerRestricted] = useState<boolean>(false);
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const autocompleteElementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  // Listen for Google Maps referrer or authentication failure
  useEffect(() => {
    const handleAuthFailure = (e: any) => {
      setIsReferrerRestricted(true);
      const origin = e?.detail?.siteUrl || (typeof window !== 'undefined' ? `${window.location.origin}/` : '');
      setSiteUrl(origin);
      setIsLoadingMap(false);
      setMapError('Google Maps API key is restricted by HTTP Referrer in Google Cloud Console.');
    };

    window.addEventListener('google-maps-auth-failure', handleAuthFailure);
    if (typeof window !== 'undefined' && (window as any).googleMapsAuthFailed) {
      handleAuthFailure({ detail: { siteUrl: `${window.location.origin}/` } });
    }

    return () => {
      window.removeEventListener('google-maps-auth-failure', handleAuthFailure);
    };
  }, []);

  // Sync initial state whenever modal opens and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      setLat(initialLocation?.lat ?? null);
      setLng(initialLocation?.lng ?? null);
      setPlaceName(initialLocation?.placeName ?? '');
      setGeoError(null);
      setGeoErrorType(null);
      setMapError(null);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, initialLocation, onClose]);

  // Initialize Google Maps when modal is open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingMap(true);

    async function initMap() {
      try {
        if (typeof window !== 'undefined' && (window as any).googleMapsAuthFailed) {
          setIsReferrerRestricted(true);
          setSiteUrl(`${window.location.origin}/`);
          setIsLoadingMap(false);
          setMapError('Google Maps API key is restricted by HTTP Referrer in Google Cloud Console.');
          return;
        }

        const apiKey = await getMapsApiKey();
        if (!isMounted) return;

        if (!apiKey) {
          setHasApiKey(false);
          setIsLoadingMap(false);
          setMapError('Google Maps API key is not configured in environment (GOOGLE_MAPS_API_KEY). You can still enter a location name manually.');
          return;
        }

        setHasApiKey(true);
        const google = await loadGoogleMaps();
        if (!isMounted || !mapContainerRef.current) return;

        const currentPos = (initialLocation?.lat != null && initialLocation?.lng != null)
          ? { lat: initialLocation.lat, lng: initialLocation.lng }
          : null;

        // Create Map
        const map = new google.maps.Map(mapContainerRef.current, {
          center: currentPos || { lat: 20, lng: 0 },
          zoom: currentPos ? 14 : 2,
          mapId: 'DEMO_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#09152e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#09152e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#7492bd' }] },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#00F0FF' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#6ee7b7' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{ color: '#0a233a' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#172f5d' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#112247' }],
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#93b4e3' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#050c1f' }],
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#3b82f6' }],
            },
          ],
        });

        mapInstanceRef.current = map;

        // Create Advanced Marker (hidden until location is set)
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: currentPos || null,
          map: currentPos ? map : null,
          gmpDraggable: true,
          title: 'Selected Study Location',
        });

        markerRef.current = marker;

        // Update coordinates on marker drag
        marker.addListener('dragend', async () => {
          const pos = marker.position;
          if (pos) {
            const newLat = typeof (pos as any).lat === 'function' ? (pos as any).lat() : (pos as any).lat;
            const newLng = typeof (pos as any).lng === 'function' ? (pos as any).lng() : (pos as any).lng;
            if (typeof newLat === 'number' && typeof newLng === 'number') {
              setLat(newLat);
              setLng(newLng);
              try {
                const details = await reverseGeocodeDetailed(newLat, newLng);
                if (isMounted) {
                  setLatestDetails(details);
                  setPlaceName(details.placeName || `${newLat.toFixed(4)}°, ${newLng.toFixed(4)}°`);
                }
              } catch {
                if (isMounted) setPlaceName(`${newLat.toFixed(4)}°, ${newLng.toFixed(4)}°`);
              }
            }
          }
        });

        // Click on map to drop or reposition pin
        map.addListener('click', async (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            marker.position = { lat: newLat, lng: newLng };
            marker.map = map;
            setLat(newLat);
            setLng(newLng);
            try {
              const details = await reverseGeocodeDetailed(newLat, newLng);
              if (isMounted) {
                setLatestDetails(details);
                setPlaceName(details.placeName || `${newLat.toFixed(4)}°, ${newLng.toFixed(4)}°`);
              }
            } catch {
              if (isMounted) setPlaceName(`${newLat.toFixed(4)}°, ${newLng.toFixed(4)}°`);
            }
          }
        });

        // Setup Places Autocomplete using modern PlaceAutocompleteElement
        if (autocompleteContainerRef.current && google.maps.places?.PlaceAutocompleteElement) {
          autocompleteContainerRef.current.innerHTML = '';
          const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
          placeAutocomplete.setAttribute('placeholder', 'Search place, city, or campus...');
          placeAutocomplete.style.width = '100%';
          placeAutocomplete.style.colorScheme = 'dark';
          autocompleteContainerRef.current.appendChild(placeAutocomplete);
          autocompleteElementRef.current = placeAutocomplete;

          const handlePlaceSelect = async (event: any) => {
            try {
              const prediction = event.placePrediction;
              const place = prediction ? prediction.toPlace() : (event.place || null);
              if (!place) return;

              if (typeof place.fetchFields === 'function') {
                await place.fetchFields({
                  fields: ['displayName', 'formattedAddress', 'location'],
                });
              }

              const loc = place.location;
              if (loc) {
                const newLat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
                const newLng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
                const chosenName = place.displayName || place.formattedAddress || `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;

                map.setCenter({ lat: newLat, lng: newLng });
                map.setZoom(15);
                if (markerRef.current) {
                  markerRef.current.position = { lat: newLat, lng: newLng };
                  markerRef.current.map = map;
                }

                setLat(newLat);
                setLng(newLng);
                setPlaceName(chosenName);
              }
            } catch (err) {
              console.warn('Error resolving place selection:', err);
            }
          };

          placeAutocomplete.addEventListener('gmp-select', handlePlaceSelect);
          placeAutocomplete.addEventListener('gmp-placeselect', handlePlaceSelect);
        }

        setIsLoadingMap(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Google Maps failed to initialize:', err);
        setIsLoadingMap(false);
        setMapError('Unable to load Google Maps view. You can still enter the place name or coordinates manually.');
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle "Use Current Location" (Browser Geolocation) with high accuracy and distinct error states
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
      setGeoErrorType('generic');
      setGeoError('Geolocation is not supported by your browser or device.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);
    setGeoErrorType(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const curLat = pos.coords.latitude;
        const curLng = pos.coords.longitude;
        const curAccuracy = typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null;
        setLat(curLat);
        setLng(curLng);
        setAccuracy(curAccuracy);

        if (mapInstanceRef.current && markerRef.current) {
          const latLng = { lat: curLat, lng: curLng };
          mapInstanceRef.current.setCenter(latLng);
          mapInstanceRef.current.setZoom(15);
          markerRef.current.position = latLng;
          markerRef.current.map = mapInstanceRef.current;
        }

        try {
          const details = await reverseGeocodeDetailed(curLat, curLng);
          setLatestDetails(details);
          setPlaceName(details.placeName || `${curLat.toFixed(4)}°, ${curLng.toFixed(4)}°`);
        } catch {
          setPlaceName(`${curLat.toFixed(4)}°, ${curLng.toFixed(4)}°`);
        }
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1 || err.code === (err as any).PERMISSION_DENIED) {
          setGeoErrorType('denied');
          setGeoError('Location permission denied. Please allow location access in your browser or device settings, or search manually.');
        } else if (err.code === 2 || err.code === (err as any).POSITION_UNAVAILABLE) {
          setGeoErrorType('unavailable');
          setGeoError('Position unavailable: Device could not determine its location. Please check GPS or network connectivity.');
        } else if (err.code === 3 || err.code === (err as any).TIMEOUT) {
          setGeoErrorType('timeout');
          setGeoError('Location request timed out after 10 seconds. Device GPS took too long to respond.');
        } else {
          setGeoErrorType('generic');
          setGeoError(err.message || 'Could not determine current location. Please search or pick on map.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleConfirm = () => {
    if (!placeName.trim() && (lat === null || lng === null)) {
      onSelectLocation(null);
      onClose();
      return;
    }

    if (lat !== null && lng !== null) {
      const finalName = placeName.trim() || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
      onSelectLocation({
        lat,
        lng,
        accuracy: accuracy ?? undefined,
        placeName: finalName,
        formattedAddress: latestDetails?.formattedAddress || finalName,
        city: latestDetails?.city,
        country: latestDetails?.country,
        isFallbackCoordinates: latestDetails?.isFallbackCoordinates,
        addedAt: Date.now(),
      });
    } else if (placeName.trim()) {
      onSelectLocation({
        lat: 0,
        lng: 0,
        placeName: placeName.trim(),
        addedAt: Date.now(),
      });
    }
    onClose();
  };

  const handleRemove = () => {
    if (markerRef.current) {
      markerRef.current.map = null;
      markerRef.current.position = null;
    }
    onSelectLocation(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-picker-title"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#070e20] border border-[#142347] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#121f3d] flex items-center justify-between bg-gradient-to-r from-[#091533] to-[#070e20]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 id="location-picker-title" className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Tag Study Location
              </h2>
              <p className="text-xs text-slate-400">
                Pin where you studied today (home, campus, lab, co-working space)
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close location picker"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Search Bar & Geolocation Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <div 
                ref={autocompleteContainerRef} 
                className={`w-full min-h-[38px] ${hasApiKey && !mapError ? 'block' : 'hidden'}`}
              />
              {(!hasApiKey || mapError) && (
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search place, city, or campus..."
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    aria-label="Search place name or address"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#050b18] border border-[#182a52] text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              aria-label="Use current location via device GPS"
              className="px-3.5 py-2 rounded-xl bg-[#091533] hover:bg-[#0f2452] border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Use Current Location</span>
                </>
              )}
            </button>
          </div>

          {/* Geo Error Alert */}
          {geoError && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>{geoError}</span>
              </div>
              {(geoErrorType === 'timeout' || geoErrorType === 'unavailable') && (
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-mono whitespace-nowrap cursor-pointer transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Map Container View */}
          <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-[#182a52] bg-[#050b18]">
            {isLoadingMap && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070e20] z-10 gap-2">
                <Loader2 className="w-6 h-6 text-[#00F0FF] animate-spin" />
                <span className="text-xs font-mono text-slate-400">Loading Google Maps...</span>
              </div>
            )}

            {isReferrerRestricted ? (
              <div className="absolute inset-0 p-4 flex flex-col justify-between bg-[#070e20] z-20 overflow-y-auto text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                      Google Maps Domain Restriction Detected
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    This API key is restricted by HTTP referrer in Google Cloud Console. To authorize vector maps here, add this URL to your API key's Website restrictions in Google Cloud Console:
                  </p>
                  <div className="p-2 rounded-lg bg-[#050b18] border border-[#182a52] flex items-center justify-between gap-2">
                    <code className="text-[11px] text-[#00F0FF] font-mono break-all select-all">
                      {siteUrl ? `${siteUrl}*` : `${typeof window !== 'undefined' ? window.location.origin : ''}/*`}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        const text = siteUrl ? `${siteUrl}*` : `${window.location.origin}/*`;
                        navigator.clipboard.writeText(text);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded bg-[#091533] border border-cyan-500/40 text-cyan-300 hover:text-white text-[10px] font-mono flex items-center gap-1 hover:bg-[#0f2452] cursor-pointer flex-shrink-0"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                </div>

                {/* Fallback Location Preview */}
                <div className="mt-2 pt-2 border-t border-[#142347]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
                    <span>Fallback Map Preview:</span>
                    <span className="text-cyan-300">
                      {lat !== null && lng !== null ? `${lat.toFixed(4)}°, ${lng.toFixed(4)}°` : 'None'}
                    </span>
                  </div>
                  {lat !== null && lng !== null ? (
                    <div className="w-full h-24 rounded-lg overflow-hidden border border-[#182a52] relative bg-slate-900">
                      <iframe
                        title="Location Preview"
                        className="w-full h-full border-0 pointer-events-none opacity-85"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
                      />
                    </div>
                  ) : (
                    <div className="w-full py-3 rounded-lg border border-[#182a52] bg-slate-900/60 text-center text-[10px] text-slate-400 font-mono">
                      No coordinates selected
                    </div>
                  )}
                </div>
              </div>
            ) : mapError ? (
              <div className="absolute inset-0 p-4 flex flex-col items-center justify-center bg-[#070e20] z-10 text-center gap-2">
                <Info className="w-6 h-6 text-cyan-400" />
                <p className="text-xs text-slate-300 max-w-md">{mapError}</p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Selected coordinates: <span className="text-cyan-300">{lat !== null && lng !== null ? `${lat.toFixed(4)}°, ${lng.toFixed(4)}°` : 'None'}</span>
                </div>
              </div>
            ) : null}

            {/* Interactive Map DOM node */}
            <div ref={mapContainerRef} className="w-full h-full" tabIndex={0} aria-label="Interactive Google Map" />
          </div>

          {/* Instructions note */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>💡 Click anywhere on the map or drag the pin to adjust</span>
            <span className="text-cyan-300">
              {lat !== null && lng !== null ? `${lat.toFixed(4)}°, ${lng.toFixed(4)}°` : 'No coords'}
            </span>
          </div>

          {/* Location Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300 block">
              Place Label / Location Name:
            </label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Home Office, Ostad Lab, University Library..."
              className="w-full px-3 py-2 rounded-xl bg-[#050b18] border border-[#182a52] text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#121f3d] bg-[#050b18] flex items-center justify-between gap-2">
          {initialLocation ? (
            <button
              onClick={handleRemove}
              className="px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Location</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              Skip Location
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#091533] hover:bg-[#0f2452] text-slate-300 text-xs font-mono border border-[#1a2e5c] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#00F0FF] hover:from-blue-500 hover:to-cyan-300 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
