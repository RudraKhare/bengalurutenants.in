'use client';

import { useRouter } from 'next/navigation';
import SearchInput from './SearchInput';

interface PropertySearchProps {
  initialValue?: string;
  initialPropertyType?: string;
}

export default function PropertySearch({ 
  initialValue = '', 
  initialPropertyType = '' 
}: PropertySearchProps) {
  const router = useRouter();

  // When a search is performed from homepage, we navigate to the search results page
  const handleSearch = (searchTerm: string, propertyType: string) => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('area', searchTerm);
    if (propertyType) params.append('propertyType', propertyType);
    
    router.push(`/property/search${params.toString() ? '?' + params.toString() : ''}`);
  };
  
  return (
    <div className="mt-8 max-w-4xl mx-auto relative z-10">
      <div className="shadow-2xl rounded-xl overflow-visible relative">
        <SearchInput 
          initialArea={initialValue}
          initialPropertyType={initialPropertyType}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
}
