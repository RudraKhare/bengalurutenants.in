'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Convert email to username for display
const getUsername = (email: string) => {
  const username = email.split('@')[0];
  return username.toLowerCase().replace(/[._]/g, '-');
};

export default function MobileNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDrawer(false);
    router.push('/');
  };

  return (
    <>
      {/* Mobile Header - Glassmorphism with Gradient - Only visible on screens < 768px */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-lg shadow-sm border-b border-white/20 h-12">
        <div className="flex items-center justify-between px-4 py-3 h-full">
          {/* Logo - Left Side */}
          <Link href="/" className="text-gray-900 font-bold text-lg">
            OpenReviews.in
          </Link>
          
          {/* Hamburger Menu - Right Side */}
          <button
            onClick={() => setShowDrawer(true)}
            className="text-gray-900 p-2 hover:bg-white/30 rounded-lg transition-colors"
            aria-label="Open Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      
      {/* Tagline section moved to MobileHomeView component for scrolling with content */}

      {/* Side Drawer Overlay */}
      {showDrawer && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDrawer(false)}
          />
          
          {/* Drawer - Slides in from right */}
          <div className="md:hidden fixed top-0 right-0 bottom-0 z-[70] w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200">
                <h2 className="text-base font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="Close Menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Welcome Section */}
              {isAuthenticated && user && (
                <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-base">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Welcome</p>
                      <p className="text-sm font-bold text-gray-900">{getUsername(user.email)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto py-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDrawer(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                    <Link
                      href="/review/add"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDrawer(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm font-medium">Add Review</span>
                    </Link>
                    <Link
                      href="/reviews"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDrawer(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-sm font-medium">Explore Reviews</span>
                    </Link>
                    <Link
                      href="/property/search"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDrawer(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm font-medium">Search Properties</span>
                    </Link>
                    
                    {/* Divider */}
                    <div className="my-2 border-t border-gray-200"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDrawer(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-medium">Home</span>
                    </Link>
                    <Link
                      href="/review/add"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDrawer(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm font-medium">Add Review</span>
                    </Link>
                    <Link
                      href="/reviews"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDrawer(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-sm font-medium">Explore Reviews</span>
                    </Link>
                    <Link
                      href="/property/search"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDrawer(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm font-medium">Search Properties</span>
                    </Link>
                    
                    {/* Divider */}
                    <div className="my-2 border-t border-gray-200"></div>
                    
                    <Link
                      href="/auth"
                      className="flex items-center gap-2 px-4 py-2.5 text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => setShowDrawer(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium">Login</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation - Only visible on screens < 768px */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="relative flex justify-around items-center h-16">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-full h-full ${
              pathname === '/' ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>

          {/* Nearby */}
          <button
            onClick={() => {
              if (navigator.geolocation) {
                const confirmed = window.confirm('Find properties near your current location?');
                if (!confirmed) return;

                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    // Default 5km radius for nearby search
                    router.push(`/property/search?lat=${position.coords.latitude}&lng=${position.coords.longitude}&radius=5`);
                  },
                  (error) => {
                    let errorMessage = 'Unable to get your location. ';
                    switch(error.code) {
                      case error.PERMISSION_DENIED:
                        errorMessage += 'Please enable location permissions.';
                        break;
                      case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location unavailable.';
                        break;
                      case error.TIMEOUT:
                        errorMessage += 'Request timed out.';
                        break;
                      default:
                        errorMessage += 'An error occurred.';
                    }
                    alert(errorMessage);
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                  }
                );
              } else {
                alert('Geolocation is not supported by your browser.');
              }
            }}
            className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              <circle cx="12" cy="9" r="2" fill="white"/>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 1.74.5 3.37 1.41 4.84.27.43.61.84 1 1.21C8.96 16.48 11.14 18.44 12 19.88c.86-1.44 3.04-3.4 4.59-4.83.39-.37.73-.78 1-1.21C18.5 12.37 19 10.74 19 9c0-3.87-3.13-7-7-7z" opacity="0.3"/>
            </svg>
            <span className="text-xs mt-1">Nearby</span>
          </button>

          {/* Center FAB - Add Review Button */}
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            <Link
              href="/review/add"
              className="absolute -top-7 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              aria-label="Add Review"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </Link>
            <span className="text-xs mt-1 text-gray-600">Add</span>
          </div>

          {/* Reviews */}
          <Link
            href="/reviews"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              pathname === '/reviews' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="text-xs mt-1">Reviews</span>
          </Link>

          {/* Profile */}
          <Link
            href={isAuthenticated ? "/dashboard" : "/auth"}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              pathname === '/dashboard' || pathname === '/auth' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
