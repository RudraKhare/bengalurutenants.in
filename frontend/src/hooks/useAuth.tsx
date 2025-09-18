/**
 * Authentication Context for Bengaluru Tenants App
 * 
 * Handles JWT token management and API authentication state.
 * Integrates with the Day 2 magic link authentication system.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { buildApiUrl, API_ENDPOINTS, API_HEADERS } from '@/lib/api';

interface User {
  id: number;
  email: string;
  phone?: string;
  role: string;
  is_email_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  requestMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyMagicToken: (magicToken: string) => Promise<{ success: boolean; token?: string; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data when token is available
  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch(buildApiUrl('/api/v1/auth/me'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token might be invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Don't logout on network errors, just log the error
    } finally {
      setIsLoading(false);
    }
  };

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserData(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);
    fetchUserData(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const requestMagicLink = async (email: string) => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.MAGIC_LINK), {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Magic link sent to your email!' };
      } else {
        return { success: false, message: data.detail || 'Failed to send magic link' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const verifyMagicToken = async (magicToken: string) => {
    try {
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.AUTH.VERIFY}?token=${magicToken}`));
      
      const data = await response.json();

      if (response.ok) {
        const accessToken = data.access_token;
        login(accessToken);
        return { success: true, token: accessToken, message: 'Successfully authenticated!' };
      } else {
        return { success: false, message: data.detail || 'Invalid or expired token' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    requestMagicLink,
    verifyMagicToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
