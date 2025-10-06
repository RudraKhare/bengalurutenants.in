'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import PhotoUpload from '@/components/PhotoUpload'
import MapPicker from '@/components/MapPicker'
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/lib/api'
import toast from 'react-hot-toast'
import { getFuzzyLocalitySuggestions } from '@/lib/fuzzyLocality'
import { CityCenters } from '@/lib/cities'


export default function AddReviewPage() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthRedirect, setShowAuthRedirect] = useState(false);
  
  // Data from API
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allLocalities, setAllLocalities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingLocalities, setIsLoadingLocalities] = useState(false);
  
  const [formData, setFormData] = useState({
    propertyAddress: '',
    city: 'Bengaluru', // Default city
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

  // Locality suggestion state
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  const [filteredLocalities, setFilteredLocalities] = useState<string[]>([]);
  const areaInputRef = useRef<HTMLInputElement>(null);
  const localityDropdownRef = useRef<HTMLDivElement>(null);

  // City dropdown state
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const filteredCities = citySearch.trim() === '' ? allCities : allCities.filter((city: string) => city.toLowerCase().includes(citySearch.toLowerCase()));

  // Center map at city center
  const DEFAULT_CITY = 'Bengaluru';
  const DEFAULT_COORDS = { lat: 12.9716, lng: 77.5946 };
  const [mapLat, setMapLat] = useState<number>(DEFAULT_COORDS.lat);
  const [mapLng, setMapLng] = useState<number>(DEFAULT_COORDS.lng);

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

  // Handle authentication redirect
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthRedirect(true);
      router.push('/auth');
    } else {
      setShowAuthRedirect(false);
    }
  }, [isAuthenticated, router]);
  
  // Fetch localities when city changes
  useEffect(() => {
    async function fetchLocalities() {
      if (!formData.city) return;
      
      setIsLoadingLocalities(true);
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.CITIES.LOCALITIES(formData.city)));
        if (response.ok) {
          const localities = await response.json();
          setAllLocalities(localities.map((locality: any) => locality.name));
        }
      } catch (error) {
        console.error('Error fetching localities:', error);
        setAllLocalities([]);
      } finally {
        setIsLoadingLocalities(false);
      }
    }
    fetchLocalities();
  }, [formData.city]);
  
  // Update locality suggestions when area changes
  useEffect(() => {
    if (formData.area.trim() === '') {
      setFilteredLocalities(allLocalities.slice(0, 20));
    } else {
      setFilteredLocalities(getFuzzyLocalitySuggestions(allLocalities, formData.area));
    }
  }, [formData.area, allLocalities]);

  // Move map to city center when city changes
  useEffect(() => {
    if (formData.city && CityCenters[formData.city]) {
      setMapLat(CityCenters[formData.city].lat);
      setMapLng(CityCenters[formData.city].lng);
    }
  }, [formData.city]);

  // Geocode area/locality when it changes
  useEffect(() => {
    async function geocodeArea() {
      if (!formData.area || !formData.city) return;
      const address = `${formData.area}, ${formData.city}, India`;
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setMapLat(results[0].geometry.location.lat());
            setMapLng(results[0].geometry.location.lng());
          }
        });
      } catch (err) {
        // fallback: do nothing
      }
    }
    geocodeArea();
  }, [formData.area, formData.city]);

  // Hide locality dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (localityDropdownRef.current && !localityDropdownRef.current.contains(event.target as Node) && 
          areaInputRef.current && !areaInputRef.current.contains(event.target as Node)) {
        setShowLocalityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hide city dropdown when clicking outside
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

      // Update toast message
      toast.loading('Submitting your review...', { id: loadingToast })
      
      // Now prepare the review data using the new property_id
      // Note: Only send the user's actual comment text, not the rating breakdown
      // The detailed ratings are shown separately in the UI
      const reviewData = {
        property_id: propertyId,
        property_type: formData.propertyType, // Include user-confirmed property type
        rating: formData.rating,
        comment: formData.comment || null, // Only the user's textual review 
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

  // Show redirect message if not authenticated
  if (showAuthRedirect) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please log in to submit a review. Redirecting...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
        <div className="max-w-[1800px] mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Share Your Rental Experience
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Help other tenants by sharing your honest review of the property and landlord.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 space-y-4 sm:space-y-5 md:space-y-6">
        {/* Row 1: Property Information (Left) + Map (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* Left: Property Information */}
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6">Property Information</h2>
            
            <div className="space-y-3 sm:space-y-4">
              {/* City Dropdown - Custom Styled */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">City *</label>
                <div className="relative z-40" ref={cityDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 text-left font-medium px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-300 transition-colors flex items-center justify-between text-sm sm:text-base"
                  >
                    <span className="truncate">{formData.city}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCityDropdown && (
                    <div className="absolute left-0 top-full w-full z-[99999] bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl">
                      <div className="p-2 sm:p-3">
                        <input
                          type="text"
                          value={citySearch}
                          onChange={e => setCitySearch(e.target.value)}
                          placeholder="Search city..."
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 mb-2 sm:mb-3 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="max-h-48 sm:max-h-60 overflow-auto">
                          {filteredCities.map(city => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => { handleInputChange('city', city); setShowCityDropdown(false); setCitySearch(''); }}
                              className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 hover:bg-blue-50 rounded cursor-pointer transition-colors mb-0.5 sm:mb-1"
                            >
                              {city}
                            </button>
                          ))}
                          {filteredCities.length === 0 && (
                            <div className="text-gray-500 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">No cities found</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Property Address */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Property Address *</label>
                <textarea
                  className="input-field px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg bg-white/60 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all duration-150"
                  style={{ WebkitBackdropFilter: 'blur(8px)' }}
                  rows={3}
                  placeholder="Enter complete address including building name, street, etc."
                  value={formData.propertyAddress}
                  onChange={e => handleInputChange('propertyAddress', e.target.value)}
                  required
                />
              </div>
              {/* Area/Locality Dropdown */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Area/Locality *</label>
                <div className="relative">
                  <input
                    type="text"
                    className="input-field px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg bg-white/60 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all duration-150"
                    style={{ WebkitBackdropFilter: 'blur(8px)' }}
                    placeholder="e.g., Koramangala, Indiranagar, HSR Layout"
                    value={formData.area}
                    onChange={e => { handleInputChange('area', e.target.value); setShowLocalityDropdown(true); }}
                    onFocus={() => setShowLocalityDropdown(true)}
                    ref={areaInputRef}
                    required
                  />
                  {showLocalityDropdown && filteredLocalities.length > 0 && (
                    <div
                      ref={localityDropdownRef}
                      className="absolute z-[99999] mt-1 w-full bg-white/80 border border-gray-200 rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl backdrop-blur-md max-h-48 sm:max-h-60 overflow-auto transition-all duration-150"
                      style={{ top: '100%', left: 0, WebkitBackdropFilter: 'blur(8px)' }}
                    >
                      {filteredLocalities.map((locality) => (
                        <button
                          key={locality}
                          type="button"
                          onClick={() => { handleInputChange('area', locality); setShowLocalityDropdown(false); }}
                          className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 hover:bg-blue-50 hover:text-blue-600 cursor-pointer border-b border-gray-100 last:border-0 transition-all duration-100"
                        >
                          {locality}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Property Type Dropdown */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Property Type *</label>
                <div className="relative">
                  <select
                    className="input-field px-3 sm:px-4 py-3 sm:py-4 pr-8 sm:pr-10 border border-gray-200 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg bg-white/60 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base appearance-none transition-all duration-150"
                    style={{ WebkitBackdropFilter: 'blur(8px)' }}
                    value={formData.propertyType}
                    onChange={e => handleInputChange('propertyType', e.target.value)}
                    required
                  >
                    <option value="FLAT_APARTMENT">Flat/Apartment</option>
                    <option value="VILLA_HOUSE">Villa/House</option>
                    <option value="PG_HOSTEL">PG/Hostel</option>
                  </select>
                  <span className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 text-sm">▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Map (Always Visible) */}
          <div className="card">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">📍 Property Location</h2>
              {!locationConfirmed && (
                <span className="text-xs text-gray-500 hidden sm:inline">Drag marker to exact location</span>
              )}
            </div>
            <MapPicker
              onLocationSelect={handleLocationSelect}
              lat={mapLat}
              lng={mapLng}
              height="400px"
            />
            {!locationConfirmed && (
              <div className="mt-3 sm:mt-4">
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm sm:text-base"
                >
                  ✓ Confirm This Location
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  💡 You can adjust the marker anytime before submitting
                </p>
              </div>
            )}
          </div>
        </div> {/* Close grid container for property info + map */}

        {/* Row 2: Overall Rating + Written Review (Left) + Detailed Ratings (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* Left: Overall Rating + Written Review */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Overall Rating */}
            <div className="card">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 py-3 sm:py-4">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Rate your experience:</span>
                <div className="flex space-x-1 sm:space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                      onClick={() => handleInputChange('rating', star)}
                    >
                      <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">{formData.rating}/5</span>
              </div>
            </div>

            {/* Written Review */}
            <div className="card">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6">Written Review</h2>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Share your experience in detail
                </label>
                <textarea
                  className="input-field text-sm sm:text-base"
                  rows={8}
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  placeholder="Tell us about your experience living here. Include details about the property condition, landlord behavior, neighborhood, amenities, etc."
                  required
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Be honest and specific. Your review will help other tenants make informed decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Detailed Ratings */}
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6">Detailed Ratings</h2>
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {[
                { key: 'cleanliness', label: 'Cleanliness & Maintenance', icon: '🧹' },
                { key: 'landlordRating', label: 'Landlord Behavior', icon: '👤' },
                { key: 'location', label: 'Location & Connectivity', icon: '📍' },
                { key: 'valueForMoney', label: 'Value for Money', icon: '💰' }
              ].map(({ key, label, icon }) => (
                <div key={key} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    {icon} {label}
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-0.5 sm:space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${star <= (formData[key as keyof typeof formData] as number) ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                          onClick={() => handleInputChange(key, star)}
                        >
                          <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <span className="text-base sm:text-lg font-bold text-gray-900 ml-2 sm:ml-3">
                      {formData[key as keyof typeof formData] as number}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> {/* Close grid container for overall rating + review + detailed ratings */}

        {/* Row 3: Photo Upload (Left) + Verification (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* Left: Photo Upload */}
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6">📸 Add Photos (Optional)</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Upload photos to support your review. Photos help other tenants see the actual condition of the property.
            </p>
            <PhotoUpload
              fileType="review"
              onUploadComplete={handlePhotoUpload}
              maxFiles={5}
              className="mb-3 sm:mb-4"
            />
            {formData.photoKeys.length > 0 && (
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-xs sm:text-sm text-green-800">
                  ✅ {formData.photoKeys.length} photo(s) uploaded successfully
                </p>
              </div>
            )}
          </div>

          {/* Right: Verification */}
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6">🔒 Verification (Optional)</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Verify your tenancy to increase trust in your review. Verified reviews are given more weight.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Verification Method
              </label>
              <select
                value={formData.verificationMethod}
                onChange={(e) => handleInputChange('verificationMethod', e.target.value)}
                className="input-field text-sm sm:text-base"
              >
                <option value="rental_agreement">Rental Agreement</option>
                <option value="upi_transaction">UPI Transaction Receipt</option>
                <option value="utility_bill">Utility Bill</option>
                <option value="bank_statement">Bank Statement</option>
                <option value="photos">Property Photos</option>
              </select>
              <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 sm:p-5 md:p-6 text-center">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="mt-2 block text-xs sm:text-sm font-medium text-gray-900">
                  Upload verification document
                </span>
                <span className="mt-1 block text-xs sm:text-sm text-gray-600">
                  PNG, JPG, PDF up to 10MB
                </span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" />
              </div>
              <p className="text-xs text-gray-500">
                Your documents are encrypted and only used for verification. We do not share personal information.
              </p>
            </div>
          </div>
        </div> {/* Close grid container for photo upload + verification */}

        {/* Row 4: Terms and Submit (Full Width) */}
        <div className="card">
          <div className="space-y-3 sm:space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="mt-0.5 sm:mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                required
              />
              <span className="ml-2 text-xs sm:text-sm text-gray-600">
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
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
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