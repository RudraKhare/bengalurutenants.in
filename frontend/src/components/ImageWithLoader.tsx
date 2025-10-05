'use client';

import React, { useState } from 'react';

interface ImageWithLoaderProps {
  src: string | null;
  alt: string;
  className?: string;
  loading?: boolean;
  onError?: () => void;
}

/**
 * ImageWithLoader - A reusable component for property/review images
 * Shows a loading spinner while image is being fetched
 * Shows actual image once loaded
 * Shows a default placeholder if image fails or doesn't exist
 * NO Unsplash/Picsum placeholders
 */
export default function ImageWithLoader({
  src,
  alt,
  className = '',
  loading = false,
  onError
}: ImageWithLoaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
    if (onError) onError();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Loading Spinner - Show while loading or image hasn't loaded yet */}
      {(loading || (src && !imageLoaded && !imageError)) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-red-500 mb-2"></div>
            <p className="text-xs text-gray-500">Loading image...</p>
          </div>
        </div>
      )}

      {/* Actual Image - Show only if src exists and no error */}
      {src && !imageError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Default Placeholder - Show if no src or image failed to load */}
      {(!src || imageError) && !loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium">No Image Available</p>
          </div>
        </div>
      )}
    </div>
  );
}
