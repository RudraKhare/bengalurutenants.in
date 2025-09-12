import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bengaluru Tenants - Property Reviews & Ratings',
  description: 'Find honest tenant reviews and ratings for rental properties in Bengaluru. Share your experience and help others make informed decisions.',
  keywords: 'bengaluru, bangalore, rental, property, reviews, tenants, landlord, apartments, pg, house',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation header - TODO: Create proper navigation component */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <a href="/" className="flex-shrink-0">
                    <h1 className="text-xl font-bold text-primary-600">
                      Bengaluru Tenants
                    </h1>
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="/review/add" className="btn-primary">
                    Add Review
                  </a>
                  {/* TODO: Add user authentication links */}
                  <a href="/login" className="text-gray-600 hover:text-gray-800">
                    Login
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="text-center text-gray-600">
                <p>&copy; 2025 Bengaluru Tenants. Helping renters make informed decisions.</p>
                {/* TODO: Add footer links, privacy policy, terms of service */}
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
