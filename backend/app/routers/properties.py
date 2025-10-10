"""
Property management routes for CRUD operations and geographic search.
Provides public listing and search with optional user-specific operations.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from ..db import get_db
from ..models import Property, User, PropertyType
from ..schemas import PropertyCreate, PropertyOut, PropertyListResponse, PhotoUploadData
from ..dependencies import get_current_user, get_current_user_optional
from ..services.r2_client import r2_client
from ..services.geocoding_service import GeocodingService

router = APIRouter(prefix="/api/v1/properties", tags=["properties"])

@router.get("/", response_model=PropertyListResponse)
async def list_properties(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of properties to skip (pagination)"),
    limit: int = Query(20, ge=1, le=100, description="Number of properties to return"),
    property_type: Optional[PropertyType] = Query(None, description="Filter by property type"),
    latitude: Optional[float] = Query(None, description="Center latitude for geographic search"),
    longitude: Optional[float] = Query(None, description="Center longitude for geographic search"),
    radius_km: Optional[float] = Query(None, ge=0.1, le=50, description="Search radius in kilometers"),
    city: Optional[str] = Query("Bengaluru", description="Filter by city name"),
    my_properties: Optional[bool] = Query(False, description="Fetch only current user's properties"),
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> PropertyListResponse:
    """
    List properties with optional geographic filtering and pagination.
    
    Search modes:
    1. No coordinates: Return all properties (paginated)
    2. With coordinates: Return properties within radius using Haversine formula
    
    Filters:
    - property_type: Optional property type filter
    - city: Filter by city name (case-insensitive, defaults to Bengaluru)
    """
    query = db.query(Property)
    
    # If my_properties is True, filter to show only the current user's properties
    if my_properties and current_user:
        query = query.filter(Property.property_owner_id == current_user.id)
    
    # Filter by city (case-insensitive)
    if city:
        query = query.filter(func.lower(Property.city) == func.lower(city))
    
    # Filter by property type
    if property_type:
        query = query.filter(Property.property_type == property_type)
    
    # Apply geographic search if coordinates provided
    if latitude is not None and longitude is not None and radius_km is not None:
        # Calculate distance using Haversine formula
        lat = func.radians(Property.lat)
        lng = func.radians(Property.lng)
        search_lat = func.radians(latitude)
        search_lng = func.radians(longitude)
        
        dlon = search_lng - lng
        dlat = search_lat - lat
        
        a = func.pow(func.sin(dlat/2), 2) + func.cos(lat) * func.cos(search_lat) * func.pow(func.sin(dlon/2), 2)
        distance_km = 6371 * 2 * func.asin(func.sqrt(a))
        
        # Filter by radius
        query = query.filter(distance_km <= radius_km)
        
        # Order by distance (nearest first) when using geographic search
        query = query.order_by(distance_km)
        
        print(f"🔍 Geographic search: center=({latitude}, {longitude}), radius={radius_km}km")
    else:
        # Default ordering by newest first when no geographic search
        query = query.order_by(Property.created_at.desc())
    
    # Get total count for pagination (before applying skip/limit)
    total_count = query.count()
    
    # Apply pagination
    properties = query.offset(skip).limit(limit).all()
    
    return PropertyListResponse(
        properties=properties,
        total=total_count,
        skip=skip,
        limit=limit
    )

@router.get("/{property_id}", response_model=PropertyOut)
async def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> PropertyOut:
    """
    Get single property by ID with full details.
    
    Public endpoint - no authentication required.
    Includes related data through SQLAlchemy relationships.
    
    Args:
        property_id: Unique property identifier
        db: Database session
        current_user: Optional authenticated user (for future features)
        
    Returns:
        Complete property details including owner information
        
    Raises:
        HTTPException 404: If property not found
    """
    
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if property_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found"
        )
    
    return property_obj

@router.post("/", response_model=PropertyOut, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PropertyOut:
    """
    Create new property listing.
    
    Requires authentication - property is automatically associated with current user.
    All fields are validated by Pydantic schema before reaching this function.
    
    Validation includes:
    - Address length (10-500 characters)
    - Coordinate bounds (lat: -90 to 90, lon: -180 to 180)
    - Rent amount (minimum 1)
    - Description and amenities length limits
    
    Args:
        property_data: Validated property creation data
        db: Database session
        current_user: Authenticated user (property owner)
        
    Returns:
        Created property with generated ID and timestamps
    """
    
    try:
        # Debug: Log the received property data
        print(f"🔍 Creating property with data:")
        print(f"   Address: {property_data.address}")
        print(f"   City: {property_data.city}")
        print(f"   Area: {property_data.area}")
        print(f"   Property Type: {property_data.property_type}")
        print(f"   User ID: {current_user.id}")
        
        # Auto-geocode if coordinates not provided
        lat = property_data.lat
        lng = property_data.lng
        
        if lat is None or lng is None:
            print(f"🗺️ No coordinates provided, auto-geocoding address...")
            full_address = f"{property_data.address}, {property_data.city}"
            geocode_result = await GeocodingService.geocode_address(full_address, db)
            
            if geocode_result:
                lat = geocode_result["latitude"]
                lng = geocode_result["longitude"]
                print(f"✅ Auto-geocoded to: {lat}, {lng}")
            else:
                print(f"⚠️ Auto-geocoding failed, property will be created without coordinates")
        
        # Create property instance with all available fields
        property_obj = Property(
            address=property_data.address,
            city=property_data.city,
            area=property_data.area,
            property_type=property_data.property_type,  # Include property type from user selection
            lat=lat,
            lng=lng,
            photo_keys=property_data.photo_keys,  # May be None for new properties
            property_owner_id=current_user.id,    # Set the owner to current user
            avg_rating=0.0,  # Default for new properties
            review_count=0   # Default for new properties
        )
        
        # Add to session and commit
        db.add(property_obj)
        db.commit()
        db.refresh(property_obj)
        
        return property_obj
        
    except Exception as e:
        db.rollback()
        print(f"Property creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create property"
        )

@router.put("/{property_id}", response_model=PropertyOut)
async def update_property(
    property_id: int,
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PropertyOut:
    """
    Update existing property listing.
    
    Authorization: Only property owner can update their listings.
    Complete replacement of all updatable fields.
    
    Args:
        property_id: Property to update
        property_data: New property data (replaces all fields)
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated property with new data
        
    Raises:
        HTTPException 404: If property not found
        HTTPException 403: If user doesn't own the property
    """
    
    # Find property
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if property_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found"
        )
    
    # Authorization check - only owner can update
    if property_obj.property_owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own properties"
        )
    
    try:
        # Update all fields from request data
        update_data = property_data.model_dump()
        for field, value in update_data.items():
            setattr(property_obj, field, value)
        
        db.commit()
        db.refresh(property_obj)
        
        return property_obj
        
    except Exception as e:
        db.rollback()
        print(f"Property update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update property"
        )

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete property listing.
    
    Authorization: Only property owner can delete their listings.
    Cascading deletes: Related reviews are automatically deleted (FK constraint).
    
    Args:
        property_id: Property to delete
        db: Database session
        current_user: Authenticated user
        
    Returns:
        HTTP 204 No Content on success
        
    Raises:
        HTTPException 404: If property not found
        HTTPException 403: If user doesn't own the property
    """
    
    # Find property
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if property_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found"
        )
    
    # Authorization check - only owner can delete
    if property_obj.property_owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own properties"
        )
    
    try:
        # Delete property (cascades to reviews automatically)
        db.delete(property_obj)
        db.commit()
        
        # No content return for successful deletion
        
    except Exception as e:
        db.rollback()
        print(f"Property deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete property"
        )


