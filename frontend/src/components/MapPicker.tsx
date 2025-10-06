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
  lat?: number;
  lng?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

export default function MapPicker({
  lat,
  lng,
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
    if (mapRef.current) {
      const initMap = async () => {
        try {
          // Load Google Maps API
          const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
          const { Marker } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

          const center = {
            lat: lat || GOOGLE_MAPS_CONFIG.defaultCenter.lat,
            lng: lng || GOOGLE_MAPS_CONFIG.defaultCenter.lng
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
            const position = markerInstance.getPosition();
            if (position) {
              const lat = position.lat();
              const lng = position.lng();
              
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
              markerInstance.setPosition(e.latLng);
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              onLocationSelect(lat, lng);
            }
          });

          // Initial reverse geocode if coordinates provided
          if (lat && lng) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat, lng } },
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
    }
  }, []);

  // Update map center and marker when lat/lng change
  useEffect(() => {
    if (map && marker && typeof lat === 'number' && typeof lng === 'number') {
      const newCenter = { lat, lng };
      map.setCenter(newCenter);
      marker.setPosition(newCenter);
    }
  }, [lat, lng, map, marker]);

  // Get current location
  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      return;
    }

    // Check if running in secure context (HTTPS or localhost)
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      toast.error('Geolocation requires HTTPS connection or localhost', { duration: 5000 });
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        console.log('Current location detected:', { lat, lng });
        
        if (map && marker) {
          const newPos = { lat, lng };
          map.setCenter(newPos);
          map.setZoom(16);
          marker.setPosition(newPos);
          
          // Reverse geocode
          try {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ location: newPos });
            
            if (result.results[0]) {
              const address = result.results[0].formatted_address;
              setSelectedAddress(address);
              onLocationSelect(lat, lng, address);
              toast.success('Current location detected successfully!');
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            onLocationSelect(lat, lng);
            toast.success('Location set to current position');
          }
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get current location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your device settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        toast.error(errorMessage, { duration: 5000 });
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
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
