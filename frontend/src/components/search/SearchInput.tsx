'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import { AllBengaluruLocalities } from '@/lib/localities';

interface SearchInputProps {
  initialArea?: string;
  initialPropertyType?: string;
  onSearch: (area: string, propertyType: string) => void;
}

export default function SearchInput({ initialArea = '', initialPropertyType = 'villaHouse', onSearch }: SearchInputProps) {
  const [searchArea, setSearchArea] = useState(initialArea);
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLocalities, setFilteredLocalities] = useState<string[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
  
  // Handle clicks outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    onSearch(searchArea, propertyType);
  };
  
  // Handle locality selection from dropdown
  const handleSelectLocality = (locality: string) => {
    setSearchArea(locality);
    setShowDropdown(false);
    onSearch(locality, propertyType);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 relative">
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative" style={{ position: 'relative' }}>
            <label htmlFor="search-area" className="block text-sm font-medium text-gray-700 mb-1">
              Area or Address
            </label>
            <input
              ref={inputRef}
              id="search-area"
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Indiranagar, Koramangala, etc."
              autoComplete="off"
            />
            
            {/* Localities Dropdown */}
            {showDropdown && filteredLocalities.length > 0 && !searchArea && (
              <div 
                ref={dropdownRef}
                className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                style={{ top: '100%', position: 'absolute' }}
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
            
            {/* Custom Property Suggestions Dropdown */}
            {searchArea && searchArea.length > 1 && (
              <div 
                className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                style={{ top: '100%', position: 'absolute' }}
              >
                {[
                  "Brigade Meadows, Kaggalipura",
                  "Prestige Lakeside Habitat, Whitefield",
                  "Sobha Dream Acres, Panathur",
                  "Godrej Woodsman Estate, Hebbal",
                  "Adarsh Palm Retreat, Bellandur",
                  "Embassy Springs, Devanahalli",
                  "Purva Highland, Kanakapura Road",
                  "Salarpuria Sattva Serenity, HSR Layout",
                  "SNN Raj Serenity, Begur"
                ]
                  .filter(property => property.toLowerCase().includes(searchArea.toLowerCase()))
                  .map((property) => (
                    <button
                      key={property}
                      type="button"
                      onClick={() => {
                        setSearchArea(property);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      {property}
                    </button>
                  ))
                }
              </div>
            )}
          </div>
          <div className="sm:self-end">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
            >
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </div>
            </button>
          </div>
        </div>

        {/* Property Type Filter */}
        <div className="pt-2 flex flex-wrap items-center gap-6">
          <div className="font-medium text-gray-700 text-sm">Property Type:</div>
          {/* Villa/House Option */}
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="propertyType" 
              value="villaHouse" 
              checked={propertyType === 'villaHouse'}
              onChange={() => setPropertyType('villaHouse')}
              className="form-radio text-teal-500 h-5 w-5 cursor-pointer focus:ring-teal-500"
            />
            <span className="ml-2 text-gray-800">Villa/House</span>
          </label>
          
          {/* Flat/Apartments Option */}
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="propertyType" 
              value="flatApartment" 
              checked={propertyType === 'flatApartment'}
              onChange={() => setPropertyType('flatApartment')}
              className="form-radio text-gray-400 h-5 w-5 cursor-pointer focus:ring-blue-500" 
            />
            <span className="ml-2 text-gray-800">Flat/Apartment</span>
          </label>
          
          {/* PG/Hostel Option */}
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="propertyType" 
              value="pgHostel" 
              checked={propertyType === 'pgHostel'}
              onChange={() => setPropertyType('pgHostel')}
              className="form-radio text-gray-400 h-5 w-5 cursor-pointer focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-800">PG/Hostel</span>
          </label>
        </div>
      </form>
    </div>
  );
}
