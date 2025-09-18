/**
 * Debug utility hook for API responses
 * Use this temporarily to debug API responses
 */

import { useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import { useAuth } from './useAuth';

/**
 * Hook to debug API responses
 * Add this to any component where you want to inspect the actual property data
 */
export function useDebugApi() {
  const { token } = useAuth();
  
  useEffect(() => {
    if (!token) return;
    
    // Fetch a single property to inspect its fields
    const fetchProperty = async () => {
      try {
        // Try to get the first property from the API
        const response = await fetch(buildApiUrl(API_ENDPOINTS.PROPERTIES.LIST), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error('Failed to fetch property for debugging');
          return;
        }
        
        const data = await response.json();
        if (data.properties && data.properties.length > 0) {
          console.log('DEBUG - Example property data structure:', data.properties[0]);
          
          // Check specifically for photo_keys field
          const hasPhotoKeys = data.properties.some((p: any) => !!p.photo_keys);
          console.log('DEBUG - Any properties have photo_keys?', hasPhotoKeys);
          
          // Show all properties with photo keys
          const propertiesWithPhotos = data.properties.filter((p: any) => !!p.photo_keys);
          console.log('DEBUG - Properties with photos:', propertiesWithPhotos);
        } else {
          console.log('DEBUG - No properties returned from API');
        }
      } catch (error) {
        console.error('Debug API fetch error:', error);
      }
    };
    
    fetchProperty();
  }, [token]);
  
  return null;
}
