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
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';

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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Parse object keys and load photos
  useEffect(() => {
    if (!objectKeys) {
      console.log('No photo keys provided');
      return;
    }

    // Parse comma-separated object keys
    console.log('Starting to parse object keys:', objectKeys);
    const keys = objectKeys.split(',').map(key => key.trim()).filter(Boolean);
    
    console.log('Parsed photo keys:', keys);
    
    if (keys.length === 0) {
      console.log('No valid keys found after parsing');
      return;
    }

    // Initialize photo state
    const initialPhotos: Photo[] = keys.map(key => ({
      objectKey: key,
      viewUrl: '',
      loading: true,
      error: false
    }));

    setPhotos(initialPhotos);

    // Load presigned URLs for each photo with retry logic
    const loadPhotos = async () => {
      console.log('Starting loadPhotos function');
      
      const fetchWithRetry = async (key: string, index: number, retries = 3, delay = 1000) => {
        let lastUrl = '';
        console.log(`Starting fetchWithRetry for key: ${key}, index: ${index}`);
        
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            // Request public view URL from our API
            lastUrl = buildApiUrl(API_ENDPOINTS.UPLOADS.VIEW(key));
            console.log(`[${key}] Attempt ${attempt}: Constructed URL:`, lastUrl);
            
            console.log(`[${key}] Sending fetch request to:`, lastUrl);
            const response = await fetch(lastUrl);
            
            console.log(`[${key}] Response status:`, response.status);
            console.log(`[${key}] Response headers:`, Object.fromEntries(response.headers));

            if (!response.ok) {
              throw new Error(`Failed to get view URL: ${response.status}`);
            }

            const responseText = await response.text();
            console.log(`[${key}] Raw response:`, responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log(`[${key}] Parsed response data:`, data);
            } catch (parseError) {
                console.error(`[${key}] Failed to parse JSON response:`, parseError);
                throw new Error('Invalid JSON response');
            }

            if (!data.view_url) {
              throw new Error('No view URL in response');
            }

            // Update photo with the presigned URL
            console.log(`[${key}] About to update photo with view_url:`, data.view_url);
            setPhotos(prev => {
              const updated = prev.map(photo => 
                photo.objectKey === key
                  ? { ...photo, viewUrl: data.view_url, loading: false }
                  : photo
              );
              console.log(`[${key}] Updated photos state:`, updated);
              return updated;
            });
            
            return; // Success - exit the retry loop

          } catch (error) {
            console.error(`Attempt ${attempt} failed for photo ${key}:`, error);
            console.error('Error details:', {
              url: lastUrl,
              attempt,
              error: error instanceof Error ? error.message : String(error)
            });
            
            if (attempt === retries) {
              // Mark photo as error after all retries failed
              setPhotos(prev => prev.map(photo => 
                photo.objectKey === key 
                  ? { ...photo, loading: false, error: true }
                  : photo
              ));
              throw error; // Propagate the error
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
          }
        }
      };

      try {
        await Promise.all(keys.map((key, index) => fetchWithRetry(key, index)));
      } catch (error) {
        console.error('Error loading photos:', error);
      }
    };

    // Start loading the photos
    loadPhotos();

  }, [objectKeys]);

  // Handle image load error (e.g., expired URL)
  const handleImageError = (index: number) => {
    console.error(`Image loading failed for index ${index}`);
    setPhotos(prev => {
      const photo = prev[index];
      if (!photo) return prev;
      
      console.error('Failed photo details:', {
        objectKey: photo.objectKey,
        viewUrl: photo.viewUrl,
        wasLoading: photo.loading,
        hadError: photo.error
      });
      
      return prev.map((p, i) => 
        i === index 
          ? { ...p, error: true, loading: false }
          : p
      );
    });
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
                  onError={(e) => {
                console.error(`Image load error for index ${index}:`, e);
                handleImageError(index);
              }}
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
