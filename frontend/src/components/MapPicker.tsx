'use client';

/**
 * MapPicker Component - Interactive map for selecting property location
 * 
 * Features:
 * - Draggable marker for precise location selection
 * - Current location detection
 * - Address geocoding
 * - Reverse geocoding on marker drag
 */

import { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_CONFIG } from '@/lib/googleMaps';
import toast from 'react-hot-toast';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

export default function MapPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  height = '400px'
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        // Load Google Maps API
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const { Marker } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        const center = {
          lat: initialLat || GOOGLE_MAPS_CONFIG.defaultCenter.lat,
          lng: initialLng || GOOGLE_MAPS_CONFIG.defaultCenter.lng
        };

        const mapInstance = new Map(mapRef.current!, {
          center,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          mapId: 'map-picker'
        });

        setMap(mapInstance);

        // Create draggable marker
        const markerInstance = new Marker({
          position: center,
          map: mapInstance,
          draggable: true,
          title: 'Drag to adjust location'
        });

        setMarker(markerInstance);

        // Handle marker drag
        markerInstance.addListener('dragend', async () => {
          const position = markerInstance.position;
          if (position) {
            const lat = typeof position.lat === 'function' ? position.lat() : position.lat;
            const lng = typeof position.lng === 'function' ? position.lng() : position.lng;
            
            // Reverse geocode to get address
            try {
              const geocoder = new google.maps.Geocoder();
              const result = await geocoder.geocode({ location: { lat, lng } });
              
              if (result.results[0]) {
                const address = result.results[0].formatted_address;
                setSelectedAddress(address);
                onLocationSelect(lat, lng, address);
                
                // Show info window with address
                const infoWindow = new google.maps.InfoWindow({
                  content: `<div style="padding: 8px;">
                    <strong>Selected Location</strong><br/>
                    ${address}
                  </div>`
                });
                infoWindow.open(mapInstance, markerInstance);
              }
            } catch (error) {
              console.error('Reverse geocoding failed:', error);
              onLocationSelect(lat, lng);
            }
          }
        });

        // Handle map click to move marker
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            markerInstance.position = e.latLng;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            onLocationSelect(lat, lng);
          }
        });

        // Initial reverse geocode if coordinates provided
        if (initialLat && initialLng) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: initialLat, lng: initialLng } },
            (results, status) => {
              if (status === 'OK' && results?.[0]) {
                setSelectedAddress(results[0].formatted_address);
              }
            }
          );
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        toast.error('Failed to load map');
      }
    };

    initMap();
  }, []);

  // Get current location
  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (map && marker) {
          const newPos = { lat, lng };
          map.setCenter(newPos);
          map.setZoom(16);
          marker.position = newPos;
          
          // Reverse geocode
          try {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ location: newPos });
            
            if (result.results[0]) {
              const address = result.results[0].formatted_address;
              setSelectedAddress(address);
              onLocationSelect(lat, lng, address);
              toast.success('Current location detected');
            }
          } catch (error) {
            onLocationSelect(lat, lng);
            toast.success('Location set to current position');
          }
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get current location');
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          📍 Drag the pin to select exact location
        </p>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          {isLoadingLocation ? (
            <>
              <span className="animate-spin">⌛</span>
              Detecting...
            </>
          ) : (
            <>
              📍 Use Current Location
            </>
          )}
        </button>
      </div>

      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-300 shadow-sm"
      />

      {selectedAddress && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700">Selected Address:</p>
          <p className="text-sm text-gray-600 mt-1">{selectedAddress}</p>
        </div>
      )}
    </div>
  );
}
