'use client';

/**
 * PropertyMap Component - Display multiple properties on a map with clustering
 * 
 * Features:
 * - Multiple property markers
 * - Marker clustering for overlapping properties
 * - Info windows with property details
 * - Click to view property
 */

import { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_CONFIG } from '@/lib/googleMaps';
import Link from 'next/link';

interface Property {
  id: number;
  address: string;
  city: string;
  lat: number;
  lng: number;
  avg_rating?: number;
  review_count: number;
  property_type?: string;
}

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  selectedPropertyId?: number;
  onPropertyClick?: (propertyId: number) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

export default function PropertyMap({
  properties,
  height = '500px',
  selectedPropertyId,
  onPropertyClick,
  centerLat,
  centerLng,
  zoom = 12
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Wait for Google Maps API to be available
        if (!(window as any).google?.maps) {
          console.log('Waiting for Google Maps API...');
          await new Promise(resolve => setTimeout(resolve, 500));
          if (!(window as any).google?.maps) {
            throw new Error('Google Maps API not loaded');
          }
        }
        
        // Load Google Maps library
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        
        // Determine center
        let center;
        if (centerLat && centerLng) {
          center = { lat: centerLat, lng: centerLng };
        } else if (properties.length > 0) {
          // Center on first property with coordinates
          const firstProperty = properties.find(p => p.lat && p.lng);
          if (firstProperty) {
            center = { lat: firstProperty.lat, lng: firstProperty.lng };
          } else {
            center = GOOGLE_MAPS_CONFIG.defaultCenter;
          }
        } else {
          center = GOOGLE_MAPS_CONFIG.defaultCenter;
        }

        console.log('Initializing map with center:', center, 'properties:', properties.length);

        const mapInstance = new Map(mapRef.current!, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          mapId: 'property-map'
        });

        setMap(mapInstance);

        const infoWindowInstance = new google.maps.InfoWindow();
        setInfoWindow(infoWindowInstance);
        
        // Trigger resize after map loads
        google.maps.event.addListenerOnce(mapInstance, 'tilesloaded', () => {
          console.log('Map tiles loaded');
          setIsLoading(false);
          google.maps.event.trigger(mapInstance, 'resize');
          mapInstance.setCenter(center);
        });
        
        // Fallback: trigger resize after delay
        setTimeout(() => {
          if (mapInstance) {
            google.maps.event.trigger(mapInstance, 'resize');
            mapInstance.setCenter(center);
            setIsLoading(false);
          }
        }, 1000);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError(error instanceof Error ? error.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!map || !infoWindow) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    properties.forEach(property => {
      if (!property.lat || !property.lng) return;

      const position = { lat: property.lat, lng: property.lng };
      
      // Use bright red color for all properties
      const markerColor = '#EF4444'; // bright red (red-500)

      // Create custom pin drop icon
      const pinIcon = {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: markerColor,
        fillOpacity: 0.9,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 1.8,
        anchor: new google.maps.Point(12, 22),
      };

      const marker = new google.maps.Marker({
        position,
        map,
        title: property.address,
        animation: property.id === selectedPropertyId 
          ? google.maps.Animation.BOUNCE 
          : undefined,
        icon: pinIcon
      });

      // Create info window content
      const contentString = `
        <div style="padding: 12px; max-width: 280px;">
          <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1f2937;">
            ${property.address}
          </h3>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">
            ${property.city}${property.property_type ? ` • ${property.property_type}` : ''}
          </p>
          ${property.avg_rating ? `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px; font-weight: 600; color: #f59e0b;">
                ⭐ ${property.avg_rating.toFixed(1)}
              </span>
              <span style="font-size: 14px; color: #6b7280;">
                (${property.review_count} review${property.review_count !== 1 ? 's' : ''})
              </span>
            </div>
          ` : `
            <p style="font-size: 14px; color: #9ca3af; margin-bottom: 8px;">
              No reviews yet
            </p>
          `}
          <a 
            href="/property/${property.id}" 
            style="display: inline-block; padding: 6px 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;"
          >
            View Details →
          </a>
        </div>
      `;

      marker.addListener('click', () => {
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
        
        if (onPropertyClick) {
          onPropertyClick(property.id);
        }
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0 && !centerLat && !centerLng) {
      map.fitBounds(bounds);
      
      // Add padding
      const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom > 15) {
          map.setZoom(15);
        }
      });
    }

  }, [map, infoWindow, properties, selectedPropertyId]);

  // Trigger resize when container becomes visible (fixes blank map in modals/overlays)
  useEffect(() => {
    if (!map) return;

    const resizeObserver = new ResizeObserver(() => {
      google.maps.event.trigger(map, 'resize');
      
      // Re-fit bounds if we have properties and no custom center
      if (properties.length > 0 && !centerLat && !centerLng) {
        const bounds = new google.maps.LatLngBounds();
        properties.forEach(property => {
          if (property.lat && property.lng) {
            bounds.extend({ lat: property.lat, lng: property.lng });
          }
        });
        map.fitBounds(bounds);
      }
    });

    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [map, properties, centerLat, centerLng]);

  return (
    <div className="relative w-full" style={{ height }}>
      <div 
        ref={mapRef} 
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg border border-gray-300 shadow-sm"
      />
      
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-600 text-sm font-medium">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
          <div className="text-center p-4">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-600 text-sm font-medium">Failed to load map</p>
            <p className="text-red-500 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {/* No Properties State */}
      {!isLoading && !error && properties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No properties to display</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        </div>
      )}
    </div>
  );
}
