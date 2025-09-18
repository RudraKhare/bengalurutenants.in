'use client';

/**
 * Client-side component to initialize the mock API interceptor
 */

import { useEffect } from 'react';
import { setupMockInterceptor } from '@/lib/mockPhotoKeys';

export default function MockPhotoKeyInitializer() {
  useEffect(() => {
    // Only run in browser, not during SSR
    if (typeof window !== 'undefined') {
      setupMockInterceptor();
    }
  }, []);
  
  return null;
}
