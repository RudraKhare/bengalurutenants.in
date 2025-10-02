'use client';

import Link from 'next/link'
import PropertySearch from '@/components/search/PropertySearch'
import { useState, useEffect } from 'react'
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

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

export default function HomePage() {
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const queryParams = new URLSearchParams({
          skip: '0',
          limit: '6',
        });
        
        const response = await fetch(buildApiUrl(API_ENDPOINTS.REVIEWS.LIST, queryParams));
        
        if (response.ok) {
          const data = await response.json();
          setRecentReviews(data.reviews || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReviews();
  }, []);

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

  const getVerificationLabel = (level: string) => {
    switch (level) {
      case 'VERIFIED_TENANT': return 'Verified tenant';
      case 'PHOTO_VERIFIED': return 'Photo verified';
      case 'DOCUMENT_VERIFIED': return 'Document verified';
      default: return 'Tenant';
    }
  };

  // ReviewCard component to handle individual review with image
  const ReviewCard = ({ review }: { review: Review }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);

    useEffect(() => {
      const fetchImage = async () => {
        if (!review.property?.photo_keys || !token) return;

        const firstPhotoKey = review.property.photo_keys.split(',')[0].trim();
        if (!firstPhotoKey) return;

        setImageLoading(true);
        try {
          const response = await fetch(
            buildApiUrl(API_ENDPOINTS.UPLOADS.VIEW(firstPhotoKey)),
            {
              method: 'GET',
              headers: getAuthHeaders(token)
            }
          );

          if (response.ok) {
            const data = await response.json();
            setImageUrl(data.view_url);
          }
        } catch (error) {
          console.error('Failed to fetch image:', error);
        } finally {
          setImageLoading(false);
        }
      };

      fetchImage();
    }, [review.property?.photo_keys, token]);

    return (
      <Link 
        href={`/property/${review.property_id}`}
        className="card hover:shadow-lg transition-shadow overflow-hidden"
      >
        {/* Property Image */}
        <div className="relative h-48 bg-gray-200 -m-6 mb-4">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={review.property?.area || 'Property'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-xs">No Image</p>
              </div>
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'fill-gray-300'}`} 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">{review.rating.toFixed(1)}</span>
        </div>
        <h3 className="font-medium text-gray-900 mb-2">
          {review.property?.area ? `Property in ${review.property.area}` : review.property?.address || 'Property'}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          "{review.comment}"
        </p>
        <div className="text-xs text-gray-500">
          {getVerificationLabel(review.verification_level)} • {formatTimeAgo(review.created_at)}
        </div>
      </Link>
    );
  };
  return (
    <div>
      {/* Hero Section with Animated Background - Covers header area too with negative margin */}
      <div className="relative bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 overflow-hidden -mt-16 pt-16">
        {/* Decorative Background Elements - Animated Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-4">
              Find a property you can trust
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-700 md:text-xl mb-8">
              Discover, read, and write reviews
            </p>
            
            {/* Search Bar - Client Component */}
            <div className="relative z-20">
              <PropertySearch />
            </div>
          </div>
        </div>

        {/* Main Content Links */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/property/search"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Advanced Search
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/reviews"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              View All Reviews
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/review/add"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Add Review
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Reviews Section - Dynamic Data */}
      <div className="py-12 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Recent Reviews
        </h2>
        {loading ? (
          <div className="text-center text-gray-600">Loading recent reviews...</div>
        ) : recentReviews.length > 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600">No reviews available yet.</div>
        )}
        <div className="text-center mt-8">
          <Link
            href="/reviews"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Reviews
          </Link>
        </div>
      </div>

      {/* Features Section - Now outside animated background with white bg */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
              Why Choose OpenReviews.in?
            </h2>
            
            {/* Core Values Section */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-12">
                Keep your community informed
              </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Anonymity */}
              <div className="text-center bg-white rounded-lg shadow-md p-6">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 19l-7-7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Anonymity</h4>
                <p className="text-gray-600">
                  Share your experiences without revealing your identity. Your privacy is protected while your voice is heard.
                </p>
              </div>
              
              {/* Solidarity */}
              <div className="text-center bg-white rounded-lg shadow-md p-6">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Solidarity</h4>
                <p className="text-gray-600">
                  Help fellow tenants make informed decisions. Your reviews strengthen our community and support others.
                </p>
              </div>
              
              {/* Transparency */}
              <div className="text-center bg-white rounded-lg shadow-md p-6">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Transparency</h4>
                <p className="text-gray-600">
                  Promote a fair and open rental market. Honest reviews create transparency that benefits the entire community.
                </p>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">
            Our Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="card text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Verified Reviews</h3>
              <p className="text-gray-600">
                All reviews are verified through multiple methods including rental agreements and utility bills.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Location-Based</h3>
              <p className="text-gray-600">
                Find properties and reviews specific to your preferred areas in Bengaluru.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Honest Ratings</h3>
              <p className="text-gray-600">
                Get detailed ratings on cleanliness, landlord behavior, location, and value for money.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Help the Community
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Share your rental experience and help future tenants make better decisions. 
            Your honest review can make a real difference.
          </p>
          <Link
            href="/review/add"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Share Your Experience
          </Link>
        </div>
      </div>
      </div>
    </div>
  )
}
