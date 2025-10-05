'use client';

import { useState, useEffect, useRef } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import { AllBengaluruLocalities, BengaluruLocalities, AllCityLocalities } from '@/lib/localities';
import { useSearchParams } from 'next/navigation';
import SearchInput from '@/components/search/SearchInput';
import PropertyCard from '@/components/PropertyCard';
import PropertyMap from '@/components/PropertyMap';
import IndianMonumentsCarousel from '@/components/IndianMonumentsCarousel';

interface Property {
  id: number;
  address: string;
  city: string;
  area?: string;
  property_type?: string;
  lat?: number;
  lng?: number;
  photo_keys?: string;
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
  const initialPropertyType = searchParams.get('propertyType') || '';
  const initialCity = searchParams.get('city') || Object.keys(AllCityLocalities)[0];

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
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  
  // Dynamic localities from API
  const [cityLocalities, setCityLocalities] = useState<string[]>([]);
  const [isLoadingLocalities, setIsLoadingLocalities] = useState(false);
  
  // Mobile map overlay state
  const [showMobileMap, setShowMobileMap] = useState(false);
  
  const itemsPerPage = 10;

  const getBackendPropertyType = (frontendType: string) => {
    switch (frontendType) {
      case 'villaHouse': return 'VILLA_HOUSE';
      case 'flatApartment': return 'FLAT_APARTMENT';
      case 'pgHostel': return 'PG_HOSTEL';
      default: return null;
    }
  };

  const loadProperties = async (page: number = 1, area: string = '', city: string = selectedCity) => {
    setLoading(true);
    setError(null);
    
    try {
      const skip = (page - 1) * itemsPerPage;
      
      let queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (selectedDistance !== null && userLocation) {
        queryParams.append('latitude', userLocation.lat.toString());
        queryParams.append('longitude', userLocation.lng.toString());
        queryParams.append('radius_km', selectedDistance.toString());
        console.log(`🔍 Searching properties within ${selectedDistance}km of location:`, userLocation);
      }
      
      if (propertyType) {
        const backendPropertyType = getBackendPropertyType(propertyType);
        if (backendPropertyType) {
          queryParams.append('property_type', backendPropertyType);
        }
      }
      
      if (city) {
        queryParams.append('city', city);
      }
      
      const url = buildApiUrl(API_ENDPOINTS.PROPERTIES.LIST, queryParams);
      console.log('🌐 Fetching properties from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: SearchResponse = await response.json();
      console.log(`📦 Received ${data.properties.length} properties (total: ${data.total})`);
      
      let filteredProperties = data.properties;
      if (area) {
        filteredProperties = data.properties.filter(property => 
          property.area?.toLowerCase().includes(area.toLowerCase()) ||
          property.address.toLowerCase().includes(area.toLowerCase())
        );
      }
      
      // Filter by city client-side as fallback
      if (city) {
        filteredProperties = filteredProperties.filter(property => property.city === city);
      }
      
      setProperties(filteredProperties);
      setTotalCount(data.total);
      
    } catch (err: any) {
      console.error("Failed to load properties:", err);
      setError(err.message || "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchArea.trim() === '') {
      setFilteredLocalities(AllBengaluruLocalities.slice(0, 10));
    } else {
      const filtered = AllBengaluruLocalities.filter(
        locality => locality.toLowerCase().includes(searchArea.toLowerCase())
      );
      setFilteredLocalities(filtered.slice(0, 15));
    }
  }, [searchArea]);

  // Fetch localities when city changes
  useEffect(() => {
    async function fetchCityLocalities() {
      if (!selectedCity) return;
      
      setIsLoadingLocalities(true);
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.CITIES.LOCALITIES(selectedCity)));
        if (response.ok) {
          const localities = await response.json();
          const localityNames = localities.map((locality: any) => locality.name);
          // Sort alphabetically for easier navigation
          const sortedLocalities = localityNames.sort((a: string, b: string) => 
            a.localeCompare(b, undefined, { sensitivity: 'base' })
          );
          setCityLocalities(sortedLocalities);
        } else {
          console.error('Failed to fetch localities');
          setCityLocalities([]);
        }
      } catch (error) {
        console.error('Error fetching localities:', error);
        setCityLocalities([]);
      } finally {
        setIsLoadingLocalities(false);
      }
    }
    
