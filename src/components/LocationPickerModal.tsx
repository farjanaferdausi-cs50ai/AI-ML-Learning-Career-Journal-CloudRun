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
  Info
} from 'lucide-react';
import { loadGoogleMaps, reverseGeocode, getMapsApiKey } from '../lib/googleMaps';
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
  const [lat, setLat] = useState<number>(initialLocation?.lat ?? 37.7749);
  const [lng, setLng] = useState<number>(initialLocation?.lng ?? -122.4194);
  const [placeName, setPlaceName] = useState<string>(initialLocation?.placeName ?? '');
  const [isLoadingMap, setIsLoadingMap] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Sync initial state whenever modal opens and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      setLat(initialLocation?.lat ?? 37.7749);
      setLng(initialLocation?.lng ?? -122.4194);
      setPlaceName(initialLocation?.placeName ?? '');
      setGeoError(null);
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

        const currentPos = {
          lat: initialLocation?.lat ?? 37.7749,
          lng: initialLocation?.lng ?? -122.4194,
        };

        // Create Map
        const map = new google.maps.Map(mapContainerRef.current, {
          center: currentPos,
          zoom: initialLocation ? 14 : 11,
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

        // Create Pin Marker
        const marker = new google.maps.Marker({
          position: currentPos,
          map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          title: 'Selected Study Location',
        });

        markerRef.current = marker;

        // Update coordinates on marker drag
        marker.addListener('dragend', async () => {
          const pos = marker.getPosition();
          if (pos) {
            const newLat = pos.lat();
            const newLng = pos.lng();
            setLat(newLat);
            setLng(newLng);
            const address = await reverseGeocode(newLat, newLng);
            if (isMounted) setPlaceName(address);
          }
        });

        // Click on map to drop pin
        map.addListener('click', async (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            marker.setPosition(e.latLng);
            setLat(newLat);
            setLng(newLng);
            const address = await reverseGeocode(newLat, newLng);
            if (isMounted) setPlaceName(address);
          }
        });

        // Setup Places Autocomplete
        if (searchInputRef.current && google.maps.places) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ['geometry', 'name', 'formatted_address'],
          });

          autocomplete.bindTo('bounds', map);
          autocompleteRef.current = autocomplete;

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
              return;
            }

            const newLat = place.geometry.location.lat();
            const newLng = place.geometry.location.lng();
            const chosenName = place.name || place.formatted_address || `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;

            map.setCenter(place.geometry.location);
            map.setZoom(15);
            marker.setPosition(place.geometry.location);

            setLat(newLat);
            setLng(newLng);
            setPlaceName(chosenName);
          });
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

  // Handle "Use Current Location" (Browser Geolocation)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const curLat = pos.coords.latitude;
        const curLng = pos.coords.longitude;
        setLat(curLat);
        setLng(curLng);

        if (mapInstanceRef.current && markerRef.current) {
          const latLng = { lat: curLat, lng: curLng };
          mapInstanceRef.current.setCenter(latLng);
          mapInstanceRef.current.setZoom(15);
          markerRef.current.setPosition(latLng);
        }

        const address = await reverseGeocode(curLat, curLng);
        setPlaceName(address || 'Current Location');
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setGeoError('Location permission was denied. You can search by name or click the map.');
        } else {
          setGeoError('Could not determine current location. Please search or pick on map.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (!placeName && !lat && !lng) {
      onSelectLocation(null);
      onClose();
      return;
    }

    const finalName = placeName.trim() || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
    onSelectLocation({
      lat,
      lng,
      placeName: finalName,
      addedAt: Date.now(),
    });
    onClose();
  };

  const handleRemove = () => {
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
            onClick={onClose}
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
            <div className="relative flex-1">
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
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{geoError}</span>
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

            {mapError && (
              <div className="absolute inset-0 p-4 flex flex-col items-center justify-center bg-[#070e20] z-10 text-center gap-2">
                <Info className="w-6 h-6 text-cyan-400" />
                <p className="text-xs text-slate-300 max-w-md">{mapError}</p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Selected coordinates: <span className="text-cyan-300">{lat.toFixed(4)}°, {lng.toFixed(4)}°</span>
                </div>
              </div>
            )}

            {/* Interactive Map DOM node */}
            <div ref={mapContainerRef} className="w-full h-full" tabIndex={0} aria-label="Interactive Google Map" />
          </div>

          {/* Instructions note */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>💡 Click anywhere on the map or drag the pin to adjust</span>
            <span className="text-cyan-300">
              {lat ? `${lat.toFixed(4)}°, ${lng.toFixed(4)}°` : 'No coords'}
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
              onClick={onClose}
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
