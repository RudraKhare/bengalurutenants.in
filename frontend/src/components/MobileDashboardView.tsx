'use client';

import React from 'react';
import Link from 'next/link';

interface UserReview {
  id: number;
  rating: number;
  comment: string;
  property_type: string;
  verification_level: string;
  created_at: string;
  property: {
    id: number;
    address: string;
    city: string;
    area: string;
  };
}

interface UserProperty {
  id: number;
  address: string;
  city: string;
  area: string;
  property_type: string;
  avg_rating: number;
  review_count: number;
  created_at: string;
}

interface MobileDashboardViewProps {
  username: string;
  userReviews: UserReview[];
  userProperties: UserProperty[];
}

export default function MobileDashboardView({ username, userReviews, userProperties }: MobileDashboardViewProps) {
  const averageRating = userReviews.length > 0 
    ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
    : 'N/A';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="md:hidden w-full min-h-screen bg-transparent pb-20 pt-12 overflow-x-hidden">
      {/* pt-12 (48px) matches header height */}
      
      {/* Hero Section with gradient background matching homepage */}
      <div className="w-full relative z-10 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 -mt-12 pt-12">
        {/* Decorative Background Elements - Animated Blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Welcome Section */}
        <div className="w-full px-4 py-4 border-b border-white/20 relative z-10">
          <h1 className="text-center text-gray-900 text-xl font-bold">
            Dashboard
          </h1>
          <p className="mt-2 text-center text-gray-700 text-sm">
            Welcome back, <span className="font-semibold">{username}</span>!
          </p>
        </div>
        
        {/* Stats Section */}
        <div className="w-full px-4 py-6 relative z-10">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* Reviews Stat */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm text-center">
              <div className="text-2xl font-bold text-red-600">{userReviews.length}</div>
              <div className="text-xs text-gray-600 mt-1">Reviews</div>
            </div>
            
            {/* Properties Stat */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm text-center">
              <div className="text-2xl font-bold text-green-600">{userProperties.length}</div>
              <div className="text-xs text-gray-600 mt-1">Properties</div>
            </div>
            
            {/* Avg Rating Stat */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm text-center">
              <div className="text-2xl font-bold text-yellow-600">{averageRating}</div>
              <div className="text-xs text-gray-600 mt-1">Avg Rating</div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-2 mb-6">
            <Link
              href="/review/add"
              className="flex items-center justify-between bg-red-600 text-white p-3 rounded-lg shadow-sm hover:bg-red-700 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium text-sm">Add New Review</span>
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/property/search"
                className="flex flex-col items-center bg-green-600 text-white p-3 rounded-lg shadow-sm hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-medium text-xs">Browse</span>
              </Link>

              <Link
                href="/profile"
                className="flex flex-col items-center bg-gray-600 text-white p-3 rounded-lg shadow-sm hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-xs">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - White card sliding over gradient */}
      <div className="w-full bg-white rounded-t-3xl shadow-lg relative z-20 -mt-6 px-4 pt-6 pb-4">
        {/* My Recent Reviews */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">Recent Reviews</h2>
            {userReviews.length > 3 && (
              <Link href="/my-reviews" className="text-red-600 text-xs font-medium">
                View All ({userReviews.length})
              </Link>
            )}
          </div>

          {userReviews.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-sm text-gray-500 mb-3">No reviews yet</p>
              <Link href="/review/add" className="text-red-600 hover:text-red-700 font-medium text-sm">
                Write your first review
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {review.property.address}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {review.property.area}, {review.property.city}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">{formatDate(review.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {review.property_type}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-700 line-clamp-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Properties */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">My Properties</h2>
            {userProperties.length > 3 && (
              <Link href="/my-properties" className="text-green-600 text-xs font-medium">
                View All ({userProperties.length})
              </Link>
            )}
          </div>

          {userProperties.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p className="text-sm text-gray-500 mb-3">No properties yet</p>
              <Link href="/review/add" className="text-green-600 hover:text-green-700 font-medium text-sm">
                Add a property review
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userProperties.slice(0, 3).map((property) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="block bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {property.address}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {property.area}, {property.city}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">{formatDate(property.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        {property.property_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {property.review_count} reviews
                      </span>
                    </div>
                    {property.avg_rating > 0 && (
                      <span className="text-sm text-yellow-600 font-medium">
                        ★ {property.avg_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Activity Summary</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Total Reviews Written</span>
              <span className="font-semibold text-gray-900">{userReviews.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Properties Reviewed</span>
              <span className="font-semibold text-gray-900">{userProperties.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Rating Given</span>
              <span className="font-semibold text-gray-900">{averageRating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
