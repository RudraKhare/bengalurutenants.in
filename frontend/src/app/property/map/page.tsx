'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';

// Add global Google Maps types
/// <reference types="@types/google.maps" />

interface Property {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  rent: number;
}

const BENGALURU_CENTER = {
  lat: 12.9716,
  lng: 77.5946
};

export default function PropertyMapPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Load properties when component mounts
  const loadProperties = async () => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.PROPERTIES.LIST + '?skip=0&limit=10&city=Bengaluru');
      console.log('🌐 Fetching properties from:', url);
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setProperties(data);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Initialize map when Google Maps script loads
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        // Create the map instance
        const map = new google.maps.Map(mapRef.current!, {
          center: BENGALURU_CENTER,
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy'
        });

        mapInstanceRef.current = map;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add markers for properties
        properties.forEach((property) => {
          const marker = new google.maps.Marker({
            position: { lat: property.latitude, lng: property.longitude },
            map: map,
            title: property.title,
            animation: google.maps.Animation.DROP
          });

          markersRef.current.push(marker);

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="font-weight: 600; margin-bottom: 4px;">${property.title}</h3>
                <p style="font-size: 14px; margin: 4px 0;">Rent: ₹${property.rent.toLocaleString()}</p>
                <a href="/property/${property.id}" 
                   style="color: #2563eb; text-decoration: none; font-size: 14px; display: inline-block; margin-top: 4px;">
                  View Details
                </a>
              </div>
            `,
            maxWidth: 250
          });

          marker.addListener('click', () => {
            infoWindow.open({
              map: map,
              anchor: marker
            });
          });
        });

        console.log('Map tiles loaded');
        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    // Cleanup on unmount
    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
      }
    };
  }, [scriptLoaded, properties]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async`}
        onLoad={() => setScriptLoaded(true)}
        strategy="afterInteractive"
      />
      
      <main className="min-h-screen">
        <div className="h-16 bg-white shadow-sm flex items-center px-4">
          <h1 className="text-xl font-semibold">Properties in Bengaluru</h1>
        </div>
        
        {!mapLoaded && (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        <div 
          ref={mapRef}
          className="w-full h-[calc(100vh-4rem)]"
          style={{ display: mapLoaded ? 'block' : 'none' }}
        />
      </main>
    </>
  );
}