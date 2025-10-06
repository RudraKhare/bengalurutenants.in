-- Add actual photo keys from uploaded photos to properties
-- First, check if there are any uploaded photos in the database

-- If you have actual uploaded photos, link them to properties:
-- UPDATE properties SET photo_keys = 'actual-r2-key-1.jpg,actual-r2-key-2.jpg' WHERE id = 1;

-- For testing purposes, you can add placeholder keys:
-- But note: These won't actually work unless the files exist in R2

-- Better approach: Check what photos are actually in R2 and use those keys
-- You can check the uploads table or R2 bucket directly

-- Example if you have real uploads:
-- UPDATE properties p
-- SET photo_keys = (
--   SELECT string_agg(photo_key, ',')
--   FROM property_photos pp
--   WHERE pp.property_id = p.id
-- )
-- WHERE id IN (SELECT DISTINCT property_id FROM property_photos);

-- For now, let's just verify current state:
SELECT 
  p.id,
  p.area,
  p.address,
  p.photo_keys,
  CASE 
    WHEN p.photo_keys IS NULL THEN 'NO PHOTOS'
    WHEN p.photo_keys = '' THEN 'EMPTY STRING'
    ELSE 'HAS PHOTOS'
  END as status
FROM properties p
ORDER BY p.id
LIMIT 10;
