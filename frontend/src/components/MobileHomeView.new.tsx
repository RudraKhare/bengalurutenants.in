'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import IndianMonumentsCarousel from './IndianMonumentsCarousel';
import ImageWithLoader from './ImageWithLoader';

interface Review {
  id: number;
  user_id: number;
  property_id: number;
  rating: number;
  comment: string;
  verification_level: string;
  created_at: string;
  property?: {
    id: number;
    address: string;
    city: string;
    area?: string;
    photo_keys?: string;
  };
}

interface MobileHomeViewProps {
  recentReviews: Review[];
  loading: boolean;
  token: string | null;
}

export default function MobileHomeView({ recentReviews, loading, token }: MobileHomeViewProps) {
  const router = useRouter();
  const [searchCity, setSearchCity] = useState('');
  const [allCities, setAllCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch cities on component mount
  useEffect(() => {
    async function fetchCities() {
      setIsLoadingCities(true);
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.CITIES.LIST));
        if (response.ok) {
          const cities = await response.json();
          setAllCities(cities.map((city: any) => city.name));
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoadingCities(false);
      }
    }
    fetchCities();
  }, []);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setShowCityDropdown(false);
      router.push(`/property/search?city=${encodeURIComponent(searchCity)}`);
    }
  };

  const handleCitySelect = (city: string) => {
    setSearchCity(city);
    setShowCityDropdown(false);
    router.push(`/property/search?city=${encodeURIComponent(city)}`);
  };

  // Fuzzy search for cities
  const filteredCities = searchCity.trim() === '' 
    ? allCities 
    : allCities.filter((city: string) => 
        city.toLowerCase().includes(searchCity.toLowerCase())
      );

  return (
    <div className="md:hidden w-full min-h-screen bg-transparent pb-20 overflow-x-hidden">
      {/* Hero Section with Background Carousel */}
      <div className="w-full relative z-30">
        {/* Background Carousel with Overlay */}
        <div className="fixed inset-0 z-0">
          <IndianMonumentsCarousel showOverlay={true} overlayOpacity={0.6} />
        </div>

        {/* Content Layer */}
        <div className="relative z-40 pt-16">
          {/* Tagline Section */}
          <div className="w-full px-4 py-6">
            <h1 className="text-center text-white text-2xl font-bold drop-shadow-lg">
              Landlords won't tell You. But we will.
            </h1>
            <p className="mt-3 text-center text-white/95 text-base drop-shadow-md">
              Discover real tenant stories before renting your next flat.
            </p>
          </div>

          {/* Search Section */}
          <div className="w-full px-4 py-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative flex" ref={cityDropdownRef}>
                {/* Search Input with Icon */}
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => {
                      setSearchCity(e.target.value);
                      setShowCityDropdown(true);
                    }}
                    placeholder="Search for properties in any city..."
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-lg shadow-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Search Button */}
                <button 
                  type="submit"
                  className="ml-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>

                {/* City Dropdown */}
                {showCityDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-50">
                    {isLoadingCities ? (
                      <div className="p-4 text-center text-gray-500">Loading cities...</div>
                    ) : filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-700"
                        >
                          {city}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No cities found</div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Recent Reviews Section - Slides up over the hero section */}
      <div className="relative z-50 w-full bg-gray-50 rounded-t-3xl -mt-6 px-4 py-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Reviews</h2>
          <p className="text-sm text-gray-600">
            Latest tenant experiences from across the city
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : recentReviews.length > 0 ? (
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <MobileReviewCard key={review.id} review={review} token={token} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No reviews found
          </div>
        )}
      </div>
    </div>
  );
}

function MobileReviewCard({ review, token }: { review: Review; token: string | null }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Fetch property image
  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        if (!review.property?.photo_keys) return;
        
        // Get the first photo key
        const photoKey = review.property.photo_keys.split(',')[0];
        
        const response = await fetch(
          buildApiUrl(API_ENDPOINTS.PROPERTIES.LIST_PHOTOS(review.property_id.toString())), {
            method: 'GET',
            headers: token ? {
              'Authorization': `Bearer ${token}`
            } : undefined
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.url);
        }
      } catch (error) {
        console.error('Error fetching property image:', error);
      }
    };

    fetchImage();
  }, [review.property?.photo_keys, token]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Link href={`/property/${review.property_id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer">
        <div className="flex gap-4">
          {/* Property Image */}
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            {imageUrl ? (
              <ImageWithLoader 
                src={imageUrl} 
                alt={review.property?.address || 'Property'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            )}
          </div>

          {/* Review Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {review.property?.address}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTimeAgo(review.created_at)}
              </span>
            </div>

            {review.property?.area && (
              <p className="mt-1 text-xs text-gray-600">
                {review.property.area}, {review.property.city}
              </p>
            )}

            <div className="mt-2 flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-xs text-gray-600">
                {review.verification_level === 'VERIFIED' && '✓ Verified Review'}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {review.comment}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
