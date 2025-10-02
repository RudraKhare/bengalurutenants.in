'use client';

import { useState } from 'react';
import ReviewForm from '@/components/ReviewForm';
import PhotoViewer from '@/components/PhotoViewer';
import PropertyLocationMap from '@/components/PropertyLocationMap';
import { useAuth } from '@/hooks/useAuth';

interface Property {
  id: number;
  address: string;
  city: string;
  area?: string;
  lat?: number;
  lng?: number; // Changed from 'lon' to match database field name
  photo_keys?: string; // Day 3: Comma-separated R2 object keys (not in database but kept for frontend)
  created_at: string;
  avg_rating?: number;
  review_count: number;
  // Add missing property fields
  property_type?: string;
  rent_amount?: number;
  deposit_amount?: number;
  square_feet?: number;
  description?: string;
  amenities?: string;
}

interface Review {
  id: number;
  property_id: number;
  user_id: number;
  rating: number;
  comment: string; // Changed from 'body' to match database field name
  verification_level: string;
  photo_keys?: string; // Day 3: Review photos (not in database, but kept for frontend)
  created_at: string;
}

interface PropertyDetailPageProps {
  property: Property;
  initialReviews: Review[];
  totalReviews: number;
}

export default function PropertyDetailPage({ 
  property, 
  initialReviews, 
  totalReviews 
}: PropertyDetailPageProps) {
  const { token, isAuthenticated = !!token } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleReviewSubmitted = (newReview: Review) => {
    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not specified';
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`${sizeClasses[size]} fill-current ${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`} 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <a href="/" className="hover:text-blue-600">Home</a>
          </li>
          <li>/</li>
          <li>
            <a href="/" className="hover:text-blue-600">Properties</a>
          </li>
          <li>/</li>
          <li className="text-gray-900">{property.address}</li>
        </ol>
      </nav>

      {/* Property Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {property.address}
            </h1>
            <p className="text-gray-600 mb-4">
              {property.city}
            </p>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              {renderStars(property.avg_rating || 0, 'lg')}
              <span className="text-lg font-medium text-gray-900 ml-2">
                {property.avg_rating?.toFixed(1) || 'No ratings'}
              </span>
              <span className="text-gray-500 ml-2">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-1 font-medium">{property.property_type || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Rent:</span>
                <span className="ml-1 font-medium">{formatCurrency(property.rent_amount)}</span>
              </div>
              <div>
                <span className="text-gray-500">Deposit:</span>
                <span className="ml-1 font-medium">{formatCurrency(property.deposit_amount)}</span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-1 font-medium">
                  {property.square_feet ? `${property.square_feet} sq ft` : 'Not specified'}
                </span>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
                <p className="text-gray-700">{property.amenities}</p>
              </div>
            )}

            {/* Property Photos */}
            {property.photo_keys ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Photos</h3>
                <PhotoViewer 
                  objectKeys={property.photo_keys} 
                  className="rounded-lg"
                  maxThumbnails={6}
                />
              </div>
            ) : (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div key={index} className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-200">
                      <img 
                        src={`https://picsum.photos/400/300?random=${property.id}${index}`}
                        alt={`Property placeholder ${index}`}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Property+Photo+${index}`;
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Placeholder images shown. Actual property photos will be displayed when uploaded by the property owner.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
            {isAuthenticated ? (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="btn-primary"
              >
                Write Review
              </button>
            ) : (
              <a 
                href="/auth/login"
                className="btn-primary text-center"
              >
                Login to Review
              </a>
            )}
            <button className="btn-secondary">
              Save Property
            </button>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                <button 
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <ReviewForm 
                propertyId={property.id}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="space-y-8">
        {/* Reviews Header - Overall Rating with Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Left Side - Overall Rating */}
            <div className="flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Overall Rating
              </h2>
              {totalReviews > 0 ? (
                <div>
                  <div className="flex items-center mb-2">
                    <svg className="w-8 h-8 text-gray-900 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-3xl font-bold text-gray-900">
                      {property.avg_rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-xl text-gray-500 ml-2">
                      · {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                  
                  {/* Rating Breakdown */}
                  <div className="space-y-2 mt-6">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews.filter(r => Math.floor(r.rating) === rating).length;
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-3">{rating}</span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gray-900 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No ratings yet</div>
              )}
            </div>

            {/* Right Side - Category Ratings */}
            {totalReviews > 0 && (
              <div className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Cleanliness', icon: '🧹' },
                    { label: 'Landlord', icon: '👤' },
                    { label: 'Location', icon: '📍' },
                    { label: 'Value', icon: '💰' }
                  ].map(({ label, icon }) => (
                    <div key={label} className="flex flex-col">
                      <div className="text-2xl mb-2">{icon}</div>
                      <div className="text-sm text-gray-600 mb-1">{label}</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {property.avg_rating?.toFixed(1) || '0.0'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Write Review Button */}
            {isAuthenticated && (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="btn-primary lg:mt-0 whitespace-nowrap"
              >
                Write a Review
              </button>
            )}
          </div>
        </div>

        {/* Reviews List - Full Width */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your experience about this property!</p>
              {isAuthenticated ? (
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="btn-primary"
                >
                  Write First Review
                </button>
              ) : (
                <a 
                  href="/auth/login"
                  className="btn-primary inline-block"
                >
                  Login to Write Review
                </a>
              )}
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Review Header */}
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-3 flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Anonymous Tenant</div>
                        <div className="text-sm text-gray-500">
                          {review.verification_level} • {formatDate(review.created_at)}
                        </div>
                      </div>
                    </div>
                    {renderStars(review.rating, 'md')}
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  )}

                  {/* Review Photos */}
                  {review.photo_keys && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Review Photos</h4>
                      <PhotoViewer 
                        objectKeys={review.photo_keys} 
                        className="rounded-lg"
                        maxThumbnails={4}
                      />
                    </div>
                  )}
                </div>

                {/* Detailed Ratings Below Each Review */}
                <div className="p-6 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Ratings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Cleanliness', icon: '🧹', key: 'cleanliness' },
                      { label: 'Landlord Behavior', icon: '👤', key: 'landlord' },
                      { label: 'Location', icon: '📍', key: 'location' },
                      { label: 'Value', icon: '💰', key: 'value' }
                    ].map(({ label, icon, key }) => (
                      <div key={key} className="flex flex-col">
                        <div className="text-3xl mb-2">{icon}</div>
                        <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {review.rating.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Location Map - Full Width at Bottom */}
        {property.lat && property.lng && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Location
            </h3>
            <div className="mb-3">
              <p className="text-gray-700">{property.address}</p>
              <p className="text-sm text-gray-500 mt-1">
                Coordinates: {property.lat.toFixed(6)}, {property.lng.toFixed(6)}
              </p>
            </div>
            <PropertyLocationMap 
              lat={property.lat} 
              lng={property.lng} 
              address={property.address}
              height="500px"
            />
          </div>
        )}
      </div>
    </div>
  );
}
