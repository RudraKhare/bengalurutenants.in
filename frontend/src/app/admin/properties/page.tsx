'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Property {
  id: number
  address: string
  city: string
  area: string
  property_type: string
  rent_amount: number
  avg_rating: number
  review_count: number
  created_at: string
}

interface PropertyDetail extends Property {
  pincode: string
  bhk_type: string
  furnishing: string
  area_sqft: number
  available_from: string
  owner_contact: string
  amenities: string
  latitude: number | null
  longitude: number | null
}

export default function AdminProperties() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetail | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalProperties, setTotalProperties] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchProperties(token)
  }, [router, currentPage, searchQuery])

  const fetchProperties = async (token: string) => {
    setLoading(true)
    try {
      const url = `http://localhost:8000/api/admin/properties?skip=${currentPage * 10}&limit=10${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
      }`

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
        setTotalProperties(data.total || 0)
      } else {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPropertyDetails = async (id: number) => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:8000/api/admin/properties/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedProperty(data.property)
        setShowDetailModal(true)
      }
    } catch (err) {
      console.error('Error fetching property details:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedProperty) return
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:8000/api/admin/properties/${selectedProperty.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        alert('Property deleted successfully!')
        setShowDeleteModal(false)
        setSelectedProperty(null)
        fetchProperties(token)
      } else {
        alert('Failed to delete property')
      }
    } catch (err) {
      console.error('Error deleting property:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  const totalPages = Math.ceil(totalProperties / 10)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
              <p className="text-sm text-gray-600 mt-1">{totalProperties} total properties</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <input
            type="text"
            placeholder="Search by address, city, or area..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(0)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Properties Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-gray-500">No properties found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">#{property.id}</div>
                      <div className="text-sm text-gray-500">{property.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{property.city}</div>
                      <div className="text-sm text-gray-500">{property.area}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {property.property_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ₹{property.rent_amount?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="text-sm text-gray-900">
                          {property.avg_rating?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({property.review_count || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => fetchPropertyDetails(property.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProperty(property as PropertyDetail)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{currentPage * 10 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min((currentPage + 1) * 10, totalProperties)}
                    </span>{' '}
                    of <span className="font-medium">{totalProperties}</span> properties
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      {showDetailModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Property Details</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedProperty(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Property ID</p>
                  <p className="font-medium">#{selectedProperty.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{selectedProperty.property_type}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{selectedProperty.address}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{selectedProperty.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Area</p>
                  <p className="font-medium">{selectedProperty.area}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pincode</p>
                  <p className="font-medium">{selectedProperty.pincode}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">BHK Type</p>
                  <p className="font-medium">{selectedProperty.bhk_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Furnishing</p>
                  <p className="font-medium">{selectedProperty.furnishing}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Area (sqft)</p>
                  <p className="font-medium">{selectedProperty.area_sqft}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Rent Amount</p>
                  <p className="font-medium">₹{selectedProperty.rent_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available From</p>
                  <p className="font-medium">{selectedProperty.available_from}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Owner Contact</p>
                <p className="font-medium">{selectedProperty.owner_contact}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Amenities</p>
                <p className="font-medium">{selectedProperty.amenities || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <p className="font-medium">⭐ {selectedProperty.avg_rating?.toFixed(1) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Reviews</p>
                  <p className="font-medium">{selectedProperty.review_count || 0} reviews</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Latitude</p>
                  <p className="font-medium">{selectedProperty.latitude || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Longitude</p>
                  <p className="font-medium">{selectedProperty.longitude || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{new Date(selectedProperty.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex space-x-4 mt-6 pt-6 border-t">
              <Link
                href={`/property/${selectedProperty.id}`}
                target="_blank"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-center"
              >
                View on Site
              </Link>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setShowDeleteModal(true)
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Property</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This will also delete all associated reviews. This action cannot be undone.
            </p>
            <div className="p-3 bg-gray-50 rounded-lg mb-6">
              <p className="text-sm font-medium text-gray-900">{selectedProperty.address}</p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedProperty.city} • {selectedProperty.area} • Property #{selectedProperty.id}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedProperty(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
