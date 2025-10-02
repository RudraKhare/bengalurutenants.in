import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from 'react-hot-toast'
import { Navigation } from '@/components'

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
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDFJf8xF1HeZO68GWFGmIUyPRSeNhCGJ2s'}&libraries=places,geometry,marker&v=weekly`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
          <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
          
          {/* Navigation with transparent background for glass effect */}
          <Navigation />

          {/* Main content - Added pt-16 to account for fixed header */}
          <main className="flex-1 pt-16">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-12">
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
