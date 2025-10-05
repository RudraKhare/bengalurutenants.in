/**
 * PhotoViewer Component for Displaying R2 Photos
 * 
 * What this component does:
 * - Displays photos stored in Cloudflare R2
 * - Fetches presigned view URLs for private bucket access
 * - Handles loading states and fallbacks
 * - Provides lightbox functionality for full-size viewing
 * 
 * Under the hood:
 * 1. Takes object_keys (comma-separated) from database
 * 2. Requests presigned view URLs from our API
 * 3. Browser loads images from Cloudflare CDN edge servers
 * 4. Images are cached globally for fast subsequent loads
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

interface PhotoViewerProps {
  objectKeys?: string; // Comma-separated object keys from database
  className?: string;
  maxThumbnails?: number;
}

interface Photo {
  objectKey: string;
  viewUrl: string;
  loading: boolean;
  error: boolean;
}

export default function PhotoViewer({ 
  objectKeys, 
  className = '',
  maxThumbnails = 4 
}: PhotoViewerProps) {
  const { token } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Parse object keys and load photos
  useEffect(() => {
    if (!objectKeys) return;

    // Parse comma-separated object keys
    const keys = objectKeys.split(',').map(key => key.trim()).filter(Boolean);
    
    if (keys.length === 0) return;

    // Initialize photo state
    const initialPhotos: Photo[] = keys.map(key => ({
      objectKey: key,
      viewUrl: '',
      loading: true,
      error: false
    }));

    setPhotos(initialPhotos);

    // Don't try to load photos without a token
    if (!token) {
      // Set all photos to error state if not authenticated
      setPhotos(prev => prev.map(photo => ({ 
        ...photo, 
        loading: false, 
        error: true 
      })));
      return;
    }

    // Load presigned URLs for each photo
    keys.forEach(async (key, index) => {
      try {
        // Request presigned view URL from our API
        // This creates a time-limited URL that allows viewing the private photo
        const response = await fetch(buildApiUrl(API_ENDPOINTS.UPLOADS.VIEW(key)), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to get view URL: ${response.status}`);
        }

        const { view_url } = await response.json();

        // Update photo with the presigned URL
        setPhotos(prev => prev.map((photo, i) => 
          i === index 
            ? { ...photo, viewUrl: view_url, loading: false }
            : photo
        ));

      } catch (error) {
        console.error(`Failed to load photo ${key}:`, error);
        
        // Mark photo as error
        setPhotos(prev => prev.map((photo, i) => 
          i === index 
            ? { ...photo, loading: false, error: true }
            : photo
        ));
      }
    });

  }, [objectKeys, token]);

  // Handle image load error (e.g., expired URL)
  const handleImageError = (index: number) => {
    setPhotos(prev => prev.map((photo, i) => 
      i === index 
        ? { ...photo, error: true }
        : photo
    ));
  };

  // Open lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  // Navigate lightbox
  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    
    if (direction === 'prev') {
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : photos.length - 1);
    } else {
      setLightboxIndex(lightboxIndex < photos.length - 1 ? lightboxIndex + 1 : 0);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateLightbox('prev');
          break;
        case 'ArrowRight':
          navigateLightbox('next');
          break;
      }
    };

    if (lightboxIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  if (!photos.length) {
    return null; // No photos to display
  }

  const visiblePhotos = photos.slice(0, maxThumbnails);
  const remainingCount = Math.max(0, photos.length - maxThumbnails);

  return (
    <>
      {/* Photo grid */}
      <div className={`photo-viewer ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {visiblePhotos.map((photo, index) => (
            <div
              key={photo.objectKey}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openLightbox(index)}
            >
              {photo.loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {photo.error && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-xs text-center mt-2">Image unavailable</p>
                </div>
              )}
              
              {photo.viewUrl && !photo.error && (
                <img
                  src={photo.viewUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                  loading="lazy" // Add lazy loading for better performance
                />
              )}
              
              {/* Remaining count overlay */}
              {index === maxThumbnails - 1 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold">
                  +{remainingCount} more
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
          >
            ×
          </button>
          
          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => navigateLightbox('prev')}
                className="absolute left-4 text-white text-3xl hover:text-gray-300 z-10"
              >
                ‹
              </button>
              <button
                onClick={() => navigateLightbox('next')}
                className="absolute right-4 text-white text-3xl hover:text-gray-300 z-10"
              >
                ›
              </button>
            </>
          )}
          
          {/* Main image */}
          <div className="max-w-full max-h-full p-4">
            {photos[lightboxIndex] && (
              <img
                src={photos[lightboxIndex].viewUrl}
                alt={`Photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
          
          {/* Photo counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
            {lightboxIndex + 1} of {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
