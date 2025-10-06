/**
 * Temporary API response interceptor
 * 
 * This utility helps debug and fix issues with photo_keys by adding mock data
 * to API responses for testing purposes.
 * 
 * INSTRUCTIONS:
 * 1. Add this file to your project
 * 2. Import and call setupMockInterceptor() in your _app.tsx or layout.tsx
 * 3. This will add mock photo_keys to property responses
 * 
 * IMPORTANT: This is a temporary solution for debugging only!
 * The proper fix is to update the backend database and API.
 */

// Sample R2 object keys for testing (these would need to be valid keys in your R2 bucket)
const SAMPLE_PHOTO_KEYS = [
  'property/1/2025/09/15/test-photo-1.jpg',
  'property/1/2025/09/15/test-photo-2.jpg',
  'property/2/2025/09/16/test-photo-3.jpg'
];

export function setupMockInterceptor() {
  // Store the original fetch
  const originalFetch = window.fetch;
  
  // Replace fetch with our interceptor
  window.fetch = async function(input, init) {
    // Call the original fetch
    const response = await originalFetch(input, init);
    
    // Only intercept property API responses
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : '';
    if (url.includes('/api/v1/properties') && response.ok) {
      // Clone the response so we can modify it
      const clone = response.clone();
      const data = await clone.json();
      
      // Add photo_keys to properties if they don't have them
      if (data.properties) {
        console.log('[Mock] Intercepting properties response', data);
        
        // Add mock photo keys to properties
        data.properties = data.properties.map((property: any, index: number) => {
          if (!property.photo_keys) {
            // Pick a sample key based on property id to ensure consistency
            const keyIndex = property.id % SAMPLE_PHOTO_KEYS.length;
            return {
              ...property,
              photo_keys: SAMPLE_PHOTO_KEYS[keyIndex]
            };
          }
          return property;
        });
        
        console.log('[Mock] Modified properties with photo_keys', data);
        
        // Create a new response with the modified data
        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
      
      // Handle single property response
      if (data.id && !data.photo_keys) {
        console.log('[Mock] Intercepting single property response', data);
        
        // Add mock photo keys to the property
        const keyIndex = data.id % SAMPLE_PHOTO_KEYS.length;
        data.photo_keys = SAMPLE_PHOTO_KEYS[keyIndex];
        
        console.log('[Mock] Modified property with photo_keys', data);
        
        // Create a new response with the modified data
        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
    }
    
    // Return original response for all other requests
    return response;
  };
  
  console.log('[Mock] API interceptor set up for adding photo_keys to properties');
}
