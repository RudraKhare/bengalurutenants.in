'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

interface Property {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  rent: number;
}

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

const BENGALURU_CENTER = {
  lat: 12.9716,
  lng: 77.5946
};

export default function PropertyMapPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Load properties when component mounts
  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProperties(data);
        }
      })
      .catch(err => console.error('Error loading properties:', err));
  }, []);

  // Initialize map when Google Maps script loads
  useEffect(() => {
    window.initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
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
        fullscreenControl: true
      });

      // Add markers for properties
      properties.forEach((property) => {
        const marker = new window.google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map: mapInstanceRef.current,
          title: property.title,
          animation: google.maps.Animation.DROP
        });

        const infoWindow = new window.google.maps.InfoWindow({
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
            map: mapInstanceRef.current,
            anchor: marker
          });
        });
      });
    };
  }, [properties]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`}
        onLoad={() => setScriptLoaded(true)}
        strategy="afterInteractive"
      />
      
      <main className="min-h-screen">
        <div className="h-16 bg-white shadow-sm flex items-center px-4">
          <h1 className="text-xl font-semibold">Properties in Bengaluru</h1>
        </div>
        
        {!scriptLoaded && (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        <div 
          ref={mapRef}
          className="w-full h-[calc(100vh-4rem)]"
          style={{ display: scriptLoaded ? 'block' : 'none' }}
        />
      </main>
    </>
  );
}