'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import { AllBengaluruLocalities } from '@/lib/localities';
import { useSearchParams } from 'next/navigation';

interface Review {
  id: number;
  user_id: number;
  property_id: number;
  rating: number;
  comment: string;
  verification_level: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  property?: {
    id: number;
    address: string;
    city: string;
    area?: string;
  };
}

interface Property {
  id: number;
  address: string;
  city: string;
  area?: string;
}

interface ReviewResponse {
  reviews: Review[];
  total: number;
  skip: number;
  limit: number;
}

export default function AllReviewsPage() {
  const searchParams = useSearchParams();
  const initialArea = searchParams.get('area') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchArea, setSearchArea] = useState(initialArea);
  const [properties, setProperties] = useState<{[key: number]: Property}>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLocalities, setFilteredLocalities] = useState<string[]>([]);
  
  // City dropdown states for mobile (reusing web homepage logic)
  const [searchCity, setSearchCity] = useState('');
  const [allCities, setAllCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const itemsPerPage = 10;

  // Load reviews with their properties
  const loadReviews = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate skip based on pagination
      const skip = (page - 1) * itemsPerPage;
      
      // Build query parameters
      let queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: itemsPerPage.toString(),
      });
      
      // Call reviews API
      const response = await fetch(buildApiUrl(API_ENDPOINTS.REVIEWS.LIST, queryParams));
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: ReviewResponse = await response.json();
      
      // Now we need to fetch property details for each review
      const reviewsWithProperties = await Promise.all(
        data.reviews.map(async (review) => {
          // Try to get property from cache
          if (properties[review.property_id]) {
            review.property = properties[review.property_id];
            return review;
          }
          
          try {
            const propertyResponse = await fetch(buildApiUrl(`${API_ENDPOINTS.PROPERTIES.GET}/${review.property_id}`));
            if (propertyResponse.ok) {
              const property = await propertyResponse.json();
              // Update our properties cache
              setProperties(prev => ({
                ...prev,
                [property.id]: property
              }));
              return { ...review, property };
            }
            return review;
          } catch (err) {
            console.error(`Failed to fetch property ${review.property_id}`, err);
            return review;
          }
        })
      );
      
      setReviews(reviewsWithProperties);
      setFilteredReviews(reviewsWithProperties);
      setTotalCount(data.total);
      
    } catch (err: any) {
      console.error("Failed to load reviews:", err);
      setError(err.message || "Failed to load reviews");
      setReviews([]);
      setFilteredReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter localities based on input
  useEffect(() => {
    if (searchArea.trim() === '') {
      // Show popular localities or recent searches when empty
      setFilteredLocalities(AllBengaluruLocalities.slice(0, 10));
    } else {
      const filtered = AllBengaluruLocalities.filter(
        locality => locality.toLowerCase().includes(searchArea.toLowerCase())
      );
      setFilteredLocalities(filtered.slice(0, 15)); // Limit to avoid overwhelming dropdown
    }
  }, [searchArea]);

  // Fetch cities on component mount (reusing web homepage logic)
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

  // Load reviews when the component mounts
  useEffect(() => {
    loadReviews();
  }, []);
  
  // Handle clicks outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      // Close city dropdown on mobile
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter reviews by area
  useEffect(() => {
    if (!searchArea.trim()) {
      setFilteredReviews(reviews);
      return;
    }
    
    const filtered = reviews.filter(review => 
      review.property?.area?.toLowerCase().includes(searchArea.toLowerCase()) ||
      review.property?.address.toLowerCase().includes(searchArea.toLowerCase())
    );
    
    setFilteredReviews(filtered);
  }, [searchArea, reviews]);

  // Filter reviews by city for mobile (reusing web homepage logic)
  useEffect(() => {
    if (!searchCity.trim()) {
      // If no city filter on mobile, use area filter
      return;
    }
    
    const filtered = reviews.filter(review => 
      review.property?.city?.toLowerCase().includes(searchCity.toLowerCase())
    );
    
    setFilteredReviews(filtered);
  }, [searchCity, reviews]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    // The filtering is handled by the useEffect above
  };
  
  // Handle city search for mobile (reusing web homepage logic)
  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setShowCityDropdown(false);
    }
  };
  
  // Handle city selection from dropdown (reusing web homepage logic)
  const handleCitySelect = (city: string) => {
    setSearchCity(city);
    setShowCityDropdown(false);
  };
  
  // Fuzzy search for cities (reusing web homepage logic)
  const filteredCities = searchCity.trim() === '' 
    ? allCities 
    : allCities.filter((city: string) => 
        city.toLowerCase().includes(searchCity.toLowerCase())
      );
  
  // Handle locality selection from dropdown
  const handleSelectLocality = (locality: string) => {
    setSearchArea(locality);
    setShowDropdown(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <span className="ml-1 text-sm font-medium text-gray-500">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-20 md:pb-8">
      {/* Page header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
          All Reviews
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Browse honest reviews from tenants across Bengaluru. Filter by city to find relevant reviews.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
        {/* Desktop: Filter by Area */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <label htmlFor="search-area" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Filter by Area
            </label>
            <input
              ref={inputRef}
              id="search-area"
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Indiranagar, Koramangala"
              autoComplete="off"
            />
            
            {/* Localities Dropdown */}
            {showDropdown && filteredLocalities.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-auto"
              >
                {filteredLocalities.map((locality) => (
                  <button
                    key={locality}
                    type="button"
                    onClick={() => handleSelectLocality(locality)}
                    className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 transition-colors"
                  >
                    {locality}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Mobile: Filter by City - ENHANCED WITH PROPER Z-INDEX AND VISIBILITY */}
        <form onSubmit={handleCitySearch} className="md:hidden flex flex-col gap-3">
          <div className="flex-1 relative" ref={cityDropdownRef} style={{ zIndex: 100 }}>
            <label htmlFor="search-city-mobile" className="block text-xs font-medium text-gray-700 mb-1">
              Filter by City
            </label>
            <input
              id="search-city-mobile"
              type="text"
              placeholder="Search By City"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onFocus={() => setShowCityDropdown(true)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-md hover:shadow-lg transition-all text-sm font-medium"
              autoComplete="off"
            />
            
            {/* City Dropdown - FIXED Z-INDEX AND STYLING */}
            {showCityDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-48 overflow-y-auto" style={{ zIndex: 10000 }}>
                {isLoadingCities ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Loading cities...</div>
                ) : filteredCities.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    {searchCity.trim() ? 'No cities found' : 'No cities available'}
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredCities.map((city: string) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleCitySelect(city)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 font-medium hover:bg-red-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-3 text-sm bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 text-red-600">
            <p className="text-sm sm:text-base">{error}</p>
            <button 
              onClick={() => loadReviews()} 
              className="mt-3 sm:mt-4 px-4 py-2 text-sm sm:text-base bg-blue-600 text-white font-medium rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-4">
              {searchArea 
                ? `No reviews found for "${searchArea}". Try a different area or broaden your search.` 
                : "No reviews found. Be the first to add a review!"}
            </p>
            <Link
              href="/review/add"
              className="inline-flex items-center px-4 py-2 text-sm sm:text-base border border-transparent font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add a Review
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Showing {filteredReviews.length} reviews {searchArea && `in "${searchArea}"`}
            </p>

            <div className="space-y-4 sm:space-y-6">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                  {review.property && (
                    <Link href={`/property/${review.property_id}`}>
                      <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 hover:text-blue-600">
                        {review.property.address}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
                        {review.property.area && `${review.property.area}, `}{review.property.city}
                      </p>
                    </Link>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full mr-2 sm:mr-3 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-medium text-gray-900">Anonymous Tenant</div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {review.verification_level} • {formatDate(review.created_at)}
                        </div>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 whitespace-pre-line">{review.comment}</p>
                  )}

                  <div className="flex justify-end">
                    <Link href={`/property/${review.property_id}`}>
                      <span className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">
                        View Property Details →
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      loadReviews(currentPage - 1);
                    }
                  }}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 sm:px-4 py-2 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const totalPages = Math.ceil(totalCount / itemsPerPage);
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      loadReviews(currentPage + 1);
                    }
                  }}
                  disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                  className="relative inline-flex items-center px-3 sm:px-4 py-2 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
