'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import ImageWithLoader from './ImageWithLoader';

interface Property {
  id: number;
  address: string;
  city: string;
  area?: string;
  property_type?: string; // Now properly mapped from backend
  lat?: number;
  lng?: number;
  photo_keys?: string; // Comma-separated R2 object keys
  created_at: string;
  avg_rating?: number;
  review_count: number;
  rent_amount?: number;
  latest_review?: string; // Latest review comment
}

interface PropertyCardProps {
  property: Property;
  propertyType: string;
}

export default function PropertyCard({ property, propertyType }: PropertyCardProps) {
  const { token } = useAuth();
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latestReview, setLatestReview] = useState<{ comment: string | null; rating: number } | null>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency (rent amount)
  const formatCurrency = (amount?: number) => {
    if (!amount) return null;
    return `₹${amount.toLocaleString()}`;
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Load the main photo for the property card
  useEffect(() => {
    // Enhanced logging for debugging
    console.log(`🖼️ PropertyCard ${property.id}:`, {
      address: property.address.substring(0, 30) + '...',
      hasPhotoKeys: !!property.photo_keys,
      photoKeys: property.photo_keys || 'NULL',
      hasToken: !!token,
      status: !property.photo_keys ? 'NO_PHOTOS' : 'WILL_FETCH_R2'
    });

    // If no photo keys, use placeholder
    if (!property.photo_keys) {
      console.log(`🎨 Using Picsum for property ${property.id}: No photo_keys in database`);
      return;
    }

    // Try to get the first photo from R2
    const keys = property.photo_keys.split(',').map(key => key.trim()).filter(Boolean);
    if (keys.length === 0) {
      console.log(`⚠️ Empty photo keys for property ${property.id}`);
      return;
    }
    
    const firstKey = keys[0];
    console.log(`🚀 Fetching R2 photo for property ${property.id}: ${firstKey}`);
    setLoading(true);

    // Request presigned view URL for the first photo
    // Note: View endpoint is now public, no auth required
    const apiUrl = buildApiUrl(API_ENDPOINTS.UPLOADS.VIEW(firstKey));
    console.log(`📡 API Request: ${apiUrl}`);
    
    // Include auth header if available, but don't require it
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    fetch(apiUrl, { headers })
      .then(response => {
        console.log(`📊 API Response ${property.id}:`, {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });
        if (!response.ok) throw new Error('Failed to get view URL');
        return response.json();
      })
      .then(data => {
        console.log(`✅ R2 Success ${property.id}:`, data.view_url);
        setMainPhotoUrl(data.view_url);
      })
      .catch(error => {
        console.log(`❌ R2 Failed ${property.id}:`, error.message);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [property.photo_keys, token]);

  // Fetch latest review for the property
  useEffect(() => {
    const apiUrl = buildApiUrl(`/v1/reviews/?property_id=${property.id}&limit=1`);
    console.log(`📝 Fetching review for property ${property.id}:`, apiUrl);
    
    // Fetch the latest review comment and rating for this property
    fetch(apiUrl)
      .then(response => {
        console.log(`📝 Review API Response for property ${property.id}:`, response.status, response.ok);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`📝 Review data for property ${property.id}:`, data);
        if (data.reviews && data.reviews.length > 0) {
          console.log(`✅ Found review for property ${property.id}:`, {
            comment: data.reviews[0].comment,
            rating: data.reviews[0].rating
          });
          setLatestReview({
            comment: data.reviews[0].comment,
            rating: data.reviews[0].rating
          });
        } else {
          console.log(`⚠️ No reviews found for property ${property.id}`);
        }
      })
      .catch(error => {
        console.error(`❌ Failed to fetch review for property ${property.id}:`, error);
      });
  }, [property.id]);

  return (
    <Link href={`/property/${property.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
        {/* Property Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <ImageWithLoader
            src={mainPhotoUrl}
            alt={property.address}
            className="h-full"
            loading={loading}
          />
        </div>
        
        {/* Property Details */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
              {property.address}
            </h2>
            {property.rent_amount && (
              <div className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                <span>{formatCurrency(property.rent_amount)}</span>
                <span className="text-xs text-gray-500 ml-1">/month</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3">
            {property.area && `${property.area}, `}{property.city}
          </p>
          
          {/* Latest Review Comment (if available) */}
          {latestReview && latestReview.comment && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 italic line-clamp-1">
                "{latestReview.comment}"
              </p>
            </div>
          )}
          
          {/* Footer with date on left, stars on right */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
            <div>
              Added {formatDate(property.created_at)}
            </div>
            {latestReview && (
              <div className="flex items-center">
                {renderStars(latestReview.rating)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
