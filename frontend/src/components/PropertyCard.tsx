'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

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
}

interface PropertyCardProps {
  property: Property;
  propertyType: string;
}

export default function PropertyCard({ property, propertyType }: PropertyCardProps) {
  const { token } = useAuth();
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
  const renderStars = (rating: number = 0) => {
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
        <span className="ml-1 text-sm font-medium text-gray-500">{rating ? rating.toFixed(1) : 'No ratings'}</span>
      </div>
    );
  };

  // Get property type display text
  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case 'villaHouse':
      case 'VILLA_HOUSE': return 'Villa/House';
      case 'flatApartment':
      case 'FLAT_APARTME': return 'Flat/Apartment';
      case 'pgHostel':
      case 'PG_HOSTEL': return 'PG/Hostel';
      default: return 'Property';
    }
  };

  // Load the main photo for the property card
  useEffect(() => {
    // Enhanced logging for debugging
    console.log(`🖼️ PropertyCard ${property.id}:`, {
      address: property.address.substring(0, 30) + '...',
      hasPhotoKeys: !!property.photo_keys,
      photoKeys: property.photo_keys || 'NULL',
      hasToken: !!token,
      status: !property.photo_keys ? 'NO_PHOTOS' : !token ? 'NOT_AUTHENTICATED' : 'WILL_FETCH_R2'
    });

    // If no photo keys or no token, use placeholder
    if (!property.photo_keys || !token) {
      const reason = !property.photo_keys ? 'No photo_keys in database' : 'User not authenticated';
      console.log(`🎨 Using Picsum for property ${property.id}: ${reason}`);
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
    const apiUrl = `http://localhost:8000/api/v1/uploads/view/${encodeURIComponent(firstKey)}`;
    console.log(`📡 API Request: ${apiUrl}`);
    
    fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
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

  return (
    <Link href={`/property/${property.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
        {/* Property Image */}
        <div className="relative h-48 bg-gray-200">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Display the actual property image if available, otherwise use a placeholder */}
          {mainPhotoUrl ? (
            <img 
              src={mainPhotoUrl} 
              alt={property.address} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder on error
                (e.target as HTMLImageElement).src = `https://picsum.photos/800/600?random=${property.id}`;
              }}
            />
          ) : (
            <img 
              src={`https://picsum.photos/800/600?random=${property.id}`} 
              alt={property.address} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Ultimate fallback to a solid color div
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <div class="text-center text-gray-600">
                        <svg class="w-16 h-16 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                        </svg>
                        <p class="text-sm">Property Image</p>
                      </div>
                    </div>
                  `;
                }
              }}
            />
          )}
          
          <div className="absolute top-0 right-0 m-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
              {getPropertyTypeText(propertyType)}
            </span>
          </div>
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
          
          <p className="text-gray-600 text-sm mb-2">
            {property.area && `${property.area}, `}{property.city}
          </p>
          
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
              {renderStars(property.avg_rating)}
            </div>
            <div className="text-sm font-medium text-blue-600">
              View Details
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
            <div>
              {property.review_count} {property.review_count === 1 ? 'review' : 'reviews'}
            </div>
            <div>
              Added {formatDate(property.created_at)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
