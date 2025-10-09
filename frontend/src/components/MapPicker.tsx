'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GOOGLE_MAPS_CONFIG, loadGoogleMapsAPI } from '@/lib/googleMaps';
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
    if (!mapRef.current) return;

    let isMounted = true;
    let mapInstance: google.maps.Map | null = null;
    let markerInstance: google.maps.Marker | null = null;

    const initMap = async () => {
      try {
        await loadGoogleMapsAPI();
        
        if (!isMounted || !mapRef.current) return;

        const center = {
          lat: lat ?? GOOGLE_MAPS_CONFIG.defaultCenter.lat,
          lng: lng ?? GOOGLE_MAPS_CONFIG.defaultCenter.lng
        };

        mapInstance = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          mapId: 'map-picker'
        });

        markerInstance = new window.google.maps.Marker({
          position: center,
          map: mapInstance,
          draggable: true,
          title: 'Drag to adjust location'
        });

        setMap(mapInstance);
        setMarker(markerInstance);

        // Handle marker drag
        markerInstance.addListener('dragend', async () => {
          const position = markerInstance?.getPosition();
          if (!position) return;

          const newLat = position.lat();
          const newLng = position.lng();
          
          try {
            const geocoder = new window.google.maps.Geocoder();
            const { results } = await geocoder.geocode({ 
              location: { lat: newLat, lng: newLng } 
            });
          
            if (results?.[0]) {
              const address = results[0].formatted_address;
              setSelectedAddress(address);
              onLocationSelect(newLat, newLng, address);

              const infoWindow = new window.google.maps.InfoWindow({
                content: `<div style="padding: 8px;">
                  <strong>Selected Location</strong><br/>
                  ${address}
                </div>`
              });

              infoWindow.open(mapInstance, markerInstance);
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            onLocationSelect(newLat, newLng);
          }
        });

        // Handle map click
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          const clickedPos = e.latLng;
          if (clickedPos && markerInstance) {
            markerInstance.setPosition(clickedPos);
            onLocationSelect(clickedPos.lat(), clickedPos.lng());
          }
        });

        // Initial reverse geocode
        if (lat && lng) {
          const geocoder = new window.google.maps.Geocoder();
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
        console.error('Error initializing map:', error);
        toast.error('Failed to load map');
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance = null;
      }
      if (markerInstance) {
        markerInstance = null;
      }
    };
  }, [lat, lng, onLocationSelect]);

  // Handle current location
  const handleGetCurrentLocation = useCallback(async () => {
    if (!map || !marker) return;

    setIsLoadingLocation(true);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      if (typeof window !== 'undefined' && window.isSecureContext === false) {
        throw new Error('Geolocation requires HTTPS connection');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });

      const { latitude: newLat, longitude: newLng } = position.coords;
      const newPos = { lat: newLat, lng: newLng };

      map.setCenter(newPos);
      map.setZoom(16);
      marker.setPosition(newPos);

      // Reverse geocode
      const geocoder = new window.google.maps.Geocoder();
      const { results } = await geocoder.geocode({ location: newPos });

      if (results?.[0]) {
        const address = results[0].formatted_address;
        setSelectedAddress(address);
        onLocationSelect(newLat, newLng, address);
        toast.success('Current location detected successfully!');
      }

    } catch (error) {
      console.error('Geolocation error:', error);
      let message = 'Unable to get current location';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
      }
      
      toast.error(message);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [map, marker, onLocationSelect]);

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
