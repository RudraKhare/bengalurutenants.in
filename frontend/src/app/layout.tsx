import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from 'react-hot-toast'
import { Navigation, MobileNavigation } from '@/components'
import { GoogleMapsScript } from '@/components/GoogleMapsScript'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OpenReviews.in - Property Reviews & Ratings',
  description: 'Find honest tenant reviews and ratings for rental properties across India. Share your experience and help others make informed decisions.',
  keywords: 'openreviews, rental, property, reviews, tenants, landlord, apartments, pg, house',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <GoogleMapsScript />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="w-full min-h-screen bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 overflow-x-hidden">
          <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* Mobile Navigation - Visible only on mobile */}
          <MobileNavigation />

          {/* Main content - Different padding for mobile and desktop */}
          <main className="w-full flex-1 pt-16 md:pt-16 overflow-x-hidden bg-white/80 md:bg-white">
            {children}
          </main>

          {/* Footer - Hidden on mobile to avoid conflicting with bottom nav */}
          <footer className="hidden md:block bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="text-center text-gray-600">
                <p>&copy; 2025 OpenReviews.in. Helping renters make informed decisions.</p>
                {/* TODO: Add footer links, privacy policy, terms of service */}
              </div>
            </div>
          </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
