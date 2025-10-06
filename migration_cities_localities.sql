-- Migration script to add cities and localities tables
-- Run this in your Supabase SQL editor

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    lat FLOAT,
    lng FLOAT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create localities table
CREATE TABLE IF NOT EXISTS localities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    region VARCHAR(100),
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities(is_active);
CREATE INDEX IF NOT EXISTS idx_localities_city ON localities(city_id);
CREATE INDEX IF NOT EXISTS idx_localities_name ON localities(name);
CREATE INDEX IF NOT EXISTS idx_localities_city_name ON localities(city_id, name);
CREATE INDEX IF NOT EXISTS idx_localities_popular ON localities(is_popular);

-- Grant permissions (adjust role names as needed for your Supabase setup)
GRANT SELECT ON cities TO anon, authenticated;
GRANT SELECT ON localities TO anon, authenticated;

-- Note: After running this migration, run the seed script:
-- python -m backend.app.seed_cities
