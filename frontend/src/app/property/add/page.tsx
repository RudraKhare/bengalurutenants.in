'use client';

/**
 * Add Property Page - Create new property listings with map integration
 * 
 * Features:
 * - Address input with auto-geocoding
 * - Manual pin-drop on map
 * - Location confirmation
 * - Property photo upload
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MapPicker from '@/components/MapPicker';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'location' | 'details'>('address');
  
  // Form state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState<'VILLA_HOUSE' | 'FLAT_APARTMENT' | 'PG_HOSTEL'>('FLAT_APARTMENT');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState('');

  // Geocode address
  const handleGeocodeAddress = async () => {
    if (!address.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(buildApiUrl('/api/v1/geocoding/geocode'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: `${address}, ${city}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }

      const data = await response.json();
      
      setLat(data.latitude);
      setLng(data.longitude);
      setGeocodedAddress(data.formatted_address);
      setStep('location');
      toast.success('Address found! Please confirm the location on the map');
      
    } catch (error: any) {
      console.error('Geocoding error:', error);
      toast.error(error.message || 'Failed to find address. Try manual pin-drop instead.');
    } finally {
      setLoading(false);
    }
  };

  // Handle location selection from map
  const handleLocationSelect = (latitude: number, longitude: number, addressFromMap?: string) => {
    setLat(latitude);
    setLng(longitude);
    if (addressFromMap) {
      setGeocodedAddress(addressFromMap);
    }
    setLocationConfirmed(true);
  };

  // Submit property
  const handleSubmit = async () => {
    if (!address || !city || !lat || !lng) {
      toast.error('Please complete all required fields and confirm location');
      return;
    }

    setLoading(true);

    try {
      // Get auth token
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please log in to add a property');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.PROPERTIES.CREATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address: address.trim(),
          city: city.trim(),
          area: area.trim() || null,
          property_type: propertyType,
          lat,
          lng
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create property');
      }

      const property = await response.json();
      
      toast.success('Property added successfully!');
      router.push(`/property/${property.id}`);
      
    } catch (error: any) {
      console.error('Property creation error:', error);
      toast.error(error.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Add a Property
        </h1>
        <p className="text-gray-600">
          Share information about a rental property to help other tenants make informed decisions
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step === 'address' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step === 'address' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Address</span>
          </div>
          
          <div className="w-16 h-1 bg-gray-300" />
          
          <div className={`flex items-center ${step === 'location' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step === 'location' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Location</span>
          </div>
          
          <div className="w-16 h-1 bg-gray-300" />
          
          <div className={`flex items-center ${step === 'details' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Confirm</span>
          </div>
        </div>
      </div>

      {/* Step 1: Address Input */}
      {step === 'address' && (
        <div className="bg-white rounded-lg shadow-md border p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Address *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123, MG Road, Brigade Road"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area / Locality
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g., Koramangala"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="VILLA_HOUSE">Villa / House</option>
              <option value="FLAT_APARTMENT">Flat / Apartment</option>
              <option value="PG_HOSTEL">PG / Hostel</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleGeocodeAddress}
              disabled={loading || !address.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Finding Location...' : '📍 Find on Map'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('location')}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              🎯 Manual Pin-Drop
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Location Confirmation */}
      {step === 'location' && (
        <div className="bg-white rounded-lg shadow-md border p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Confirm Property Location</h2>
            <p className="text-sm text-gray-600 mb-4">
              {geocodedAddress ? (
                <>Found: <span className="font-medium">{geocodedAddress}</span></>
              ) : (
                'Drag the pin to the exact location of the property'
              )}
            </p>
          </div>

          <MapPicker
            initialLat={lat || undefined}
            initialLng={lng || undefined}
            onLocationSelect={handleLocationSelect}
            height="500px"
          />

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep('address')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              ← Back
            </button>
            
            <button
              type="button"
              onClick={() => setStep('details')}
              disabled={!locationConfirmed}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              Confirm Location →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Final Confirmation */}
      {step === 'details' && (
        <div className="bg-white rounded-lg shadow-md border p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Review and Submit</h2>
          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="text-sm text-gray-600">Address:</span>
              <p className="font-medium">{address}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">City:</span>
                <p className="font-medium">{city}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Area:</span>
                <p className="font-medium">{area || 'Not specified'}</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-600">Property Type:</span>
              <p className="font-medium">
                {propertyType === 'VILLA_HOUSE' ? 'Villa / House' : 
                 propertyType === 'FLAT_APARTMENT' ? 'Flat / Apartment' : 'PG / Hostel'}
              </p>
            </div>

            <div>
              <span className="text-sm text-gray-600">Coordinates:</span>
              <p className="font-medium">{lat?.toFixed(6)}, {lng?.toFixed(6)}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep('location')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              ← Back
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Adding Property...' : '✓ Add Property'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
