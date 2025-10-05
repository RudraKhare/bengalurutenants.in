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

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="md:hidden w-full min-h-screen bg-transparent pb-20 pt-12 overflow-x-hidden">
      {/* pt-12 (48px) precisely matches header height for zero gap */}
      
      {/* Hero Section with Indian Monuments Background Carousel - FIXED Z-INDEX */}
      <div className="w-full relative z-30 -mt-12 pt-12">
        {/* Background Carousel - Replaces gradient */}
        <IndianMonumentsCarousel showOverlay={true} overlayOpacity={0.5} />
        
        {/* Tagline Section - Positioned above carousel */}
        <div className="w-full px-4 py-4 border-b border-white/30 relative z-10">
          <h1 className="text-center text-white text-xl font-bold drop-shadow-lg">
            Landlords won't tell You. But we will.
          </h1>
          <p className="mt-2 text-center text-white/95 text-sm drop-shadow-md">
            Discover real tenant stories before renting your next flat.
          </p>
        </div>
        
        {/* Search Section - ENHANCED WITH PROPER Z-INDEX AND VISIBILITY - ALWAYS ABOVE RECENT REVIEWS */}
        <div className="w-full bg-transparent px-4 py-6 relative z-40">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="flex-1 relative" ref={cityDropdownRef} style={{ zIndex: 200 }}>
              {/* Location Pin Icon - Enhanced with Red Color */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search By City"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onFocus={() => setShowCityDropdown(true)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-all font-medium"
              />
              
              {/* City Dropdown - FIXED Z-INDEX AND STYLING - ALWAYS VISIBLE ABOVE RECENT REVIEWS */}
              {showCityDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto" style={{ zIndex: 20000 }}>
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
              className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Action Buttons - ENHANCED STYLING */}
          <div className="flex gap-2 mb-6" style={{ zIndex: 100 }}>
            <Link
              href="/review/add"
              className="flex-1 bg-red-600 text-white text-center py-3 rounded-lg font-medium hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Add Review
            </Link>
            <Link
              href="/property/search"
              className="flex-1 bg-red-600 text-white text-center py-3 rounded-lg font-medium hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              All Properties
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Reviews Section - Smooth transition from gradient background to white */}
      <div className="w-full bg-white rounded-t-3xl shadow-lg relative z-20 -mt-6 px-4 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Reviews</h2>
          <Link href="/reviews" className="text-red-600 text-sm font-medium flex items-center">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Review Cards */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading reviews...</div>
        ) : recentReviews.length > 0 ? (
          <div className="space-y-3">
            {recentReviews.map((review) => (
              <MobileReviewCard key={review.id} review={review} token={token} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">No reviews available yet.</div>
        )}
      </div>

      {/* Home Provider Section */}
      <div className="w-full bg-gradient-to-r from-purple-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Auto-sliding Image Carousel */}
          <div className="relative h-64 rounded-xl overflow-hidden shadow-xl mb-6">
            <div className="carousel-container w-full h-full">
              {/* 1. Taj Mahal, Agra */}
              <div className="carousel-slide">
                <img 
                  src="/monuments/abhinav-sharma-terkRDo1pt8-unsplash.jpg" 
                  alt="Taj Mahal, Agra"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 2. Gateway of India, Mumbai */}
              <div className="carousel-slide">
                <img 
                  src="/monuments/iStock_000058485880_XXXLarge.jpg" 
                  alt="Gateway of India, Mumbai"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 3. Hawa Mahal, Jaipur */}
              <div className="carousel-slide">
                <img 
                  src="/monuments/Rajasthan.jpg.webp" 
                  alt="Hawa Mahal, Jaipur"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 4. India Gate, Delhi */}
              <div className="carousel-slide">
                <img 
                  src="/monuments/adarsh-prakas-NYEy6u4Au9I-unsplash.jpg" 
                  alt="India Gate, Delhi"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 5. Mysore Palace, Mysuru */}
              <div className="carousel-slide">
                <img 
                  src="/monuments/istockphoto-1146517111-612x612.jpg" 
                  alt="Mysore Palace, Mysuru"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 6. Vidhan Soudha, Bengaluru */}
              <div className="carousel-slide">
                <img 
                  src="/monuments/Bengaluru-Vidhana-Soudha-could-be-worth-over-Rs-3900-crores-FB-1200x700-compressed.jpg" 
                  alt="Vidhan Soudha, Bengaluru"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 7. Qutub Minar, Delhi */}
              <div className="carousel-slide">
                <img 
                  src="/monuments/nikhil-patel-Qrlslz4O9NQ-unsplash.jpg" 
                  alt="Qutub Minar, Delhi"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 8. City Palace, Udaipur */}
              <div className="carousel-slide">
                <img 
                  src="/monuments/city-palace-udaipur-rajasthan-1-musthead-hero.jpeg" 
                  alt="City Palace, Udaipur"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 9. Golden Temple, Amritsar */}
              <div className="carousel-slide">
                <img 
                  src="/monuments/harsharan-singh-AGC8TusV2tI-unsplash.jpg" 
                  alt="Golden Temple, Amritsar"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 10. Amber Fort, Jaipur */}
              <div className="carousel-slide">
                <img 
                  src="/monuments/attr_1448_20190212100722jpg.jpeg" 
                  alt="Amber Fort, Jaipur"
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
          
          {/* Content */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                Redefining Rental Relationships
              </h2>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                I am a <span className="line-through text-gray-400">landlord</span>.
                <br />
                <span className="text-purple-700">Home Provider</span>
              </h3>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Home Provider
              </h4>
              <p className="text-gray-600 mb-1 text-sm">
                <span className="font-semibold">(hōm prə'vīdər)</span>
                <br />
                <span className="text-xs italic">noun</span>
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                An owner/operator who views their resident(s) as human, first, and deserving of respect and dignity. 
                They see their residents as part of the solution and not a part of the product.
              </p>
            </div>
            
            <div className="bg-purple-100 rounded-lg p-3 flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs text-purple-900">
                <span className="font-semibold">The term 'Home Provider' has received official recognition from the Dictionary.</span>
              </p>
            </div>
            
            <div className="pt-2">
              <a 
                href="#" 
                className="inline-flex items-center text-purple-700 font-semibold text-sm hover:text-purple-800 transition-colors"
              >
                Learn more
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Why Choose OpenReviews.in?
          </h2>
          
          {/* Core Values Section */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
              Keep your community informed
            </h3>
          
            <div className="space-y-6">
              {/* Anonymity */}
              <div className="text-center bg-white rounded-lg shadow-md p-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 19l-7-7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Anonymity</h4>
                <p className="text-sm text-gray-600">
                  Share your experiences without revealing your identity. Your privacy is protected while your voice is heard.
                </p>
              </div>
              
              {/* Solidarity */}
              <div className="text-center bg-white rounded-lg shadow-md p-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Solidarity</h4>
                <p className="text-sm text-gray-600">
                  Help fellow tenants make informed decisions. Your reviews strengthen our community and support others.
                </p>
              </div>
              
              {/* Transparency */}
              <div className="text-center bg-white rounded-lg shadow-md p-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Transparency</h4>
                <p className="text-sm text-gray-600">
                  Promote a fair and open rental market. Honest reviews create transparency that benefits the entire community.
                </p>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
            Our Features
          </h3>
          <div className="space-y-4">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Verified Reviews</h3>
              <p className="text-sm text-gray-600">
                All reviews are verified through multiple methods including rental agreements and utility bills.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Location-Based</h3>
              <p className="text-sm text-gray-600">
                Find properties and reviews specific to your preferred areas in Bengaluru.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Honest Ratings</h3>
              <p className="text-sm text-gray-600">
                Get detailed ratings on cleanliness, landlord behavior, location, and value for money.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full px-4 py-6 bg-white">
        <div className="max-w-2xl mx-auto bg-blue-50 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Help the Community
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Share your rental experience and help future tenants make better decisions. 
            Your honest review can make a real difference.
          </p>
          <Link
            href="/review/add"
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Share Your Experience
          </Link>
        </div>
      </div>
    </div>
  );
}

// Mobile Review Card Component
function MobileReviewCard({ review, token }: { review: Review; token: string | null }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  React.useEffect(() => {
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
            headers: token ? {
              'Authorization': `Bearer ${token}`
            } : undefined
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${diffDays}d ago`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <Link
      href={`/property/${review.property_id}`}
      className="block w-full bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3 w-full">
      {/* Image */}
      <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
        <ImageWithLoader
          src={imageUrl}
          alt="Property"
          className="h-full"
          loading={imageLoading}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
          {review.property?.address || 'Property'}
        </h3>
        <p className="text-xs text-gray-600 mb-2">
          {review.property?.area}, {review.property?.city}
        </p>
        <p className="text-xs text-gray-700 line-clamp-2 mb-2">
          "{review.comment}"
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{formatTimeAgo(review.created_at)}</span>
          {renderStars(review.rating)}
        </div>
      </div>
      </div>
    </Link>
  );
}
