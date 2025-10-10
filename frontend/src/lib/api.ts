/**
 * API Configuration for Bengaluru Tenants Frontend
 * 
 * Centralizes API base URL and common request configurations.
 * Points to our Day 2 FastAPI backend.
 */

// Get API base URL from environment or default to localhost
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Common API request headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper function to create authenticated headers
export const getAuthHeaders = (token: string) => ({
  ...API_HEADERS,
  'Authorization': `Bearer ${token}`,
  'Cache-Control': 'no-cache',  // Prevent caching of authenticated requests
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
    LIST: '/api/v1/properties',
    GET: '/api/v1/properties',
    DETAIL: (id: string) => `/api/v1/properties/${id}`,
    CREATE: '/api/v1/properties',
    SEARCH: (params: URLSearchParams) => `/api/v1/properties?${params.toString()}`,
    MY_PROPERTIES: '/api/v1/properties/my-properties',
    // Photo management
    ADD_PHOTO: (propertyId: string) => `/api/v1/properties/${propertyId}/photos`,
    REMOVE_PHOTO: (propertyId: string, photoKey: string) => `/api/v1/properties/${propertyId}/photos/${encodeURIComponent(photoKey)}`,
    LIST_PHOTOS: (propertyId: string) => `/api/v1/properties/${propertyId}/photos`,
  },
  
  // Cities and Localities
  CITIES: {
    LIST: '/api/v1/cities',
    GET: (city: string) => `/api/v1/cities/${encodeURIComponent(city)}`,
    LOCALITIES: (city: string) => `/api/v1/cities/${encodeURIComponent(city)}/localities`,
    ALL_WITH_LOCALITIES: '/api/v1/cities/all-with-localities',
    SEARCH_LOCALITIES: (cityName: string, search: string) => 
      `/api/v1/cities/${encodeURIComponent(cityName)}/localities?search=${encodeURIComponent(search)}`,
  },
  
  // Reviews
  REVIEWS: {
    LIST: '/api/v1/reviews',
    GET: '/api/v1/reviews',
    CREATE: '/api/v1/reviews',
    BY_PROPERTY: (propertyId: string) => `/api/v1/reviews?property_id=${propertyId}`,
    DETAIL: (id: string) => `/api/v1/reviews/${id}`,
    MY_REVIEWS: '/api/v1/reviews/my-reviews',
    SEARCH: (params: URLSearchParams) => `/api/v1/reviews?${params.toString()}`,
  },
  
  // Photo Upload (Day 3)
  UPLOADS: {
    SIGNED_URL: '/api/v1/uploads/signed-url',
    VIEW: (objectKey: string) => `/api/v1/uploads/view/${encodeURIComponent(objectKey)}`,
    DELETE: (objectKey: string) => `/api/v1/uploads/delete/${objectKey}`,
    USER_PHOTOS: '/api/v1/uploads/user-photos',
  },
  
  // Admin endpoints
  ADMIN: {
    LOGIN: '/api/v1/admin/login',
    MAGIC_LINK: '/api/v1/admin/magic-link',
    VERIFY: '/api/v1/admin/magic-link/verify',
    DASHBOARD: '/api/v1/admin/dashboard',
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string, params?: URLSearchParams) => {
  if (params) {
    return `${API_BASE_URL}${endpoint}?${params.toString()}`;
  }
  return `${API_BASE_URL}${endpoint}`;
};
