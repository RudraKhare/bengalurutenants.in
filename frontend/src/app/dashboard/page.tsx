'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buildApiUrl, getAuthHeaders } from '@/lib/api';
import MobileDashboardView from '@/components/MobileDashboardView';
import ImageWithLoader from '@/components/ImageWithLoader';

// Convert email to kebab-case username
const getUsername = (email: string) => {
  const username = email.split('@')[0];
  return username.toLowerCase().replace(/[._]/g, '-');
};

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

export default function DashboardPage() {
  const { isAuthenticated, user, logout, token } = useAuth();
  const router = useRouter();
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [userProperties, setUserProperties] = useState<UserProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    // Fetch user-specific data
    fetchUserData();
  }, [isAuthenticated, router, token]);

  const fetchUserData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user's reviews
      console.log('Fetching reviews from:', buildApiUrl('/api/v1/reviews/my-reviews'));
      const reviewsResponse = await fetch(buildApiUrl('/api/v1/reviews/my-reviews'), {
        headers: getAuthHeaders(token),
      });

      // Fetch user's properties
      console.log('Fetching properties from:', buildApiUrl('/api/v1/reviews/my-properties'));
      const propertiesResponse = await fetch(buildApiUrl('/api/v1/reviews/my-properties'), {
        headers: getAuthHeaders(token),
      });

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        console.log('Reviews data:', reviewsData);
        setUserReviews(reviewsData.reviews || []);
      } else {
        console.error('Failed to fetch reviews:', reviewsResponse.status, reviewsResponse.statusText);
        const errorText = await reviewsResponse.text();
        console.error('Reviews error response:', errorText);
      }

      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        console.log('Properties data:', propertiesData);
        setUserProperties(propertiesData || []);
      } else {
        console.error('Failed to fetch properties:', propertiesResponse.status, propertiesResponse.statusText);
        const errorText = await propertiesResponse.text();
        console.error('Properties error response:', errorText);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <>
        {/* Mobile Loading */}
        <div className="md:hidden w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <div className="text-lg text-gray-700">Loading dashboard...</div>
          </div>
        </div>
        
        {/* Desktop Loading */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-lg text-gray-600">Loading your dashboard...</div>
          </div>
        </div>
      </>
    );
  }

  const username = user?.email ? getUsername(user.email) : '';

  return (
    <>
      {/* Mobile Dashboard View */}
      <MobileDashboardView
        username={username}
        userReviews={userReviews}
        userProperties={userProperties}
      />

      {/* Desktop Dashboard View */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-medium">{username}</span>! 
            Manage your reviews and properties.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">My Reviews</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">{userReviews.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total reviews written</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">My Properties</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{userProperties.length}</p>
          <p className="text-sm text-gray-500 mt-1">Properties listed</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {userReviews.length > 0 
              ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
              : 'N/A'
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">Your average rating given</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          href="/review/add"
          className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">Add New Review</h3>
          <p className="text-red-100">Share your rental experience</p>
        </Link>

        <Link
          href="/property/search"
          className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">Browse Properties</h3>
          <p className="text-green-100">Explore rental listings</p>
        </Link>

        <Link
          href="/profile"
          className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
          <p className="text-gray-100">Manage your account</p>
        </Link>
      </div>

      {/* Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Recent Reviews</h2>
          </div>
          <div className="p-6">
            {userReviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews yet</p>
                <Link href="/review/add" className="text-primary-600 hover:text-primary-700 font-medium">
                  Write your first review
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-l-4 border-primary-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {review.property.address}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {review.property.area}, {review.property.city}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>
                                {i < review.rating ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {review.property_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {review.comment}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {userReviews.length > 3 && (
                  <div className="text-center pt-4">
                    <Link href="/my-reviews" className="text-primary-600 hover:text-primary-700 font-medium">
                      View all {userReviews.length} reviews
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* My Properties */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Properties</h2>
          </div>
          <div className="p-6">
            {userProperties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No properties listed yet</p>
                <Link href="/review/add" className="text-primary-600 hover:text-primary-700 font-medium">
                  Add a property review
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userProperties.slice(0, 3).map((property) => (
                  <div key={property.id} className="border-l-4 border-green-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {property.address}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {property.area}, {property.city}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {property.property_type}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            {property.review_count} reviews
                          </span>
                          {property.avg_rating > 0 && (
                            <span className="ml-2 text-sm text-yellow-600">
                              ★ {property.avg_rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(property.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {userProperties.length > 3 && (
                  <div className="text-center pt-4">
                    <Link href="/my-properties" className="text-green-600 hover:text-green-700 font-medium">
                      View all {userProperties.length} properties
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
