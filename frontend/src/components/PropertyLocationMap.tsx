'use client';

/**
 * PropertyLocationMap Component - Display a single property location on map
 * 
 * Features:
 * - Shows property location with custom pin icon
 * - Non-interactive (view-only)
 * - Auto-centers on property location
 */

import { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_CONFIG } from '@/lib/googleMaps';

interface PropertyLocationMapProps {
  lat: number;
  lng: number;
  address?: string;
  height?: string;
}

export default function PropertyLocationMap({
  lat,
  lng,
  address,
  height = '400px'
}: PropertyLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load Google Maps API
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const { Marker } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        const center = { lat, lng };

        // Create map
        const mapInstance = new Map(mapRef.current!, {
          center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        setMap(mapInstance);

        // Create custom pin icon using SVG
        const pinIcon = {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          fillColor: '#EF4444', // red-500
          fillOpacity: 1,
          strokeColor: '#DC2626', // red-600
          strokeWeight: 2,
          scale: 6,
          anchor: new google.maps.Point(0, 5),
          rotation: 180, // Rotate to point downward
        };

        // Alternative: Using a more traditional pin shape
        const customPinIcon = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#EF4444', // red-500
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 1.5,
          anchor: new google.maps.Point(12, 22),
        };

        // Create marker with custom pin icon
        const marker = new Marker({
          map: mapInstance,
          position: center,
          icon: customPinIcon,
          title: address || 'Property Location',
        });

        // Add info window if address is provided
        if (address) {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">Property Location</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
            </div>`
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });

          // Auto-open info window
          infoWindow.open(mapInstance, marker);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
  }, [lat, lng, address]);

  if (error) {
    return (
      <div 
        style={{ height }} 
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          style={{ height }} 
          className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10"
        >
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg"
      />
    </div>
  );
}
