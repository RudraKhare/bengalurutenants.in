'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardStats {
  total_users: number
  verified_users: number
  total_properties: number
  total_reviews: number
  verified_reviews: number
  pending_verifications: number
  recent_activity: any[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchDashboardData(token)
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard data:', data) // Debug log
        
        // Transform backend response to match frontend interface
        const transformedStats = {
          total_users: data.stats?.total_users || 0,
          verified_users: data.stats?.verified_users || 0,
          total_properties: data.stats?.total_properties || 0,
          total_reviews: data.stats?.total_reviews || 0,
          verified_reviews: data.stats?.verified_reviews || 0,
          pending_verifications: data.stats?.pending_verifications || 0,
          recent_activity: [
            ...(data.recent_activity?.users || []).map((u: any) => ({
              type: 'user',
              description: `New user: ${u.email}`,
              timestamp: u.created_at
            })),
            ...(data.recent_activity?.reviews || []).map((r: any) => ({
              type: 'review',
              description: `New review (${r.rating}⭐) for property #${r.property_id}`,
              timestamp: r.created_at
            })),
            ...(data.recent_activity?.properties || []).map((p: any) => ({
              type: 'property',
              description: `New property: ${p.address}, ${p.city}`,
              timestamp: p.created_at
            })),
            ...(data.recent_activity?.admin_logs || []).map((log: any) => ({
              type: 'verification',
              description: `Admin action: ${log.action}`,
              timestamp: log.created_at
            }))
          ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
        }
        
        setStats(transformedStats)
        setAdminEmail(data.admin_email || 'Admin')
      } else {
        // Token expired or invalid
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {adminEmail}</p>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.total_users || 0}
            subtitle={`${stats?.verified_users || 0} verified`}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Properties"
            value={stats?.total_properties || 0}
            subtitle="Listed properties"
            icon="🏠"
            color="green"
          />
          <StatCard
            title="Reviews"
            value={stats?.total_reviews || 0}
            subtitle={`${stats?.verified_reviews || 0} verified`}
            icon="⭐"
            color="yellow"
          />
          <StatCard
            title="Pending Verifications"
            value={stats?.pending_verifications || 0}
            subtitle="Requires action"
            icon="⏳"
            color="red"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton
              href="/admin/users"
              label="Manage Users"
              icon="👥"
              description="View and verify users"
            />
            <ActionButton
              href="/admin/reviews"
              label="Verify Reviews"
              icon="✅"
              description="Review pending submissions"
            />
            <ActionButton
              href="/admin/properties"
              label="Manage Properties"
              icon="🏠"
              description="View all listings"
            />
            <ActionButton
              href="/admin/logs"
              label="Activity Logs"
              icon="📊"
              description="Audit trail"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {stats?.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activity.map((activity: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'red'
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`text-4xl ${colorClasses[color]} rounded-full w-16 h-16 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  href: string
  label: string
  icon: string
  description: string
}

function ActionButton({ href, label, icon, description }: ActionButtonProps) {
  return (
    <Link
      href={href}
      className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{label}</h3>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </Link>
  )
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    user: '👤',
    review: '⭐',
    property: '🏠',
    verification: '✅',
    default: '📝',
  }
  return icons[type] || icons.default
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) {
    return `${diffMins} minutes ago`
  }

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return `${diffHours} hours ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
}
