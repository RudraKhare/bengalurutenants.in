"""
API endpoints for city and locality management.
Provides CRUD operations and search functionality for cities and localities.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..db import get_db
from ..models import City, Locality

router = APIRouter(prefix="/api/cities", tags=["Cities"])

# Pydantic schemas for request/response
class LocalityResponse(BaseModel):
    id: int
    name: str
    city_id: int
    region: Optional[str]
    is_popular: bool
    
    class Config:
        from_attributes = True

class CityResponse(BaseModel):
    id: int
    name: str
    state: Optional[str]
    country: str
    lat: Optional[float]
    lng: Optional[float]
    
    class Config:
        from_attributes = True

class CityWithLocalitiesResponse(CityResponse):
    localities: List[LocalityResponse]
    
    class Config:
        from_attributes = True

# Endpoints
@router.get("", response_model=List[CityResponse])
def get_cities(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Get all cities.
    Returns a list of cities, optionally filtered by active status.
    """
    query = db.query(City)
    if active_only:
        query = query.filter(City.is_active == True)
    
    cities = query.order_by(City.name).all()
    return cities

@router.get("/{city_name}/localities", response_model=List[LocalityResponse])
def get_localities_by_city(
    city_name: str,
    search: Optional[str] = Query(None, description="Search term for fuzzy matching"),
    popular_only: bool = False,
    limit: Optional[int] = Query(None, description="Limit number of results"),
    db: Session = Depends(get_db)
):
    """
    Get all localities for a specific city.
    Supports search filtering and popularity filtering.
    """
    # Find the city
    city = db.query(City).filter(City.name == city_name, City.is_active == True).first()
    if not city:
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")
    
    # Build query for localities
    query = db.query(Locality).filter(
        Locality.city_id == city.id,
        Locality.is_active == True
    )
    
    # Apply search filter if provided (case-insensitive substring match)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(Locality.name.ilike(search_pattern))
    
    # Apply popular filter if requested
    if popular_only:
        query = query.filter(Locality.is_popular == True)
    
    # Order by popular first, then alphabetically
    query = query.order_by(Locality.is_popular.desc(), Locality.name)
    
    # Apply limit if provided
    if limit:
        query = query.limit(limit)
    
    localities = query.all()
    return localities

@router.get("/all-with-localities", response_model=List[CityWithLocalitiesResponse])
def get_all_cities_with_localities(
    db: Session = Depends(get_db)
):
    """
    Get all cities with their localities in a single request.
    Useful for initial data loading on the frontend.
    """
    cities = db.query(City).filter(City.is_active == True).order_by(City.name).all()
    return cities
