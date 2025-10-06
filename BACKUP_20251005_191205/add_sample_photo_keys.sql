-- Migration to add sample photo_keys to existing properties
-- This will populate some properties with mock R2 object keys to test the photo system

-- Add sample photo keys to existing properties
UPDATE properties 
SET photo_keys = 'sample/property-1-main.jpg,sample/property-1-secondary.jpg'
WHERE id = 1 AND photo_keys IS NULL;

UPDATE properties 
SET photo_keys = 'sample/property-2-main.jpg'
WHERE id = 2 AND photo_keys IS NULL;

UPDATE properties 
SET photo_keys = 'sample/property-3-main.jpg,sample/property-3-secondary.jpg,sample/property-3-third.jpg'
WHERE id = 3 AND photo_keys IS NULL;

UPDATE properties 
SET photo_keys = 'sample/property-4-main.jpg'
WHERE id = 4 AND photo_keys IS NULL;

UPDATE properties 
SET photo_keys = 'sample/property-5-main.jpg,sample/property-5-secondary.jpg'
WHERE id = 5 AND photo_keys IS NULL;

-- Verify the changes
SELECT id, address, photo_keys FROM properties WHERE photo_keys IS NOT NULL ORDER BY id;
