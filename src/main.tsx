// Defensive guard for benign platform WebSocket/HMR and Google Maps RefererNotAllowed errors
if (typeof window !== 'undefined' && window.console) {
  const origErr = window.console.error;
  const isIgnored = (str: string) => {
    return (
      str.includes('[vite] failed to connect to websocket') ||
      str.includes('WebSocket closed without opened') ||
      str.includes('RefererNotAllowedMapError') ||
      str.includes('referer-not-allowed-map-error') ||
      str.includes('Google Maps JavaScript API error')
    );
  };

  const safeError = function (...args: any[]) {
    const text = args.map(a => typeof a === 'string' ? a : (a?.message || a?.stack || String(a))).join(' ');
    if (isIgnored(text)) {
      (window as any).googleMapsAuthFailed = true;
      try {
        window.dispatchEvent(new CustomEvent('google-maps-auth-failure', {
          detail: { siteUrl: window.location.origin + '/' }
        }));
      } catch (_) {}
      return;
    }
    if (origErr) {
      return origErr.apply(window.console, args);
    }
  };

  try {
    Object.defineProperty(window.console, 'error', {
      configurable: true,
      enumerable: true,
      get: () => safeError,
      set: () => {}
    });
  } catch (_) {
    window.console.error = safeError;
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
