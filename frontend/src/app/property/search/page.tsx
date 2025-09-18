'use client';

import { useState, useEffect, useRef } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import { AllBengaluruLocalities, BengaluruLocalities } from '@/lib/localities';
import { useSearchParams } from 'next/navigation';
import SearchInput from '@/components/search/SearchInput';
import PropertyCard from '@/components/PropertyCard';

interface Property {
  id: number;
  address: string;
  city: string;
  area?: string;
  property_type?: string; // Now properly mapped from backend
  lat?: number;
  lng?: number;
  photo_keys?: string; // Comma-separated R2 object keys
  created_at: string;
  avg_rating?: number;
  review_count: number;
  rent_amount?: number;
  deposit_amount?: number;
}

interface SearchResponse {
  properties: Property[];
  total: number;
  skip: number;
  limit: number;
}

export default function PropertySearchPage() {
  const searchParams = useSearchParams();
  const initialArea = searchParams.get('area') || '';
  const initialPropertyType = searchParams.get('propertyType') || 'villaHouse';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchArea, setSearchArea] = useState(initialArea);
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLocalities, setFilteredLocalities] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const itemsPerPage = 10;

  // Convert frontend property types to backend enum values
  const getBackendPropertyType = (frontendType: string) => {
    switch (frontendType) {
      case 'villaHouse': return 'VILLA_HOUSE';
      case 'flatApartment': return 'FLAT_APARTMENT';
      case 'pgHostel': return 'PG_HOSTEL';
      default: return null;
    }
  };

  const loadProperties = async (page: number = 1, area: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate skip based on pagination
      const skip = (page - 1) * itemsPerPage;
      
      // Build query parameters
      let queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: itemsPerPage.toString(),
      });
      
      // Add location-based filtering if user has selected a distance
      if (selectedDistance !== null && userLocation) {
        queryParams.append('latitude', userLocation.lat.toString());
        queryParams.append('longitude', userLocation.lng.toString());
        queryParams.append('radius_km', selectedDistance.toString());
      }
      
      // Add property type filter to backend query
      if (propertyType) {
        const backendPropertyType = getBackendPropertyType(propertyType);
        if (backendPropertyType) {
          queryParams.append('property_type', backendPropertyType);
        }
      }
      
      // Call properties API
      const url = buildApiUrl(API_ENDPOINTS.PROPERTIES.LIST, queryParams);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: SearchResponse = await response.json();
      
      // Filter by area if provided (client-side filtering since backend doesn't support it yet)
      let filteredProperties = data.properties;
      if (area) {
        filteredProperties = data.properties.filter(property => 
          property.area?.toLowerCase().includes(area.toLowerCase()) ||
          property.address.toLowerCase().includes(area.toLowerCase())
        );
      }
      
      // Property type filtering is now handled by the backend API
      setProperties(filteredProperties);
      setTotalCount(data.total); // We're still showing the total from the API
      
    } catch (err: any) {
      console.error("Failed to load properties:", err);
      setError(err.message || "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter localities based on input
  useEffect(() => {
    if (searchArea.trim() === '') {
      // Show popular localities or recent searches when empty
      setFilteredLocalities(AllBengaluruLocalities.slice(0, 10));
    } else {
      const filtered = AllBengaluruLocalities.filter(
        locality => locality.toLowerCase().includes(searchArea.toLowerCase())
      );
      setFilteredLocalities(filtered.slice(0, 15)); // Limit to avoid overwhelming dropdown
    }
  }, [searchArea]);

  // Load properties when the component mounts or when URL params change
  useEffect(() => {
    loadProperties(1, initialArea);
  }, [initialArea, initialPropertyType]);
  
  // No longer need dropdown handling in the parent component
  
  // Get user location for distance filtering
  useEffect(() => {
    if (navigator.geolocation && selectedDistance !== null) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your current location. Please enable location access or try again.");
          setSelectedDistance(null);
        }
      );
    }
  }, [selectedDistance]);
  
  // Update results when property type changes
  useEffect(() => {
    if (propertyType) {
      loadProperties(1, searchArea);
    }
  }, [propertyType]);

  // Handle search submission - now handled by SearchInput component
  const handleSearch = (area: string, selectedPropertyType: string) => {
    setCurrentPage(1); // Reset to first page when searching
    setShowDropdown(false); // Close dropdown
    setPropertyType(selectedPropertyType);
    
    // Load properties with both area and property type filters
    loadProperties(1, area);
  };
  
  // Handle locality selection from dropdown
  const handleSelectLocality = (locality: string) => {
    setSearchArea(locality);
    setShowDropdown(false);
    loadProperties(1, locality);
  };
  
  // Handle distance filter selection
  const handleDistanceFilter = (distance: number | null) => {
    setSelectedDistance(distance);
    setCurrentPage(1);
    
    if (distance === null) {
      // Reset location-based filtering
      setUserLocation(null);
      loadProperties(1, searchArea);
      return;
    }
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Cannot filter by distance.");
      setSelectedDistance(null);
      return;
    }
  };

  // Removed formatDate and renderStars functions as they're now in PropertyCard component

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Properties in Bengaluru
        </h1>
        <p className="text-gray-600">
          Find honest reviews for rental properties across Bengaluru. Filter by area to find your next home.
        </p>
      </div>

      {/* Search Form at the top */}
      <div className="mb-6">
        <SearchInput 
          initialArea={searchArea}
          initialPropertyType={propertyType}
          onSearch={(area, selectedPropertyType) => {
            setSearchArea(area);
            setPropertyType(selectedPropertyType);
            loadProperties(1, area);
          }}
        />
        
        {selectedDistance && (
          <div className="mt-3 bg-blue-50 text-blue-800 text-sm p-2 rounded">
            Showing properties within {selectedDistance}km of your current location
          </div>
        )}
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with Filters on the left */}
        <div className="md:w-64 shrink-0">
          <div className="sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

            <div className="space-y-6">
              {/* Property Type Filter */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Property Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="propertyTypeFilter" 
                      value="villaHouse" 
                      checked={propertyType === 'villaHouse'}
                      onChange={() => setPropertyType('villaHouse')}
                      className="form-radio text-blue-500 h-4 w-4 cursor-pointer" 
                    />
                    <span className="ml-2 text-sm text-gray-800">Villa/House</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="propertyTypeFilter" 
                      value="flatApartment" 
                      checked={propertyType === 'flatApartment'}
                      onChange={() => setPropertyType('flatApartment')}
                      className="form-radio text-blue-500 h-4 w-4 cursor-pointer" 
                    />
                    <span className="ml-2 text-sm text-gray-800">Flat/Apartment</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="propertyTypeFilter" 
                      value="pgHostel" 
                      checked={propertyType === 'pgHostel'}
                      onChange={() => setPropertyType('pgHostel')}
                      className="form-radio text-blue-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-800">PG/Hostel</span>
                  </label>
                </div>
              </div>
              
              {/* Localities Filter */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Localities</h3>
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {BengaluruLocalities.map((group) => (
                    <div key={group.name} className="space-y-1">
                      <h4 className="font-medium text-xs text-gray-600">{group.name}</h4>
                      <ul className="pl-2 space-y-1">
                        {group.localities.map((locality) => (
                          <li key={locality}>
                            <button
                              onClick={() => handleSelectLocality(locality)}
                              className={`text-sm w-full text-left py-1 px-2 hover:bg-gray-100 rounded ${
                                searchArea === locality ? 'font-medium text-blue-600' : 'text-gray-800'
                              }`}
                            >
                              {locality}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Distance Filter */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Distance</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Show properties within:
                </p>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((distance) => (
                    <button
                      key={distance}
                      onClick={() => handleDistanceFilter(distance)}
                      className={`block w-full text-left py-1 px-2 text-sm rounded ${
                        selectedDistance === distance
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {distance} km from current location
                    </button>
                  ))}
                  <button
                    onClick={() => handleDistanceFilter(null)}
                    className="block w-full text-left py-1 px-2 text-sm text-blue-600 hover:underline"
                  >
                    Clear distance filter
                  </button>
                </div>
                {selectedDistance && (
                  <div className="mt-2 text-xs text-gray-500">
                    {userLocation ? 'Using your current location' : 'Getting your location...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content - Property Listings */}
        <div className="flex-1">
          {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading properties</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => loadProperties()} 
              className="btn-primary inline-flex items-center"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              {searchArea 
                ? `No properties found in "${searchArea}". Try a different area or broaden your search.` 
                : "No properties found. Please try a different search."}
            </p>
            <button
              onClick={() => loadProperties(1, '')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Clear search and try again
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Found <span className="font-semibold">{totalCount}</span> properties {searchArea && `matching "${searchArea}"`}
              </p>
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
                <select 
                  id="sort" 
                  className="text-sm border rounded px-2 py-1 bg-white"
                  onChange={(e) => console.log(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="rating">Highest Rating</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((property) => (
                <PropertyCard 
                  key={property.id}
                  property={property}
                  propertyType={propertyType}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      loadProperties(currentPage - 1, searchArea);
                    }
                  }}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium">
                  Page {currentPage} of {Math.max(1, Math.ceil(totalCount / itemsPerPage))}
                </div>
                <button
                  onClick={() => {
                    const totalPages = Math.ceil(totalCount / itemsPerPage);
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      loadProperties(currentPage + 1, searchArea);
                    }
                  }}
                  disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                  className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
