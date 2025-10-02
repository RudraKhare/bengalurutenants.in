'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import PhotoUpload from '@/components/PhotoUpload'
import MapPicker from '@/components/MapPicker'
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AddReviewPage() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthRedirect, setShowAuthRedirect] = useState(false);
  
  const [formData, setFormData] = useState({
    propertyAddress: '',
    city: 'Bengaluru', // Keep city as fixed to Bengaluru for now
    area: '',
    propertyType: 'FLAT_APARTMENT', // New property type field
    rating: 5,
    comment: '',
    cleanliness: 5,
    landlordRating: 5,
    location: 5,
    valueForMoney: 5,
    verificationMethod: 'rental_agreement',
    agreeToTerms: false,
    photoKeys: [] as string[] // Store uploaded photo object keys
  });

  // Map-related state
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  // Handle authentication redirect
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthRedirect(true);
      router.push('/auth');
    } else {
      setShowAuthRedirect(false);
    }
  }, [isAuthenticated, router]);
  
  // Show redirect message if not authenticated
  if (showAuthRedirect) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please log in to submit a review. Redirecting...</p>
      </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    // Create a toast notification to show progress
    const loadingToast = toast.loading('Creating property listing...')
    
    try {
      setIsSubmitting(true)
      
      // Make sure we have a token before proceeding
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }
      
      // First, create the property if it doesn't exist yet
      // We need to create a property first since the review requires a property_id
      // Format the address with area included
      const fullAddress = `${formData.propertyAddress}${formData.area ? ', ' + formData.area : ''}`.trim();
      
      const propertyResponse = await fetch(buildApiUrl(API_ENDPOINTS.PROPERTIES.CREATE), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          address: fullAddress,
          city: formData.city,
          area: formData.area,
          property_type: formData.propertyType, // Add property type to property creation
          lat: lat || undefined, // Include coordinates if confirmed
          lng: lng || undefined
        })
      });

      if (!propertyResponse.ok) {
        const errorText = await propertyResponse.text();
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error("Failed to parse error response:", errorText);
        }
        
        console.error("Property creation error details:", errorData);
        throw new Error(
          (errorData as any).detail || 
          (errorData as any).message || 
          `Error creating property: ${propertyResponse.status} ${propertyResponse.statusText}`
        );
      }

      const propertyData = await propertyResponse.json();
      const propertyId = propertyData.id;

      // Format all the information into a detailed review body
      const reviewBody = `
Overall Rating: ${formData.rating}/5
Cleanliness: ${formData.cleanliness}/5
Landlord Rating: ${formData.landlordRating}/5
Location: ${formData.location}/5
Value For Money: ${formData.valueForMoney}/5

${formData.comment || 'No additional comments provided.'}
      `.trim();
      
      // Update toast message
      toast.loading('Submitting your review...', { id: loadingToast })
      
      // Now prepare the review data using the new property_id
      const reviewData = {
        property_id: propertyId,
        property_type: formData.propertyType, // Include user-confirmed property type
        rating: formData.rating,
        comment: reviewBody, 
        // Include photo keys only if there are any
        ...(formData.photoKeys.length > 0 ? { photo_keys: formData.photoKeys.join(',') } : {})
      }
      
      console.log('Submitting review data:', reviewData)
      
      // Submit to backend API
      const response = await fetch(buildApiUrl(API_ENDPOINTS.REVIEWS.CREATE), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(reviewData)
      })
      
      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error("Failed to parse error response:", errorText);
        }
        
        console.error("Review creation error details:", errorData);
        throw new Error(
          (errorData as any).detail || 
          (errorData as any).message || 
          `Error: ${response.status} ${response.statusText}`
        );
      }
      
      const result = await response.json()
      console.log('Review submitted successfully:', result)
      
      // Show success message
      toast.dismiss(loadingToast)
      toast.success('Review submitted successfully!')
      
      // Redirect to the property detail page to see the posted review
      router.push(`/property/${propertyId}`);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to submit review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (objectKeys: string[]) => {
    setFormData(prev => ({
      ...prev,
      photoKeys: objectKeys
    }));
  };

  // Handle location selection from map
  const handleLocationSelect = (latitude: number, longitude: number, address?: string) => {
    setLat(latitude);
    setLng(longitude);
    if (address) {
      // Update address from reverse geocoding if provided
      handleInputChange('propertyAddress', address);
    }
  };

  // Confirm location
  const handleConfirmLocation = () => {
    if (!lat || !lng) {
      toast.error('Please select a location on the map');
      return;
    }
    setLocationConfirmed(true);
    toast.success('Location confirmed!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-[1800px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Share Your Rental Experience
          </h1>
          <p className="text-gray-600">
            Help other tenants by sharing your honest review of the property and landlord.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[1800px] mx-auto px-6 py-6 space-y-6">
        {/* Row 1: Property Information (Left) + Map (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Property Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Address *
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Enter complete address including building name, street, etc."
                  value={formData.propertyAddress}
                  onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area/Locality *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Koramangala, Indiranagar, HSR Layout"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  className="input-field"
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  required
                >
                  <option value="FLAT_APARTMENT">Flat/Apartment</option>
                  <option value="VILLA_HOUSE">Villa/House</option>
                  <option value="PG_HOSTEL">PG/Hostel</option>
                </select>
              </div>

              {locationConfirmed && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">✓ Location Confirmed on Map</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Map (Always Visible) */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">📍 Property Location</h2>
              {!locationConfirmed && (
                <span className="text-xs text-gray-500">Drag marker to exact location</span>
              )}
            </div>
            <MapPicker
              initialLat={lat || undefined}
              initialLng={lng || undefined}
              onLocationSelect={handleLocationSelect}
              height="400px"
            />
            {!locationConfirmed && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  ✓ Confirm This Location
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  💡 You can adjust the marker anytime before submitting
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Overall Rating + Written Review (Left) + Detailed Ratings (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Overall Rating + Written Review */}
          <div className="space-y-6">
            {/* Overall Rating */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Overall Rating</h2>
              
              <div className="flex items-center justify-center space-x-4 py-4">
                <span className="text-sm font-medium text-gray-700">Rate your experience:</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`w-10 h-10 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                      onClick={() => handleInputChange('rating', star)}
                    >
                      <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900">{formData.rating}/5</span>
              </div>
            </div>

            {/* Written Review */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Written Review</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share your experience in detail
                </label>
                <textarea
                  className="input-field"
                  rows={8}
                  placeholder="Tell us about your experience living here. Include details about the property condition, landlord behavior, neighborhood, amenities, etc."
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Be honest and specific. Your review will help other tenants make informed decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Detailed Ratings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Ratings</h2>
            
            <div className="space-y-6">
            {[
              { key: 'cleanliness', label: 'Cleanliness & Maintenance', icon: '🧹' },
              { key: 'landlordRating', label: 'Landlord Behavior', icon: '👤' },
              { key: 'location', label: 'Location & Connectivity', icon: '📍' },
              { key: 'valueForMoney', label: 'Value for Money', icon: '💰' }
            ].map(({ key, label, icon }) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {icon} {label}
                </label>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`w-8 h-8 ${star <= (formData[key as keyof typeof formData] as number) ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                        onClick={() => handleInputChange(key, star)}
                      >
                        <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900 ml-3">
                    {formData[key as keyof typeof formData] as number}/5
                  </span>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Row 3: Photo Upload (Left) + Verification (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Photo Upload */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">📸 Add Photos (Optional)</h2>
            <p className="text-gray-600 mb-4">
              Upload photos to support your review. Photos help other tenants see the actual condition of the property.
            </p>
            
            <PhotoUpload
              fileType="review"
              onUploadComplete={handlePhotoUpload}
              maxFiles={5}
              className="mb-4"
            />
            
            {formData.photoKeys.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✅ {formData.photoKeys.length} photo(s) uploaded successfully
                </p>
              </div>
            )}
          </div>

          {/* Right: Verification */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">🔒 Verification (Optional)</h2>
            
            <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Verify your tenancy to increase trust in your review. Verified reviews are given more weight.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Method
              </label>
              <select
                className="input-field"
                value={formData.verificationMethod}
                onChange={(e) => handleInputChange('verificationMethod', e.target.value)}
              >
                <option value="rental_agreement">Rental Agreement</option>
                <option value="utility_bill">Utility Bill</option>
                <option value="upi_transaction">UPI Transaction Receipt</option>
                <option value="bank_statement">Bank Statement</option>
                <option value="photos">Property Photos</option>
              </select>
            </div>
            
            <div className="border-dashed border-2 border-gray-300 rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload verification document
                  </span>
                  <span className="mt-1 block text-sm text-gray-600">
                    PNG, JPG, PDF up to 10MB
                  </span>
                </label>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" />
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              Your documents are encrypted and only used for verification. We do not share personal information.
            </p>
            </div>
          </div>
        </div>

        {/* Row 4: Terms and Submit (Full Width) */}
        <div className="card">
          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                required
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </a>
                . I confirm that this review is based on my genuine experience as a tenant.
              </span>
            </label>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!formData.agreeToTerms || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
