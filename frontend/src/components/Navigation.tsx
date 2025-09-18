'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navigation() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                bengalurutenants.in
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
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Welcome, <span className="font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Logout
                  </button>
                </div>
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