    fetchCityLocalities();
  }, [selectedCity]);

  useEffect(() => {
    loadProperties(1, initialArea);
  }, [initialArea, initialPropertyType]);
  
  useEffect(() => {
    if (navigator.geolocation && selectedDistance !== null) {
      console.log(`📍 Getting user location for ${selectedDistance}km search...`);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('✅ Location obtained:', location);
          setUserLocation(location);
        },
        (error) => {
          console.error("❌ Error getting location:", error);
          alert("Could not get your current location. Please enable location access or try again.");
          setSelectedDistance(null);
        }
      );
    }
  }, [selectedDistance]);
  
  useEffect(() => {
    if (propertyType !== undefined) {
      loadProperties(1, searchArea);
    }
  }, [propertyType]);

  useEffect(() => {
    if (userLocation && selectedDistance !== null) {
      loadProperties(1, searchArea);
    }
  }, [userLocation, selectedDistance]);

  // City Dropdown - Custom Styled
  const allCities = Object.keys(AllCityLocalities);
  const filteredCities = citySearch.trim() === '' ? allCities : allCities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()));

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

  const handleSearch = (area: string, selectedPropertyType: string, city: string = selectedCity) => {
    setCurrentPage(1);
    setShowDropdown(false);
    setPropertyType(selectedPropertyType);
    setSelectedCity(city);
    loadProperties(1, area, city);
  };
  
  const handleSelectLocality = (locality: string) => {
    setSearchArea(locality);
    setShowDropdown(false);
    loadProperties(1, locality);
  };
  
  const handleDistanceFilter = (distance: number | null) => {
    setSelectedDistance(distance);
    setCurrentPage(1);
    
    if (distance === null) {
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

  // Handle nearby search from SearchInput component
  const handleNearbySearch = (radius: number) => {
    setCurrentPage(1);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please enable location access.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setSelectedDistance(radius);
        // Load properties will be triggered by the useEffect for selectedDistance
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your current location. Please enable location access in your browser settings.");
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Page header with extended search and Indian Monuments background carousel */}
      <div className="relative overflow-visible shadow-sm border-b border-gray-200 -mt-16 pt-16 sm:pt-20 md:pt-24 py-4 sm:py-5 md:py-6 md:mb-6">
        {/* Background Carousel - Replaces gradient */}
        <IndianMonumentsCarousel showOverlay={true} overlayOpacity={0.5} />
        
        <div className="relative z-10 max-w-full mx-auto px-3 sm:px-4 md:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 md:mb-4 drop-shadow-lg">
            Search Properties in - {selectedCity}
          </h1>
          <p className="text-sm sm:text-base text-white/95 mb-4 sm:mb-5 md:mb-6 drop-shadow-md">
            Find honest reviews for rental properties across {selectedCity}. Filter by area to find your next home.
          </p>
          
          {/* Extended Search Form */}
          <div className="relative z-20">
            <SearchInput 
              initialArea={searchArea}
              initialPropertyType={propertyType}
              initialCity={selectedCity}
              onSearch={handleSearch}
              onNearbySearch={handleNearbySearch}
            />
          </div>
          
          {selectedDistance && (
            <div className="mt-2 sm:mt-3 bg-blue-50 text-blue-800 text-xs sm:text-sm p-2 sm:p-2.5 md:p-3 rounded flex items-center justify-between mb-6">
              <span>Showing properties within {selectedDistance}km of your current location</span>
              <button
                onClick={() => {
                  setSelectedDistance(null);
                  setUserLocation(null);
                  loadProperties(1, searchArea);
                }}
                className="ml-2 sm:ml-3 md:ml-4 text-blue-600 hover:text-blue-800 font-medium underline hover:no-underline transition-colors text-xs sm:text-sm"
                title="Clear location filter"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout Container - White card with rounded top on mobile, normal layout on desktop */}
      
      {/* MOBILE LAYOUT: White card sliding over gradient */}
      <div className="md:hidden w-full bg-white rounded-t-3xl shadow-lg relative z-20 -mt-6 pt-6 px-3 sm:px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-10">
            <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-7 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Error loading properties</h3>
            <p className="text-sm sm:text-base text-red-600 mb-3 sm:mb-4">{error}</p>
            <button 
              onClick={() => loadProperties()} 
              className="btn-primary inline-flex items-center text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-7 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              {searchArea 
                ? `No properties found in "${searchArea}". Try a different area or broaden your search.` 
                : "No properties found. Please try a different search."}
            </p>
            <button
              onClick={() => loadProperties(1, '')}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Clear search and try again
            </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4 bg-white p-2.5 sm:p-3 rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600">
                Found <span className="font-semibold">{totalCount}</span> properties {searchArea && `matching "${searchArea}"`}
              </p>
              <div className="flex items-center space-x-2">
                <label htmlFor="sort-mobile" className="text-xs sm:text-sm text-gray-600">Sort:</label>
                <select 
                  id="sort-mobile" 
                  className="text-xs sm:text-sm border rounded px-2 py-1 bg-white"
                  onChange={(e) => console.log(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="rating">Highest Rating</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </div>
            </div>

            {/* Property List - Single column on mobile */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {properties.map((property) => (
                <div 
                  key={property.id}
                  onClick={() => setSelectedPropertyId(property.id)}
                  className={`cursor-pointer transition-all ${
                    selectedPropertyId === property.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                >
                  <PropertyCard 
                    property={property}
                    propertyType={propertyType}
                  />
                </div>
              ))}
            </div>

            {/* Pagination - Mobile */}
            <div className="mt-4 sm:mt-5 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      loadProperties(currentPage - 1, searchArea);
                    }
                  }}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-0.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="sm:hidden">Prev</span>
                </button>
                <div className="relative inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border-t border-b border-gray-300 bg-white text-xs sm:text-sm font-medium">
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
                  className="relative inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sm:hidden">Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5 sm:ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP LAYOUT: Three column layout */}
      <div className="hidden md:flex md:flex-row gap-3 sm:gap-4 px-3 sm:px-4">
        {/* LEFT: Filters Section - Desktop only */}
        <div className="md:w-1/5 md:shrink-0">
          <div className="md:sticky md:top-20">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 px-2">Filters</h2>

            <div className="space-y-3 sm:space-y-4">
              {/* Property Type Filter */}
              <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">Property Type</h3>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="propertyTypeFilter" 
                      value="" 
                      checked={propertyType === ''}
                      onChange={() => setPropertyType('')}
                      className="form-radio text-blue-500 h-3.5 w-3.5 sm:h-4 sm:w-4 cursor-pointer" 
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-800">All Properties</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="propertyTypeFilter" 
                      value="villaHouse" 
                      checked={propertyType === 'villaHouse'}
                      onChange={() => setPropertyType('villaHouse')}
                      className="form-radio text-blue-500 h-3.5 w-3.5 sm:h-4 sm:w-4 cursor-pointer" 
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-800">Villa/House</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="propertyTypeFilter" 
                      value="flatApartment" 
                      checked={propertyType === 'flatApartment'}
                      onChange={() => setPropertyType('flatApartment')}
                      className="form-radio text-blue-500 h-3.5 w-3.5 sm:h-4 sm:w-4 cursor-pointer" 
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-800">Flat/Apartment</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="propertyTypeFilter" 
                      value="pgHostel" 
                      checked={propertyType === 'pgHostel'}
                      onChange={() => setPropertyType('pgHostel')}
                      className="form-radio text-blue-500 h-3.5 w-3.5 sm:h-4 sm:w-4 cursor-pointer"
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-800">PG/Hostel</span>
                  </label>
                </div>
              </div>
              
              {/* Localities Filter */}
              <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">Localities</h3>
                {isLoadingLocalities ? (
                  <div className="flex items-center justify-center py-3 sm:py-4">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-xs sm:text-sm text-gray-600">Loading localities...</span>
                  </div>
                ) : cityLocalities.length > 0 ? (
                  <div className="max-h-60 sm:max-h-80 overflow-y-auto space-y-0.5 sm:space-y-1">
                    {cityLocalities.map((locality) => (
                      <button
                        key={locality}
                        onClick={() => handleSelectLocality(locality)}
                        className={`text-xs sm:text-sm w-full text-left py-1.5 sm:py-2 px-2 sm:px-3 hover:bg-blue-50 rounded transition-colors ${
                          searchArea === locality ? 'font-medium text-blue-600 bg-blue-50' : 'text-gray-800'
                        }`}
                      >
                        {locality}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 py-3 sm:py-4">No localities available for {selectedCity}</p>
                )}
              </div>
              
              {/* Distance Filter */}
              <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">Distance</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Show properties within:
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  {[1, 2, 3, 4, 5].map((distance) => (
                    <button
                      key={distance}
                      onClick={() => handleDistanceFilter(distance)}
                      className={`block w-full text-left py-1 sm:py-1.5 px-2 text-xs sm:text-sm rounded ${
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
                    className="block w-full text-left py-1 sm:py-1.5 px-2 text-xs sm:text-sm text-blue-600 hover:underline"
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
        
        {/* CENTER: Property Listings - 50% on desktop, full width on mobile */}
        <div className="w-full md:w-1/2">
          {loading ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12">
            <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-7 md:p-8 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Error loading properties</h3>
            <p className="text-sm sm:text-base text-red-600 mb-3 sm:mb-4">{error}</p>
            <button 
              onClick={() => loadProperties()} 
              className="btn-primary inline-flex items-center text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-7 md:p-8 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              {searchArea 
                ? `No properties found in "${searchArea}". Try a different area or broaden your search.` 
                : "No properties found. Please try a different search."}
            </p>
            <button
              onClick={() => loadProperties(1, '')}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Clear search and try again
            </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4 bg-white p-2.5 sm:p-3 rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600">
                Found <span className="font-semibold">{totalCount}</span> properties {searchArea && `matching "${searchArea}"`}
              </p>
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-xs sm:text-sm text-gray-600">Sort:</label>
                <select 
                  id="sort" 
                  className="text-xs sm:text-sm border rounded px-2 py-1 bg-white"
                  onChange={(e) => console.log(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="rating">Highest Rating</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </div>
            </div>

            {/* Property List - 2 columns on desktop, 1 column on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {properties.map((property) => (
                <div 
                  key={property.id}
                  onClick={() => setSelectedPropertyId(property.id)}
                  className={`cursor-pointer transition-all ${
                    selectedPropertyId === property.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                >
                  <PropertyCard 
                    property={property}
                    propertyType={propertyType}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 sm:mt-5 md:mt-6 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      loadProperties(currentPage - 1, searchArea);
                    }
                  }}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-0.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                <div className="relative inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border-t border-b border-gray-300 bg-white text-xs sm:text-sm font-medium">
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
                  className="relative inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5 sm:ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        )}
        </div>

        {/* RIGHT: Map Section - 30% on desktop, hidden on mobile */}
        <div className="hidden md:block md:w-[30%] md:shrink-0">
          <div className="sticky top-20">
            <PropertyMap
              properties={properties.filter(p => p.lat && p.lng) as any}
              height="calc(100vh - 120px)"
              selectedPropertyId={selectedPropertyId || undefined}
              onPropertyClick={setSelectedPropertyId}
              centerLat={userLocation?.lat}
              centerLng={userLocation?.lng}
            />
          </div>
        </div>
      </div>

      {/* Floating Map Button - Mobile Only */}
      {properties.filter(p => p.lat && p.lng).length > 0 && (
        <button
          onClick={() => setShowMobileMap(true)}
          className="md:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group active:scale-95"
          aria-label="Open Map View"
        >
          <svg 
            className="w-7 h-7 transition-transform group-hover:scale-110" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          
          {/* Ripple effect */}
          <span className="absolute inset-0 rounded-full bg-red-400 opacity-0 group-hover:opacity-20 animate-ping"></span>
        </button>
      )}

      {/* Mobile Map Overlay */}
      {showMobileMap && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white animate-fadeIn">
          {/* Map Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <h2 className="text-lg font-semibold">
                Properties Near You
              </h2>
            </div>
            <button
              onClick={() => setShowMobileMap(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors active:scale-95"
              aria-label="Close Map"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Map Info Bar */}
          <div className="px-4 py-2 bg-red-50 border-b border-red-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-red-600">{properties.filter(p => p.lat && p.lng).length}</span> properties with location data
            </p>
          </div>

          {/* Map Container - Explicit sizing for proper map initialization */}
          <div 
            className="relative bg-gray-100" 
            style={{ 
              height: 'calc(100vh - 152px)',
              minHeight: '400px',
              width: '100%'
            }}
          >
            <PropertyMap
              key={showMobileMap ? 'mobile-map-open' : 'mobile-map-closed'}
              properties={properties.filter(p => p.lat && p.lng) as any}
              height="100%"
              selectedPropertyId={selectedPropertyId || undefined}
              onPropertyClick={(id) => {
                setSelectedPropertyId(id);
              }}
              centerLat={userLocation?.lat}
              centerLng={userLocation?.lng}
              zoom={userLocation ? 13 : 12}
            />
          </div>

          {/* Close Button at Bottom (Alternative) */}
          <div className="px-4 py-3 bg-white border-t border-gray-200 shadow-lg">
            <button
              onClick={() => setShowMobileMap(false)}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-md active:scale-95 transition-all"
            >
              Back to List View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
