"""
Script to test R2 photo upload and verify the complete photo pipeline
This will upload a test image to R2 and update a property to use it
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.r2_client import r2_client
from app.db import SessionLocal
from app.models import Property
import requests
from io import BytesIO

def test_r2_pipeline():
    """Test the complete R2 photo pipeline"""
    print("🧪 TESTING R2 PHOTO PIPELINE")
    print("=" * 40)
    
    try:
        # 1. Download a test image
        print("📸 Downloading test image...")
        response = requests.get("https://picsum.photos/800/600")
        if response.status_code == 200:
            image_data = BytesIO(response.content)
            print("✅ Test image downloaded")
        else:
            print("❌ Failed to download test image")
            return
        
        # 2. Generate R2 upload URL
        print("🔗 Generating R2 upload URL...")
        test_key = "test/property-1-real.jpg"
        upload_data = r2_client.generate_presigned_upload_url(
            object_key=test_key,
            content_type="image/jpeg",
            expires_in=3600
        )
        print(f"✅ Upload URL generated: {test_key}")
        
        # 3. Upload to R2
        print("☁️ Uploading to R2...")
        upload_response = requests.put(
            upload_data['upload_url'],
            data=image_data.getvalue(),
            headers={'Content-Type': 'image/jpeg'}
        )
        
        if upload_response.status_code == 200:
            print("✅ Image uploaded to R2 successfully")
        else:
            print(f"❌ Upload failed: {upload_response.status_code}")
            return
        
        # 4. Update property to use this photo
        print("🗄️ Updating property 1 with real photo key...")
        db = SessionLocal()
        try:
            property_obj = db.query(Property).filter(Property.id == 1).first()
            if property_obj:
                property_obj.photo_keys = test_key
                db.commit()
                print("✅ Property 1 updated with real photo key")
            else:
                print("❌ Property 1 not found")
        finally:
            db.close()
        
        # 5. Test view URL generation
        print("🔍 Testing view URL generation...")
        view_url = r2_client.generate_presigned_view_url(test_key)
        print(f"✅ View URL generated: {view_url[:50]}...")
        
        print("\n🎉 PIPELINE TEST COMPLETE!")
        print("Now refresh the property search page to see the real photo!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_r2_pipeline()
