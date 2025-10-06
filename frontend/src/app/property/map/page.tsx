'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

// Import Google Maps types
import '@types/google.maps';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

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
}
}
}
        
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru center
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        googleMapRef.current = map;
        setMapLoaded(true);

        // Clean up old markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add markers for each property
        properties.forEach((property: Property) => {
          const marker = new google.maps.Marker({
            position: { lat: property.latitude, lng: property.longitude },
            map,
            title: property.title,
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
            `
          });

          marker.addListener('click', () => {
            infoWindow.open({
              map,
              anchor: marker,
            });
          });
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Load properties and initialize map
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        void initMap();
      })
      .catch(err => console.error('Error loading properties:', err));

    // Cleanup function
    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
      }
    };
  }, []); // Empty dependency array since we handle property updates inside

  return (
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
  );
}
      const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru center
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add markers for each property
      properties.forEach(property => {
        const marker = new google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map,
          title: property.title,
        });

        // Add click listener to show info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${property.title}</h3>
              <p class="text-sm">Rent: ₹${property.rent.toLocaleString()}</p>
              <a href="/property/${property.id}" class="text-blue-600 hover:underline text-sm">View Details</a>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      setMapLoaded(true);
    });
  }, [properties]);

  return (
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
        id="map" 
        className="w-full h-[calc(100vh-4rem)]"
        style={{ display: mapLoaded ? 'block' : 'none' }}
      />
    </main>
  );
}