import { Metadata } from 'next';
import PropertyDetailPage from './PropertyDetailPage';

// Server-side data fetching for SEO and performance
import { API_BASE_URL, API_ENDPOINTS, buildApiUrl } from '@/lib/api';

async function getProperty(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROPERTIES.DETAIL(id)}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch property:', error);
    return null;
  }
}

async function getPropertyReviews(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/reviews?property_id=${id}`, {
      cache: 'no-store', // Don't cache reviews - always fetch fresh data to show verified status
    });
    
    if (!response.ok) {
      return { reviews: [], total: 0 };
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return { reviews: [], total: 0 };
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const property = await getProperty(params.id);
  
  if (!property) {
    return {
      title: 'Property Not Found - OpenReviews.in',
      description: 'The requested property could not be found.',
    };
  }
  
  return {
    title: `${property.address} - ₹${property.rent_amount}/month | OpenReviews.in`,
    description: `${property.property_type} for rent in ${property.city}. ${property.description || 'View details and reviews from verified tenants.'}`,
    openGraph: {
      title: `${property.address} - Property for Rent`,
      description: `₹${property.rent_amount}/month - ${property.property_type} in ${property.city}`,
      type: 'website',
    },
  };
}

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  // Fetch data in parallel for better performance
  const [property, reviewsData] = await Promise.all([
    getProperty(params.id),
    getPropertyReviews(params.id),
  ]);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Back to Properties
          </a>
        </div>
      </div>
    );
  }

  return (
    <PropertyDetailPage 
      property={property} 
      initialReviews={reviewsData.reviews || []}
      totalReviews={reviewsData.total || 0}
    />
  );
}
