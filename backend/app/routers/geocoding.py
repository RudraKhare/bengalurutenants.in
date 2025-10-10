"""
Geocoding and map-related routes for address geocoding and directions.
Provides utilities for property location management and user navigation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Property
from ..schemas import (
    GeocodeRequest, GeocodeResponse,
    ReverseGeocodeRequest, ReverseGeocodeResponse,
    PropertyLocationUpdate, DirectionsRequest, DirectionsResponse
)
from ..services.geocoding_service import GeocodingService
from ..dependencies import get_current_user_optional

router = APIRouter(prefix="/v1/geocoding", tags=["geocoding"])


@router.post("/geocode", response_model=GeocodeResponse)
async def geocode_address(
    request: GeocodeRequest,
    db: Session = Depends(get_db)
) -> GeocodeResponse:
    """
    Convert an address to geographic coordinates.
    
    Uses Google Maps Geocoding API with caching to minimize API calls.
    Useful when adding properties with address but no coordinates.
    
    Args:
        request: Address to geocode
        db: Database session for cache operations
        
    Returns:
        Coordinates and formatted address
        
    Raises:
        HTTPException 400: If geocoding fails (invalid address or API error)
        
    Example:
        POST /api/v1/geocoding/geocode
        {
            "address": "Koramangala, Bengaluru"
        }
        
        Response:
        {
            "latitude": 12.9352,
            "longitude": 77.6245,
            "formatted_address": "Koramangala, Bengaluru, Karnataka, India",
            "from_cache": false
        }
    """
    result = await GeocodingService.geocode_address(request.address, db)
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to geocode address. Please check the address and try again."
        )
    
    return GeocodeResponse(**result)


@router.post("/reverse-geocode", response_model=ReverseGeocodeResponse)
async def reverse_geocode(
    request: ReverseGeocodeRequest
) -> ReverseGeocodeResponse:
    """
    Convert coordinates to an address.
    
    Useful when users drop a pin on the map and you want to show them the address.
    
    Args:
        request: Coordinates to reverse geocode
        
    Returns:
        Formatted address for the coordinates
        
    Raises:
        HTTPException 400: If reverse geocoding fails
        
    Example:
        POST /api/v1/geocoding/reverse-geocode
        {
            "latitude": 12.9716,
            "longitude": 77.5946
        }
        
        Response:
        {
            "formatted_address": "Bengaluru, Karnataka 560001, India"
        }
    """
    result = await GeocodingService.reverse_geocode(
        request.latitude,
        request.longitude
    )
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to reverse geocode coordinates."
        )
    
    return ReverseGeocodeResponse(formatted_address=result["formatted_address"])


@router.put("/properties/{property_id}/location", response_model=dict)
async def update_property_location(
    property_id: int,
    location: PropertyLocationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Update property coordinates (from manual pin-drop or geocoding confirmation).
    
    Allows users to:
    1. Confirm geocoded location
    2. Manually adjust pin position on map
    3. Set initial coordinates for properties without them
    
    Args:
        property_id: Property to update
        location: New coordinates and confirmation status
        db: Database session
        current_user: Optional authenticated user
        
    Returns:
        Success message with updated coordinates
        
    Raises:
        HTTPException 404: If property not found
        
    Example:
        PUT /api/v1/geocoding/properties/123/location
        {
            "latitude": 12.9716,
            "longitude": 77.5946,
            "confirmed": true
        }
    """
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if property_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found"
        )
    
    # Update coordinates
    property_obj.lat = location.latitude
    property_obj.lng = location.longitude
    
    db.commit()
    db.refresh(property_obj)
    
    return {
        "message": "Property location updated successfully",
        "property_id": property_id,
        "latitude": property_obj.lat,
        "longitude": property_obj.lng,
        "confirmed": location.confirmed
    }


@router.post("/directions", response_model=DirectionsResponse)
async def get_directions(
    request: DirectionsRequest,
    db: Session = Depends(get_db)
) -> DirectionsResponse:
    """
    Get directions from user's location to a property.
    
    Uses Google Directions API - only call when explicitly requested to save API costs.
    
    Args:
        request: Origin coordinates and destination property ID
        db: Database session
        
    Returns:
        Route information with distance, duration, and polyline
        
    Raises:
        HTTPException 404: If property not found
        HTTPException 400: If property has no coordinates or directions fail
        
    Example:
        POST /api/v1/geocoding/directions
        {
            "origin_lat": 12.9716,
            "origin_lng": 77.5946,
            "destination_property_id": 123,
            "mode": "driving"
        }
    """
    # Get destination property
    property_obj = db.query(Property).filter(
        Property.id == request.destination_property_id
    ).first()
    
    if property_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {request.destination_property_id} not found"
        )
    
    if property_obj.lat is None or property_obj.lng is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Property does not have coordinates set"
        )
    
    # Get directions
    result = await GeocodingService.get_directions(
        request.origin_lat,
        request.origin_lng,
        property_obj.lat,
        property_obj.lng,
        request.mode
    )
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to get directions. Please try again."
        )
    
    return DirectionsResponse(
        distance=result["distance"],
        duration=result["duration"],
        polyline=result["polyline"]
    )
