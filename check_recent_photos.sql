-- Check if the photo was properly transferred to property
SELECT 
  p.id,
  p.address,
  p.photo_keys,
  r.id as review_id,
  r.created_at
FROM properties p
JOIN reviews r ON p.id = r.property_id
WHERE r.created_at > NOW() - INTERVAL '1 hour'
ORDER BY r.created_at DESC
LIMIT 5;
