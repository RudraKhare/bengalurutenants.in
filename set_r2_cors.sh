#!/bin/bash
# Script to set R2 CORS policy via Cloudflare API
# You'll need to get your API token from Cloudflare dashboard

# Replace these with your values
ACCOUNT_ID="your-account-id"
BUCKET_NAME="tenant-review-photos"
API_TOKEN="your-api-token"

curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/r2/buckets/$BUCKET_NAME/cors" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "corsRules": [
      {
        "allowedOrigins": ["http://localhost:3000"],
        "allowedMethods": ["GET", "PUT", "HEAD", "POST"],
        "allowedHeaders": ["*"],
        "exposeHeaders": ["ETag"],
        "maxAgeSeconds": 86400
      }
    ]
  }'
