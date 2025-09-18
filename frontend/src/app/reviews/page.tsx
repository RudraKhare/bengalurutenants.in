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

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    // The filtering is handled by the useEffect above
  };
  
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          All Reviews
        </h1>
        <p className="text-gray-600">
          Browse honest reviews from tenants across Bengaluru. Filter by area to find relevant reviews.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <label htmlFor="search-area" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Area
            </label>
            <input
              ref={inputRef}
              id="search-area"
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Indiranagar, Koramangala, etc."
              autoComplete="off"
            />
            
            {/* Localities Dropdown */}
            {showDropdown && filteredLocalities.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {filteredLocalities.map((locality) => (
                  <button
                    key={locality}
                    type="button"
                    onClick={() => handleSelectLocality(locality)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    {locality}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="sm:self-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => loadReviews()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600 mb-4">
              {searchArea 
                ? `No reviews found for "${searchArea}". Try a different area or broaden your search.` 
                : "No reviews found. Be the first to add a review!"}
            </p>
            <Link
              href="/review/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add a Review
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredReviews.length} reviews {searchArea && `in "${searchArea}"`}
            </p>

            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
                  {review.property && (
                    <Link href={`/property/${review.property_id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-blue-600">
                        {review.property.address}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {review.property.area && `${review.property.area}, `}{review.property.city}
                      </p>
                    </Link>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Anonymous Tenant</div>
                        <div className="text-sm text-gray-500">
                          {review.verification_level} • {formatDate(review.created_at)}
                        </div>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 mb-4 whitespace-pre-line">{review.comment}</p>
                  )}

                  <div className="flex justify-end">
                    <Link href={`/property/${review.property_id}`}>
                      <span className="text-sm text-blue-600 hover:text-blue-800">
                        View Property Details →
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      loadReviews(currentPage - 1);
                    }
                  }}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
