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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = async () => {
      try {
        // Load Google Maps API
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
      } catch (error) {
        console.error('Error loading Google Maps:', error);
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

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-300 shadow-sm"
      />
      
      {properties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 text-lg font-medium">No properties to display</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        </div>
      )}
    </div>
  );
}
