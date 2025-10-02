'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import { AllBengaluruLocalities, AllCityLocalities } from '@/lib/localities';
import { getFuzzyLocalitySuggestions } from '@/lib/fuzzyLocality';

const AllIndianCities = Object.keys(AllCityLocalities);

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
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const radiusDropdownRef = useRef<HTMLDivElement>(null);

  // Filter localities based on input and selected city
  useEffect(() => {
    const cityLocalities = AllCityLocalities[selectedCity] || [];
    if (searchArea.trim() === '') {
      setFilteredLocalities(cityLocalities.slice(0, 20)); // Show more when empty
    } else {
      setFilteredLocalities(getFuzzyLocalitySuggestions(cityLocalities, searchArea));
    }
  }, [searchArea, selectedCity]);
  
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

  const filteredCities = citySearch.trim() === '' ? AllIndianCities : AllIndianCities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()));

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 mb-8 w-full max-w-6xl mx-auto overflow-visible relative z-20">
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* City Dropdown - Custom Styled with Search */}
          <div className="flex-shrink-0 relative z-40">
            <button
              type="button"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="bg-white text-left text-gray-900 font-medium px-8 py-4 rounded-lg transition-colors flex items-center justify-between shadow-md border border-gray-200 w-full"
            >
              <span className="truncate">{selectedCity}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCityDropdown && (
              <div className="absolute left-0 top-full w-full z-[99999] bg-white border-2 border-gray-300 rounded-lg shadow-2xl">
                <div className="p-3 city-dropdown">
                  <input
                    type="text"
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    placeholder="Search city..."
                    className="w-full px-3 py-2 mb-3 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="max-h-60 overflow-auto">
                    {filteredCities.map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => { setSelectedCity(city); setShowCityDropdown(false); setCitySearch(''); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 rounded cursor-pointer transition-colors mb-1"
                      >
                        {city}
                      </button>
                    ))}
                    {filteredCities.length === 0 && (
                      <div className="text-gray-500 text-sm px-3 py-2">No cities found</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 relative z-30">
            <input
              ref={inputRef}
              id="search-area"
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-6 py-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Search property or area"
              autoComplete="off"
            />
            
            {/* Localities Dropdown - Fixed z-index and positioning */}
            {showDropdown && filteredLocalities.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-[99999] mt-1 w-full bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-auto"
                style={{ top: '100%', left: 0 }}
              >
                {filteredLocalities.map((locality) => (
                  <button
                    key={locality}
                    type="button"
                    onClick={() => handleSelectLocality(locality)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    {locality}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="sm:self-center flex gap-3 relative z-30">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-8 py-4 rounded-lg transition-colors flex items-center justify-center shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-8 py-4 rounded-lg transition-colors flex items-center justify-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Explore All
              </button>
            )}

            {/* Nearby Button with Radius Options - Only show if onNearbySearch is provided */}
            {onNearbySearch && (
              <div className="relative z-40">
                <button
                  type="button"
                  onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium px-8 py-4 rounded-lg transition-colors flex items-center justify-center shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Nearby
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

              {/* Radius Dropdown */}
              {showRadiusDropdown && (
                <div
                  ref={radiusDropdownRef}
                  className="absolute z-[99999] mt-2 w-72 bg-white border-2 border-gray-300 rounded-lg shadow-2xl"
                  style={{ top: '100%', right: '0' }}
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
        <div className="pt-2">
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600">Suggested searches:</span>
            <div className="flex flex-wrap items-center gap-4">
              {/* Villa/House Option */}
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="propertyType" 
                  value="villaHouse" 
                  checked={propertyType === 'villaHouse'}
                  onChange={() => setPropertyType('villaHouse')}
                  className="form-radio text-blue-600 h-4 w-4 cursor-pointer focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-800 text-sm">Villa/House</span>
              </label>
              
              {/* Flat/Apartments Option */}
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="propertyType" 
                  value="flatApartment" 
                  checked={propertyType === 'flatApartment'}
                  onChange={() => setPropertyType('flatApartment')}
                  className="form-radio text-blue-600 h-4 w-4 cursor-pointer focus:ring-blue-500" 
                />
                <span className="ml-2 text-gray-800 text-sm">Flat/Apartment</span>
              </label>
              
              {/* PG/Hostel Option */}
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="propertyType" 
                  value="pgHostel" 
                  checked={propertyType === 'pgHostel'}
                  onChange={() => setPropertyType('pgHostel')}
                  className="form-radio text-blue-600 h-4 w-4 cursor-pointer focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-800 text-sm">PG/Hostel</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
