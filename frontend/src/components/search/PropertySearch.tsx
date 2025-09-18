'use client';

import { useRouter } from 'next/navigation';
import SearchInput from './SearchInput';

interface PropertySearchProps {
  initialValue?: string;
  initialPropertyType?: string;
}

export default function PropertySearch({ 
  initialValue = '', 
  initialPropertyType = 'villaHouse' 
}: PropertySearchProps) {
  const router = useRouter();

  // When a search is performed from homepage, we navigate to the search results page
  const handleSearch = (searchTerm: string, propertyType: string) => {
    router.push(`/property/search?area=${encodeURIComponent(searchTerm)}&propertyType=${propertyType}`);
  };
  
  return (
    <div className="mt-8 max-w-3xl mx-auto relative z-10">
      <div className="shadow-lg rounded-lg overflow-hidden relative">
        <SearchInput 
          initialArea={initialValue}
          initialPropertyType={initialPropertyType}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
}
