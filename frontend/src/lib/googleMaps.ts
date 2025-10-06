/**
 * Google Maps API configuration and utilities
 */

// Initialize Google Maps API with the new functional API
declare global {
  interface Window {
    google?: {
      maps?: typeof google.maps;
      initMap?: () => void;
    };
  }
}

// Ensure window.google exists
if (typeof window !== 'undefined') {
  window.google = window.google || {};
  window.initMap = () => {
    console.log('Google Maps API loaded');
  };
}

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
 * Load Google Maps API dynamically
 */
export async function loadGoogleMapsAPI(): Promise<void> {
  if (window.google?.maps?.importLibrary) {
    return; // Already loaded
  }

  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=places,geometry&callback=initMap&v=${GOOGLE_MAPS_CONFIG.version}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps script loaded');
        resolve();
      };
      script.onerror = (error) => {
        console.error('Error loading Google Maps:', error);
        reject(new Error('Failed to load Google Maps API'));
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error in loadGoogleMapsAPI:', error);
      reject(error);
    }
  });
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
