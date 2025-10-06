/**
 * API Configuration for Bengaluru Tenants Frontend
 * 
 * Centralizes API base URL and common request configurations.
 * Points to our Day 2 FastAPI backend.
 */

// Use relative URLs to leverage Next.js rewrites
export const API_BASE_URL = '/api';

// Common API request headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Origin': process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
};

// Helper function to create authenticated headers
export const getAuthHeaders = (token: string) => ({
  ...API_HEADERS,
  'Authorization': `Bearer ${token}`,
});

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    MAGIC_LINK: '/api/v1/auth/magic-link',
    VERIFY: '/api/v1/auth/verify',
  },
  
  // Properties
  PROPERTIES: {
    LIST: '/api/v1/properties/',
    GET: '/api/v1/properties/',
    DETAIL: (id: string) => `/api/v1/properties/${id}`,
    CREATE: '/api/v1/properties/',
    SEARCH: (params: URLSearchParams) => `/api/v1/properties/?${params.toString()}`,
    // Photo management
    ADD_PHOTO: (propertyId: string) => `/api/v1/properties/${propertyId}/photos`,
    REMOVE_PHOTO: (propertyId: string, photoKey: string) => `/api/v1/properties/${propertyId}/photos/${encodeURIComponent(photoKey)}`,
    LIST_PHOTOS: (propertyId: string) => `/api/v1/properties/${propertyId}/photos`,
  },
  
  // Reviews
  REVIEWS: {
    LIST: '/api/v1/reviews/',
    GET: '/api/v1/reviews/',
    CREATE: '/api/v1/reviews/',
    BY_PROPERTY: (propertyId: string) => `/api/v1/reviews/?property_id=${propertyId}`,
    DETAIL: (id: string) => `/api/v1/reviews/${id}`,
    SEARCH: (params: URLSearchParams) => `/api/v1/reviews/?${params.toString()}`,
  },
  
  // Photo Upload (Day 3)
  UPLOADS: {
    SIGNED_URL: '/api/v1/uploads/signed-url',
    VIEW: (objectKey: string) => `/api/v1/uploads/view/${objectKey}`,
    DELETE: (objectKey: string) => `/api/v1/uploads/delete/${objectKey}`,
    USER_PHOTOS: '/api/v1/uploads/user-photos',
  },
  
  // Cities and Localities
  CITIES: {
    LIST: '/api/cities',
    LOCALITIES: (cityName: string) => `/api/cities/${encodeURIComponent(cityName)}/localities`,
    ALL_WITH_LOCALITIES: '/api/cities/all-with-localities',
    SEARCH_LOCALITIES: (cityName: string, search: string) => 
      `/api/cities/${encodeURIComponent(cityName)}/localities?search=${encodeURIComponent(search)}`,
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string, params?: URLSearchParams) => {
  if (params) {
    return `${API_BASE_URL}${endpoint}?${params.toString()}`;
  }
  return `${API_BASE_URL}${endpoint}`;
};
