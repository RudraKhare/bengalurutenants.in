'use client';

import Link from 'next/link'
import PropertySearch from '@/components/search/PropertySearch'
import { useState, useEffect } from 'react'
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import MobileHomeView from '@/components/MobileHomeView'
import IndianMonumentsCarousel from '@/components/IndianMonumentsCarousel'
import ImageWithLoader from '@/components/ImageWithLoader'

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
        // Allow image fetching for all users (logged in or not)
        if (!review.property?.photo_keys) return;

        const firstPhotoKey = review.property.photo_keys.split(',')[0].trim();
        if (!firstPhotoKey) return;

        setImageLoading(true);
        try {
          const response = await fetch(
            buildApiUrl(API_ENDPOINTS.UPLOADS.VIEW(firstPhotoKey)),
            {
              method: 'GET',
              // Include auth headers only if token exists (for private images)
              headers: token ? getAuthHeaders(token) : undefined
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
        <div className="relative h-48 bg-gray-200 -m-6 mb-4 overflow-hidden">
          <ImageWithLoader
            src={imageUrl}
            alt={review.property?.area || 'Property'}
            className="h-full"
            loading={imageLoading}
          />
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
    <>
      {/* Mobile View - Only visible on screens < 768px */}
      <div className="md:hidden w-full">
        <MobileHomeView recentReviews={recentReviews} loading={loading} token={token} />
      </div>

      {/* Desktop View - Hidden on mobile */}
      <div className="hidden md:block">
    <div>
      {/* Hero Section with Indian Monuments Background Carousel - FIXED: overflow-visible for dropdown */}
      <div className="relative overflow-visible -mt-16 pt-16" style={{ zIndex: 30 }}>
        {/* Background Carousel - Replaces gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <IndianMonumentsCarousel showOverlay={true} overlayOpacity={0.5} />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl mb-4 drop-shadow-lg">
              Landlords won't tell You. But we will.
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-white/95 md:text-xl mb-8 drop-shadow-md">
              Discover real tenant stories before renting your next flat.
            </p>
            
            {/* Search Bar - Client Component with elevated z-index */}
            <div className="relative" style={{ zIndex: 50 }}>
              <PropertySearch />
            </div>
          </div>
        </div>

        {/* Main Content Links */}
        <div className="relative z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/property/search"
              className="text-sm text-white/90 hover:text-white hover:underline drop-shadow-md"
            >
              Advanced Search
            </Link>
            <span className="text-white/40">|</span>
            <Link
              href="/reviews"
              className="text-sm text-white/90 hover:text-white hover:underline drop-shadow-md"
            >
              View All Reviews
            </Link>
            <span className="text-white/40">|</span>
            <Link
              href="/review/add"
              className="text-sm text-white/90 hover:text-white hover:underline drop-shadow-md"
            >
              Add Review
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Reviews Section - Dynamic Data - Lower z-index to allow dropdown visibility */}
      <div className="relative py-12 bg-gray-50" style={{ zIndex: 10 }}>
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

      {/* Home Provider Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Auto-sliding Image Carousel - 10 Famous Indian Monuments */}
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="carousel-container w-full h-full">
                {/* 1. Taj Mahal, Agra */}
                <div className="carousel-slide">
                  <img 
                    src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&h=800&fit=crop&auto=format" 
                    alt="Taj Mahal, Agra - The iconic symbol of love"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 2. Gateway of India, Mumbai */}
                <div className="carousel-slide">
                  <img 
                    src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop&auto=format" 
                    alt="Gateway of India, Mumbai"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 3. Hawa Mahal, Jaipur */}
                <div className="carousel-slide">
                  <img 
                    src="https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=800&fit=crop&auto=format" 
                    alt="Hawa Mahal, Jaipur - Palace of Winds"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 4. India Gate, Delhi */}
                <div className="carousel-slide">
                  <img 
                    src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=800&fit=crop&auto=format" 
                    alt="India Gate, Delhi - War memorial"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 5. Mysore Palace, Mysuru */}
                <div className="carousel-slide">
                  <img 
                    src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=800&fit=crop&auto=format" 
                    alt="Mysore Palace, Mysuru - Royal residence"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 6. Charminar, Hyderabad */}
                <div className="carousel-slide">
                  <img 
                    src="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=800&fit=crop&auto=format" 
                    alt="Charminar, Hyderabad - Monument with four minarets"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 7. Qutub Minar, Delhi */}
                <div className="carousel-slide">
                  <img 
                    src="https://images.unsplash.com/photo-1597423244036-ef5020e83f3c?w=1200&h=800&fit=crop&auto=format" 
                    alt="Qutub Minar, Delhi - Tallest brick minaret"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 8. Victoria Memorial, Kolkata */}
                <div className="carousel-slide">
                  <img 
                    src="https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=800&fit=crop&auto=format" 
                    alt="Victoria Memorial, Kolkata - Grand marble building"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 9. Golden Temple, Amritsar */}
                <div className="carousel-slide">
                  <img 
                    src="https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=800&fit=crop&auto=format" 
                    alt="Golden Temple, Amritsar - Holiest Gurdwara"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 10. Amer Fort, Jaipur */}
                <div className="carousel-slide">
                  <img 
                    src="https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=1200&h=800&fit=crop&auto=format" 
                    alt="Amer Fort, Jaipur - Majestic hilltop fort"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* CSS for auto-sliding carousel */}
              <style jsx>{`
                .carousel-container {
                  position: relative;
                }
                
                .carousel-slide {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  opacity: 0;
                  animation: slideShow 50s infinite;
                }
                
                .carousel-slide:nth-child(1) { animation-delay: 0s; }
                .carousel-slide:nth-child(2) { animation-delay: 5s; }
                .carousel-slide:nth-child(3) { animation-delay: 10s; }
                .carousel-slide:nth-child(4) { animation-delay: 15s; }
                .carousel-slide:nth-child(5) { animation-delay: 20s; }
                .carousel-slide:nth-child(6) { animation-delay: 25s; }
                .carousel-slide:nth-child(7) { animation-delay: 30s; }
                .carousel-slide:nth-child(8) { animation-delay: 35s; }
                .carousel-slide:nth-child(9) { animation-delay: 40s; }
                .carousel-slide:nth-child(10) { animation-delay: 45s; }
                
                @keyframes slideShow {
                  0% { opacity: 0; transform: scale(1); }
                  2% { opacity: 1; transform: scale(1.05); }
                  10% { opacity: 1; transform: scale(1.05); }
                  12% { opacity: 0; transform: scale(1); }
                  100% { opacity: 0; transform: scale(1); }
                }
              `}</style>
            </div>
            
            {/* Right: Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">
                  Redefining Rental Relationships
                </h2>
                <h3 className="text-4xl font-bold text-gray-900 mb-4">
                  I am a <span className="line-through text-gray-400">landlord</span>.
                  <br />
                  <span className="text-purple-700">Home Provider</span>
                </h3>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-2xl font-bold text-gray-900 mb-3">
                  Home Provider
                </h4>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">(hōm prə'vīdər)</span>
                  <br />
                  <span className="text-sm italic">noun</span>
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  An owner/operator who views their resident(s) as human, first, and deserving of respect and dignity. 
                  They see their residents as part of the solution and not a part of the product.
                </p>
              </div>
              
              <div className="bg-purple-100 rounded-xl p-4 flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-purple-900">
                  <span className="font-semibold">The term 'Home Provider' has received official recognition from the Dictionary.</span>
                </p>
              </div>
              
              <div className="pt-4">
                <a 
                  href="#" 
                  className="inline-flex items-center text-purple-700 font-semibold hover:text-purple-800 transition-colors"
                >
                  Learn more
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
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
    </div>
    </>
  )
}