@router.post("/{property_id}/photos")
async def add_property_photo(
    property_id: int,
    upload_data: PhotoUploadData,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a photo to a property.
    
    This endpoint is called after a photo has been successfully uploaded to R2.
    It updates the property's photo_keys field to include the new photo.
    
    Args:
        property_id: ID of the property to add the photo to
        upload_data: Contains the R2 object key for the uploaded photo
        current_user: Authenticated user (must be property owner or admin)
        
    Returns:
        Success message with the added photo key
        
    Raises:
        HTTPException 404: Property not found
        HTTPException 403: Not authorized to update this property
    """
    
    # Find the property
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Permission check - only property owner or admin can add photos
    if (property_obj.property_owner_id != current_user.id and 
        current_user.role.value != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this property"
        )
    
    try:
        # Update the photo_keys field
        photo_key = upload_data.photo_key
        
        if property_obj.photo_keys:
            # If there are existing photos, append with comma
            # Check if this key already exists to prevent duplicates
            existing_keys = property_obj.photo_keys.split(',')
            if photo_key not in existing_keys:
                property_obj.photo_keys = f"{property_obj.photo_keys},{photo_key}"
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Photo already exists for this property"
                )
        else:
            # If this is the first photo
            property_obj.photo_keys = photo_key
        
        # Save to database
        db.commit()
        
        return {
            "message": "Photo added successfully", 
            "photo_key": photo_key,
            "total_photos": len(property_obj.photo_keys.split(','))
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        db.rollback()
        print(f"Error adding photo to property {property_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add photo to property"
        )


@router.delete("/{property_id}/photos/{photo_key:path}")
async def remove_property_photo(
    property_id: int, 
    photo_key: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a photo from a property.
    
    This endpoint removes a photo key from the property's photo_keys field
    and also deletes the actual file from R2 storage.
    
    Args:
        property_id: ID of the property to remove the photo from
        photo_key: The R2 object key of the photo to remove (URL encoded)
        current_user: Authenticated user (must be property owner or admin)
        
    Returns:
        Success message with the removed photo key
        
    Raises:
        HTTPException 404: Property or photo not found
        HTTPException 403: Not authorized to update this property
    """
    
    # Find the property
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Permission check - only property owner or admin can remove photos
    if (property_obj.property_owner_id != current_user.id and 
        current_user.role.value != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this property"
        )
    
    # Check if property has photos
    if not property_obj.photo_keys:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This property has no photos"
        )
    
    try:
        # Split keys, remove the specified one, and rejoin
        keys = property_obj.photo_keys.split(',')
        if photo_key not in keys:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Photo not found in this property"
            )
            
        keys.remove(photo_key)
        property_obj.photo_keys = ','.join(keys) if keys else None
        db.commit()
            
        # Also delete from R2 storage
        try:
            success = r2_client.delete_object(photo_key)
            if not success:
                print(f"Warning: Failed to delete object {photo_key} from R2, but removed from database")
        except Exception as e:
            print(f"Failed to delete object {photo_key} from R2: {str(e)}")
            # Continue anyway since we've updated the database
            
        return {
            "message": "Photo removed successfully", 
            "photo_key": photo_key,
            "remaining_photos": len(keys)
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        db.rollback()
        print(f"Error removing photo from property {property_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove photo from property"
        )


@router.get("/{property_id}/photos")
async def list_property_photos(
    property_id: int,
    db: Session = Depends(get_db)
):
    """
    List all photo keys for a property.
    
    Returns the photo_keys for a property as a list for easier frontend handling.
    
    Args:
        property_id: ID of the property
        
    Returns:
        List of photo keys and total count
        
    Raises:
        HTTPException 404: Property not found
    """
    
    # Find the property
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Parse photo keys
    photo_keys = []
    if property_obj.photo_keys:
        photo_keys = property_obj.photo_keys.split(',')
    
    return {
        "property_id": property_id,
        "photo_keys": photo_keys,
        "total_photos": len(photo_keys)
    }
