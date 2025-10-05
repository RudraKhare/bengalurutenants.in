'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import { getFuzzyLocalitySuggestions } from '@/lib/fuzzyLocality';

interface SearchInputProps {
  initialArea?: string;
  initialPropertyType?: string;
  initialCity?: string;
  onSearch: (area: string, propertyType: string, city: string) => void;
  onNearbySearch?: (radius: number) => void;
}

export default function SearchInput({ initialArea = '', initialPropertyType = '', initialCity = 'Bengaluru', onSearch, onNearbySearch }: SearchInputProps) {
  const [searchArea, setSearchArea] = useState(initialArea);
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLocalities, setFilteredLocalities] = useState<string[]>([]);
  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false);
  const [customRadius, setCustomRadius] = useState('');
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  
  // Data fetched from API
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allLocalities, setAllLocalities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingLocalities, setIsLoadingLocalities] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const radiusDropdownRef = useRef<HTMLDivElement>(null);

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

  // Fetch localities when selected city changes
  useEffect(() => {
    async function fetchLocalities() {
      if (!selectedCity) return;
      
      setIsLoadingLocalities(true);
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.CITIES.LOCALITIES(selectedCity)));
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
  }, [selectedCity]);

  // Filter localities based on input using fuzzy search
  useEffect(() => {
    if (searchArea.trim() === '') {
      setFilteredLocalities(allLocalities.slice(0, 20)); // Show more when empty
    } else {
      setFilteredLocalities(getFuzzyLocalitySuggestions(allLocalities, searchArea));
    }
  }, [searchArea, allLocalities]);
  
  // Handle clicks outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (radiusDropdownRef.current && !radiusDropdownRef.current.contains(event.target as Node)) {
        setShowRadiusDropdown(false);
      }
      if (showCityDropdown && event.target instanceof HTMLElement && !event.target.closest('.city-dropdown')) {
        setShowCityDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCityDropdown]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    onSearch(searchArea, propertyType, selectedCity);
  };
  
  // Handle locality selection from dropdown
  const handleSelectLocality = (locality: string) => {
    setSearchArea(locality);
    setShowDropdown(false);
    onSearch(locality, propertyType, selectedCity);
  };

  // Handle nearby search with radius selection
  const handleNearbyClick = (radius: number) => {
    setShowRadiusDropdown(false);
    setCustomRadius('');
    if (onNearbySearch) {
      onNearbySearch(radius);
    }
  };

  // Handle custom radius input
  const handleCustomRadiusSubmit = () => {
    const radius = parseFloat(customRadius);
    if (!isNaN(radius) && radius > 0 && radius <= 50) {
      setShowRadiusDropdown(false);
      setCustomRadius('');
      if (onNearbySearch) {
        onNearbySearch(radius);
      }
    } else {
      alert('Please enter a valid radius between 0.1 and 50 km');
    }
  };

  const filteredCities = citySearch.trim() === '' ? allCities : allCities.filter((city: string) => city.toLowerCase().includes(citySearch.toLowerCase()));

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 sm:p-4 md:p-6 mb-6 sm:mb-7 md:mb-8 w-full max-w-6xl mx-auto relative">
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:gap-4 relative">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative">
          {/* City Dropdown - Custom Styled with Search - FIXED FOR MOBILE */}
          <div className="relative w-full sm:w-auto sm:flex-shrink-0" style={{ zIndex: 100 }}>
            <button
              type="button"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="bg-white text-left text-gray-900 font-medium px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg transition-all hover:shadow-lg flex items-center justify-between shadow-md border-2 border-gray-300 hover:border-red-400 w-full sm:w-auto min-w-[160px] sm:min-w-[180px] text-sm sm:text-base relative"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate font-semibold">{selectedCity}</span>
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-5 sm:w-5 ml-2 text-gray-500 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCityDropdown && (
              <div className="absolute left-0 top-full w-full sm:min-w-[280px] bg-white border-2 border-gray-300 rounded-lg shadow-2xl mt-2" style={{ zIndex: 10000 }}>
                <div className="p-2 sm:p-3 city-dropdown">
                  <input
                    type="text"
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    placeholder="Search city..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 mb-2 sm:mb-3 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <div className="max-h-48 sm:max-h-60 overflow-auto">
                    {isLoadingCities ? (
                      <div className="text-gray-500 text-xs sm:text-sm px-2 sm:px-3 py-2">Loading cities...</div>
                    ) : filteredCities.length === 0 ? (
                      <div className="text-gray-500 text-xs sm:text-sm px-2 sm:px-3 py-2">No cities found</div>
                    ) : (
                      filteredCities.map((city: string) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => { setSelectedCity(city); setShowCityDropdown(false); setCitySearch(''); }}
                          className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 hover:bg-red-50 rounded cursor-pointer transition-colors mb-0.5 sm:mb-1 font-medium"
                        >
                          {city}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 relative" style={{ zIndex: 90 }}>
            <input
              ref={inputRef}
              id="search-area"
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base relative"
              placeholder="Search property or area"
              autoComplete="off"
            />
            
            {/* Localities Dropdown - Fixed z-index and positioning */}
            {showDropdown && filteredLocalities.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute mt-1 w-full bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-auto"
                style={{ top: '100%', left: 0, zIndex: 9999 }}
              >
                {isLoadingLocalities ? (
                  <div className="px-4 py-2 text-sm text-gray-500">Loading localities...</div>
                ) : (
                  filteredLocalities.map((locality) => (
                    <button
                      key={locality}
                      type="button"
                      onClick={() => handleSelectLocality(locality)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      {locality}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="sm:self-center flex flex-col sm:flex-row gap-2 sm:gap-3 relative w-full sm:w-auto" style={{ zIndex: 80 }}>
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors flex items-center justify-center shadow-md text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>

            {/* Explore All Button - Only show if onNearbySearch is NOT provided (homepage only) */}
            {!onNearbySearch && (
              <button
                type="button"
                onClick={() => {
                  // Navigate to property search page with no filters
                  window.location.href = '/property/search';
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors flex items-center justify-center shadow-md text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Explore All
              </button>
            )}

            {/* Nearby Button with Radius Options - Only show if onNearbySearch is provided */}
            {onNearbySearch && (
              <div className="relative w-full sm:w-auto" style={{ zIndex: 70 }}>
                <button
                  type="button"
                  onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors flex items-center justify-center shadow-md text-sm sm:text-base w-full sm:w-auto relative"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Nearby
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 sm:h-4 sm:w-4 ml-2 transition-transform ${showRadiusDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

              {/* Radius Dropdown */}
              {showRadiusDropdown && (
                <div
                  ref={radiusDropdownRef}
                  className="absolute mt-2 w-64 sm:w-72 bg-white border-2 border-gray-300 rounded-lg shadow-2xl right-0 sm:right-auto sm:left-0"
                  style={{ top: '100%', zIndex: 10000 }}
                >
                  <div className="p-3">
                    {/* Custom Input Field */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <label className="text-xs font-semibold text-gray-600 block mb-2">
                        Enter custom distance (km):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={customRadius}
                          onChange={(e) => setCustomRadius(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCustomRadiusSubmit();
                            }
                          }}
                          placeholder="e.g., 2.5"
                          min="0.1"
                          max="50"
                          step="0.1"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleCustomRadiusSubmit}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          Go
                        </button>
                      </div>
                    </div>

                    {/* Preset Options */}
                    <div className="text-xs font-semibold text-gray-600 mb-2">
                      Or choose a preset:
                    </div>
                    {[1, 2, 3, 4, 5, 6, 7].map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => handleNearbyClick(radius)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                      >
                        <span className="font-medium">{radius} km</span> from current location
                      </button>
                    ))}
                  </div>
                </div>
              )}
              </div>
            )}
          </div>
        </div>

        {/* Property Type Filter */}
        <div className="pt-1 sm:pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-6">
            <span className="text-xs sm:text-sm text-gray-600">Suggested searches:</span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Villa/House Option */}
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="propertyType" 
                  value="villaHouse" 
                  checked={propertyType === 'villaHouse'}
                  onChange={() => setPropertyType('villaHouse')}
                  className="form-radio text-blue-600 h-3.5 w-3.5 sm:h-4 sm:w-4 cursor-pointer focus:ring-blue-500"
                />
                <span className="ml-1.5 sm:ml-2 text-gray-800 text-xs sm:text-sm">Villa/House</span>
              </label>
              
              {/* Flat/Apartments Option */}
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="propertyType" 
                  value="flatApartment" 
                  checked={propertyType === 'flatApartment'}
                  onChange={() => setPropertyType('flatApartment')}
                  className="form-radio text-blue-600 h-3.5 w-3.5 sm:h-4 sm:w-4 cursor-pointer focus:ring-blue-500" 
                />
                <span className="ml-1.5 sm:ml-2 text-gray-800 text-xs sm:text-sm">Flat/Apartment</span>
              </label>
              
              {/* PG/Hostel Option */}
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="propertyType" 
                  value="pgHostel" 
                  checked={propertyType === 'pgHostel'}
                  onChange={() => setPropertyType('pgHostel')}
                  className="form-radio text-blue-600 h-3.5 w-3.5 sm:h-4 sm:w-4 cursor-pointer focus:ring-blue-500"
                />
                <span className="ml-1.5 sm:ml-2 text-gray-800 text-xs sm:text-sm">PG/Hostel</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
