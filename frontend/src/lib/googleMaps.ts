/**
 * Google Maps API configuration and utilities
 */

// Initialize Google Maps API with the new functional API
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

// Prevent errors during SSR
const isClient = typeof window !== 'undefined';

export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDFJf8xF1HeZO68GWFGmIUyPRSeNhCGJ2s',
  version: 'weekly',
  libraries: ['places', 'geometry', 'marker'] as const,
  // Default center: India (Center of India near Nagpur)
  defaultCenter: {
    lat: 20.5937,
    lng: 78.9629
  },
  defaultZoom: 5
};

/**
 * Load Google Maps API dynamically with proper initialization for importLibrary
 */
let googleMapsPromise: Promise<void> | null = null;

export async function loadGoogleMapsAPI(): Promise<void> {
  // Return existing promise if already loading
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Return immediately if already loaded
  if (isClient && window.google && window.google.maps) {
    return Promise.resolve();
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (!isClient) {
      reject(new Error('Google Maps can only be loaded in browser environment'));
      return;
    }

    // Clean up any existing scripts
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Setup the callback
    window.initMap = () => {
      resolve();
    };

    // Create and append the script
    const script = document.createElement('script');
    const libraries = GOOGLE_MAPS_CONFIG.libraries.join(',');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=${libraries}&v=${GOOGLE_MAPS_CONFIG.version}&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      googleMapsPromise = null; // Reset promise on error
      reject(new Error('Failed to load Google Maps API'));
    };
    
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export const MAP_STYLES = {
  // Cluster style for multiple markers
  clusterStyles: [
    {
      textColor: 'white',
      url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzM5ODFmZiIvPjwvc3ZnPg==',
      height: 40,
      width: 40
    },
    {
      textColor: 'white',
      url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSIyNSIgZmlsbD0iIzI1NjNlYiIvPjwvc3ZnPg==',
      height: 50,
      width: 50
    },
    {
      textColor: 'white',
      url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIgZmlsbD0iIzE1NDNiYSIvPjwvc3ZnPg==',
      height: 60,
      width: 60
    }
  ]
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Get user's current location using browser geolocation API
 */
export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}
