'use client'

import { useState } from 'react'

export default function AddReviewPage() {
  const [formData, setFormData] = useState({
    propertyAddress: '',
    city: 'Bengaluru',
    area: '',
    rating: 5,
    comment: '',
    cleanliness: 5,
    landlordRating: 5,
    location: 5,
    valueForMoney: 5,
    verificationMethod: 'rental_agreement',
    agreeToTerms: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit review to API
    console.log('Review submitted:', formData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Share Your Rental Experience
        </h1>
        <p className="text-gray-600">
          Help other tenants by sharing your honest review of the property and landlord.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Property Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  className="input-field"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                >
                  <option value="Bengaluru">Bengaluru</option>
                  {/* TODO: Add more cities later */}
                </select>
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
            </div>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Overall Rating</h2>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Rate your overall experience:</span>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleInputChange('rating', star)}
                >
                  <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <span className="text-lg font-medium text-gray-900">{formData.rating}/5</span>
          </div>
        </div>

        {/* Detailed Ratings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Ratings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'cleanliness', label: 'Cleanliness & Maintenance' },
              { key: 'landlordRating', label: 'Landlord Behavior' },
              { key: 'location', label: 'Location & Connectivity' },
              { key: 'valueForMoney', label: 'Value for Money' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`w-6 h-6 ${star <= (formData[key as keyof typeof formData] as number) ? 'text-yellow-400' : 'text-gray-300'}`}
                      onClick={() => handleInputChange(key, star)}
                    >
                      <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {formData[key as keyof typeof formData] as number}/5
                  </span>
                </div>
              </div>
            ))}
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
              rows={6}
              placeholder="Tell us about your experience living here. Include details about the property condition, landlord behavior, neighborhood, amenities, etc."
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-2">
              Be honest and specific. Your review will help other tenants make informed decisions.
            </p>
          </div>
        </div>

        {/* Verification */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Verification (Optional)</h2>
          
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

        {/* Terms and Submit */}
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
                disabled={!formData.agreeToTerms}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
