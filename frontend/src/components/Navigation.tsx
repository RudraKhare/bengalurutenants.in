'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

// Convert email to kebab-case username
const getUsername = (email: string) => {
  const username = email.split('@')[0];
  return username.toLowerCase().replace(/[._]/g, '-');
};

export default function Navigation() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-lg shadow-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                OpenReviews.in
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoading ? (
              // Show loading state
              <div className="text-gray-500">Loading...</div>
            ) : isAuthenticated && user ? (
              // Authenticated user navigation
              <>
                <Link href="/review/add" className="btn-primary">
                  Add Review
                </Link>
                <Link href="/dashboard" className="btn-secondary">
                  Dashboard
                </Link>
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">{getUsername(user.email)}</span>
                </div>
                <button
                  onClick={logout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              // Guest user navigation
              <>
                <Link href="/review/add" className="btn-primary">
                  Add Review
                </Link>
                <Link href="/auth" className="text-gray-600 hover:text-gray-800">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
