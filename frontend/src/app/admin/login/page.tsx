'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { API_ENDPOINTS, buildApiUrl } from '@/lib/api'

export default function AdminLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      router.push('/admin/dashboard')
    }
  }, [router])

  // Verify magic link token from URL
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      verifyMagicLink(token)
    }
  }, [searchParams])

  const verifyMagicLink = async (token: string) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN.VERIFY), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store JWT token
        localStorage.setItem('admin_token', data.access_token)
        setMessage('✅ Login successful! Redirecting...')
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 1000)
      } else {
        setError(data.detail || 'Invalid or expired magic link')
      }
    } catch (err) {
      setError('Failed to verify magic link. Please try again.')
      console.error('Magic link verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const requestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('http://localhost:8000/api/admin/magic-link/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Magic link sent! Check console for development link.')
        console.log('🔗 Magic link:', data.dev_link)
        
        // In production, this would be sent via email
        // For development, we can auto-click the link
        if (data.dev_link) {
          const token = new URL(data.dev_link).searchParams.get('token')
          if (token) {
            setTimeout(() => {
              verifyMagicLink(token)
            }, 1000)
          }
        }
      } else {
        setError(data.detail || 'Failed to send magic link')
      }
    } catch (err) {
      setError('Failed to request magic link. Please try again.')
      console.error('Magic link request error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Sign in to access the admin dashboard</p>
          </div>

          {/* Magic Link Form */}
          <form onSubmit={requestMagicLink} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* Messages */}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Send Magic Link'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🔒 Magic link authentication</p>
            <p className="mt-1">Link expires in 15 minutes</p>
          </div>
        </div>

        {/* Development Info */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-semibold">Development Mode</p>
          <p className="mt-1">Magic link will appear in console. In production, it will be sent via email.</p>
        </div>
      </div>
    </div>
  )
}
