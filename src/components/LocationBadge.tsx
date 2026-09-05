import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ExternalLink, X, Navigation } from 'lucide-react';
import { getGoogleMapsUrl, getGoogleMapsEmbedUrl } from '../lib/googleMaps';
import type { JournalLocation } from '../types';

interface LocationBadgeProps {
  location?: JournalLocation | null;
  className?: string;
  size?: 'sm' | 'md';
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
  location,
  className = '',
  size = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!location || (!location.placeName && !location.lat && !location.lng)) {
    return null;
  }

  const externalMapUrl = getGoogleMapsUrl(location);
  const embedMapUrl = getGoogleMapsEmbedUrl(location);

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Small Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-label={`Location: ${location.placeName}. Click to preview on map.`}
        className={`inline-flex items-center gap-1.5 rounded-full font-mono transition-all cursor-pointer border ${
          size === 'sm'
            ? 'px-2.5 py-0.5 text-[10px]'
            : 'px-3 py-1 text-xs'
        } ${
          isOpen
            ? 'bg-cyan-950/90 border-cyan-400 text-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.3)]'
            : 'bg-[#060f24] hover:bg-[#0b1b3d] border-[#182e5c] hover:border-cyan-500/50 text-cyan-300'
        }`}
      >
        <MapPin className="w-3 h-3 text-[#00F0FF] flex-shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-[200px]">{location.placeName}</span>
      </button>

      {/* Popover Preview Card */}
      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 z-40 w-72 sm:w-80 p-3 rounded-xl bg-[#070e20] border border-cyan-500/40 shadow-2xl backdrop-blur-md animate-fade-in space-y-2.5">
          {/* Popover Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00F0FF] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white font-sans line-clamp-1">{location.placeName}</h4>
                <p className="text-[10px] font-mono text-slate-400">
                  {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close location preview"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Embedded Map Thumbnail */}
          <div className="w-full h-32 rounded-lg overflow-hidden border border-[#14264f] bg-[#050b18] relative">
            <iframe
              title={`Map of ${location.placeName}`}
              width="100%"
              height="100%"
              loading="lazy"
              src={embedMapUrl}
              className="border-0 opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Popover Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-[#121f3d]">
            <span className="text-[9px] font-mono text-slate-400">Study Session Venue</span>
            <a
              href={externalMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-[#00F0FF] hover:text-white flex items-center gap-1 transition-colors font-semibold"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
