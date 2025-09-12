interface PropertyPageProps {
  params: {
    id: string
  }
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = params

  // TODO: Fetch property data from API
  // const property = await fetchProperty(id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <a href="/" className="hover:text-primary-600">Home</a>
          </li>
          <li>/</li>
          <li>
            <a href="/properties" className="hover:text-primary-600">Properties</a>
          </li>
          <li>/</li>
          <li className="text-gray-900">Property {id}</li>
        </ol>
      </nav>

      {/* Property Header */}
      <div className="card mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sample Property in Koramangala
            </h1>
            <p className="text-gray-600 mb-4">
              123 Main Street, Koramangala 5th Block, Bengaluru - 560095
            </p>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-lg font-medium text-gray-900">4.5</span>
              <span className="text-gray-500 ml-2">(12 reviews)</span>
            </div>

            {/* Property Details Placeholder */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-1 font-medium">2BHK Apartment</span>
              </div>
              <div>
                <span className="text-gray-500">Rent:</span>
                <span className="ml-1 font-medium">₹25,000 - ₹30,000</span>
              </div>
              <div>
                <span className="text-gray-500">Area:</span>
                <span className="ml-1 font-medium">Koramangala</span>
              </div>
              <div>
                <span className="text-gray-500">Verified:</span>
                <span className="ml-1 font-medium text-green-600">✓ Yes</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
            <a href={`/review/add?property=${id}`} className="btn-primary">
              Write Review
            </a>
            <button className="btn-secondary">
              Save Property
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reviews List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            <select className="input-field w-auto">
              <option>Most Recent</option>
              <option>Highest Rated</option>
              <option>Lowest Rated</option>
              <option>Most Helpful</option>
            </select>
          </div>

          {/* Individual Reviews - Placeholder */}
          {[1, 2, 3].map((review) => (
            <div key={review} className="card mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium text-gray-900">Anonymous Tenant</div>
                    <div className="text-sm text-gray-500">Verified • 3 days ago</div>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                Great place to live! The landlord is very responsive and the building is well-maintained. 
                Close to metro station and good restaurants. Would definitely recommend.
              </p>
              
              {/* Review Categories */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Cleanliness:</span>
                  <span className="ml-1 font-medium">4.5/5</span>
                </div>
                <div>
                  <span className="text-gray-500">Landlord:</span>
                  <span className="ml-1 font-medium">5.0/5</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-1 font-medium">4.0/5</span>
                </div>
                <div>
                  <span className="text-gray-500">Value:</span>
                  <span className="ml-1 font-medium">4.0/5</span>
                </div>
              </div>

              {/* Review Actions */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <button className="hover:text-primary-600">👍 Helpful (5)</button>
                <button className="hover:text-primary-600">👎 Not helpful (0)</button>
                <button className="hover:text-primary-600">Reply</button>
              </div>
            </div>
          ))}

          {/* Load More */}
          <div className="text-center">
            <button className="btn-secondary">
              Load More Reviews
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rating Breakdown */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center mb-2">
                <span className="text-sm text-gray-600 w-6">{stars}★</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${stars * 20}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{stars * 2}</span>
              </div>
            ))}
          </div>

          {/* Verification Status */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verified Reviews</span>
                <span className="text-sm font-medium text-green-600">8/12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rental Agreements</span>
                <span className="text-sm font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Utility Bills</span>
                <span className="text-sm font-medium">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">UPI Transactions</span>
                <span className="text-sm font-medium">1</span>
              </div>
            </div>
          </div>

          {/* Location Map Placeholder */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Map will be loaded here</span>
            </div>
            {/* TODO: Integrate React-Leaflet map */}
          </div>
        </div>
      </div>
    </div>
  )
}
