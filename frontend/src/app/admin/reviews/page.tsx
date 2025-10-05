'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Review {
  id: number
  user_id: number
  property_id: number
  rating: number
  comment: string
  is_verified: boolean
  verification_notes: string | null
  created_at: string
}

export default function AdminReviews() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [showPending, setShowPending] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchReviews(token)
  }, [router, showPending])

  const fetchReviews = async (token: string) => {
    setLoading(true)
    try {
      const url = showPending
        ? 'http://localhost:8000/api/admin/reviews/pending'
        : 'http://localhost:8000/api/v1/reviews/?skip=0&limit=50'
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(showPending ? data.reviews || [] : data.reviews || [])
      } else {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!selectedReview) return
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      // Prepare the request body - only include notes if provided
      const body = verificationNotes.trim() 
        ? { notes: verificationNotes.trim() } 
        : {}

      const response = await fetch(`http://localhost:8000/api/admin/reviews/${selectedReview.id}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        alert('Review verified successfully!')
        setShowVerifyModal(false)
        setSelectedReview(null)
        setVerificationNotes('')
        fetchReviews(token)
      } else {
        const errorData = await response.json()
        alert(`Failed to verify review: ${errorData.detail || response.statusText}`)
        console.error('Verify error:', errorData)
      }
    } catch (err) {
      console.error('Error verifying review:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedReview) return
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:8000/api/admin/reviews/${selectedReview.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        alert('Review deleted successfully!')
        setShowDeleteModal(false)
        setSelectedReview(null)
        fetchReviews(token)
      } else {
        const errorData = await response.json()
        alert(`Failed to delete review: ${errorData.detail || response.statusText}`)
        console.error('Delete error:', errorData)
      }
    } catch (err) {
      console.error('Error deleting review:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating)
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Review Verification</h1>
              <p className="text-sm text-gray-600 mt-1">{reviews.length} {showPending ? 'pending' : 'total'} reviews</p>
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
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPending(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showPending
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending Reviews
            </button>
            <button
              onClick={() => setShowPending(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showPending
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Reviews
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500">No {showPending ? 'pending' : ''} reviews found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getRatingStars(review.rating)}</span>
                      <span className="text-lg font-semibold text-gray-900">{review.rating}/5</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Review #{review.id} • Property #{review.property_id} • User #{review.user_id}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(review.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {review.is_verified ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                </div>

                {review.verification_notes && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Verification Note:</strong> {review.verification_notes}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  {!review.is_verified && (
                    <button
                      onClick={() => {
                        setSelectedReview(review)
                        setShowVerifyModal(true)
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      ✓ Verify Review
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedReview(review)
                      setShowDeleteModal(true)
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    🗑️ Delete (Spam)
                  </button>
                  <Link
                    href={`/property/${review.property_id}`}
                    target="_blank"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    View Property
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verify Modal */}
      {showVerifyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Verify Review</h3>
            <p className="text-gray-600 mb-4">
              Review #{selectedReview.id} - {getRatingStars(selectedReview.rating)}
            </p>
            <textarea
              placeholder="Add verification notes (optional)"
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={3}
            />
            <div className="flex space-x-4">
              <button
                onClick={handleVerify}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Verify
              </button>
              <button
                onClick={() => {
                  setShowVerifyModal(false)
                  setSelectedReview(null)
                  setVerificationNotes('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Review</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="p-3 bg-gray-50 rounded-lg mb-6">
              <p className="text-sm text-gray-700">{selectedReview.comment}</p>
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
                  setSelectedReview(null)
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
