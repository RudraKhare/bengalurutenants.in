'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

interface ViewR2PhotoProps {
  objectKey: string;
  alt?: string;
  className?: string;
}

/**
 * Component to view photos stored in R2 using presigned URLs
 * Use this to display photos that have been uploaded to R2
 */
export default function ViewR2Photo({ objectKey, alt = 'Photo', className = '' }: ViewR2PhotoProps) {
  const { token } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the presigned URL for viewing the image
  useEffect(() => {
    const getImageUrl = async () => {
      try {
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        if (!objectKey) {
          setError('No object key provided');
          setLoading(false);
          return;
        }

        setLoading(true);
        
        // Use the VIEW endpoint to get a presigned URL for viewing
        const response = await fetch(buildApiUrl(API_ENDPOINTS.UPLOADS.VIEW(objectKey)), {
          method: 'GET',
          headers: getAuthHeaders(token)
        });

        if (!response.ok) {
          throw new Error(`Failed to get view URL: ${response.status}`);
        }

        const data = await response.json();
        setImageUrl(data.view_url);
      } catch (err) {
        console.error('Error fetching image URL:', err);
        setError('Failed to load image');
      } finally {
        setLoading(false);
      }
    };

    getImageUrl();
  }, [objectKey, token]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-md h-40 w-full"></div>;
  }

  if (error || !imageUrl) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center text-red-600">
        <p>{error || 'Failed to load image'}</p>
        <p className="text-xs mt-1 text-gray-500">Object key: {objectKey}</p>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={`rounded-md max-w-full ${className}`}
      onError={() => setError('Failed to load image')}
    />
  );
}
