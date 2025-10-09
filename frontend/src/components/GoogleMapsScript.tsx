'use client';

import Script from 'next/script';
import { GOOGLE_MAPS_CONFIG } from '@/lib/googleMaps';

export function GoogleMapsScript() {
  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=${GOOGLE_MAPS_CONFIG.libraries.join(',')}&v=${GOOGLE_MAPS_CONFIG.version}`}
      strategy="beforeInteractive"
      onLoad={() => console.log('Google Maps script loaded')}
      onError={(e) => console.error('Error loading Google Maps script:', e)}
    />
  );
}
