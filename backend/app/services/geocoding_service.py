"""
Geocoding service for address-to-coordinates conversion and reverse geocoding.
Uses Google Maps Geocoding API with caching to minimize API calls.
"""

import os
import math
from typing import Optional, Dict, Tuple
import httpx
from sqlalchemy.orm import Session

from ..models import GeocodingCache

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "AIzaSyDFJf8xF1HeZO68GWFGmIUyPRSeNhCGJ2s")
GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json"
DIRECTIONS_API_URL = "https://maps.googleapis.com/maps/api/directions/json"


class GeocodingService:
    """Service for geocoding operations with caching and error handling."""
    
    @staticmethod
    async def geocode_address(address: str, db: Session) -> Optional[Dict]:
        """
        Convert address to coordinates using Google Geocoding API.
        Checks cache first to minimize API calls.
        
        Args:
            address: Full address string (e.g., "123 Main St, Bangalore, Karnataka")
            db: Database session for cache operations
            
        Returns:
            Dict with lat, lng, formatted_address, and from_cache flag
            None if geocoding fails
            
        Example:
            {
                "latitude": 12.9716,
                "longitude": 77.5946,
                "formatted_address": "Bengaluru, Karnataka, India",
                "from_cache": False
            }
        """
        # Normalize address for cache lookup
        normalized_address = address.lower().strip()
        
        # Check cache first
        cached = db.query(GeocodingCache).filter(
            GeocodingCache.address == normalized_address
        ).first()
        
        if cached:
            print(f"✅ Geocoding cache hit for: {address}")
            return {
                "latitude": cached.latitude,
                "longitude": cached.longitude,
                "formatted_address": cached.formatted_address,
                "from_cache": True
            }
        
        # Cache miss - call Google Geocoding API
        print(f"🔍 Geocoding API call for: {address}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    GEOCODING_API_URL,
                    params={
                        "address": address,
                        "key": GOOGLE_MAPS_API_KEY
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
            
            if data.get("status") == "OK" and data.get("results"):
                result = data["results"][0]
                location = result["geometry"]["location"]
                formatted_address = result.get("formatted_address", address)
                
                latitude = location["lat"]
                longitude = location["lng"]
                
                # Cache the result
                cache_entry = GeocodingCache(
                    address=normalized_address,
                    latitude=latitude,
                    longitude=longitude,
                    formatted_address=formatted_address
                )
                db.add(cache_entry)
                db.commit()
                
                print(f"✅ Geocoding success: {latitude}, {longitude}")
                
                return {
                    "latitude": latitude,
                    "longitude": longitude,
                    "formatted_address": formatted_address,
                    "from_cache": False
                }
            else:
                print(f"❌ Geocoding failed: {data.get('status')}")
                return None
                
        except Exception as e:
            print(f"❌ Geocoding error: {str(e)}")
            return None
    
    @staticmethod
    async def reverse_geocode(latitude: float, longitude: float) -> Optional[Dict]:
        """
        Convert coordinates to address using Google Reverse Geocoding API.
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            
        Returns:
            Dict with formatted_address and address_components
            None if reverse geocoding fails
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    GEOCODING_API_URL,
                    params={
                        "latlng": f"{latitude},{longitude}",
                        "key": GOOGLE_MAPS_API_KEY
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
            
            if data.get("status") == "OK" and data.get("results"):
                result = data["results"][0]
                return {
                    "formatted_address": result.get("formatted_address"),
                    "address_components": result.get("address_components", [])
                }
            else:
                print(f"❌ Reverse geocoding failed: {data.get('status')}")
                return None
                
        except Exception as e:
            print(f"❌ Reverse geocoding error: {str(e)}")
            return None
    
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two coordinates using Haversine formula.
        
        Args:
            lat1, lon1: First coordinate
            lat2, lon2: Second coordinate
            
        Returns:
            Distance in kilometers
            
        Formula:
            a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
            c = 2 * atan2(√a, √(1−a))
            d = R * c
            where R = 6371 km (Earth's radius)
        """
        R = 6371  # Earth's radius in kilometers
        
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        # Haversine formula
        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon / 2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c
        
        return distance
    
    @staticmethod
    async def get_directions(
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        mode: str = "driving"
    ) -> Optional[Dict]:
        """
        Get directions from origin to destination using Google Directions API.
        Only call this when explicitly requested to save API costs.
        
        Args:
            origin_lat, origin_lng: Origin coordinates
            dest_lat, dest_lng: Destination coordinates
            mode: Travel mode (driving, walking, transit, bicycling)
            
        Returns:
            Dict with route information including distance, duration, and polyline
            None if directions request fails
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    DIRECTIONS_API_URL,
                    params={
                        "origin": f"{origin_lat},{origin_lng}",
                        "destination": f"{dest_lat},{dest_lng}",
                        "mode": mode,
                        "key": GOOGLE_MAPS_API_KEY
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
            
            if data.get("status") == "OK" and data.get("routes"):
                route = data["routes"][0]
                leg = route["legs"][0]
                
                return {
                    "distance": leg["distance"]["text"],
                    "distance_value": leg["distance"]["value"],  # in meters
                    "duration": leg["duration"]["text"],
                    "duration_value": leg["duration"]["value"],  # in seconds
                    "start_address": leg["start_address"],
                    "end_address": leg["end_address"],
                    "polyline": route["overview_polyline"]["points"]
                }
            else:
                print(f"❌ Directions failed: {data.get('status')}")
                return None
                
        except Exception as e:
            print(f"❌ Directions error: {str(e)}")
            return None

