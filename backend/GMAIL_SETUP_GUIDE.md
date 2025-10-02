"""
🔐 Gmail App Password Setup Guide
===============================================

To send real emails instead of using the development outbox.log file,
you need to get a Gmail App Password.

STEPS TO GET GMAIL APP PASSWORD:
===============================================

1. 🌐 GO TO GOOGLE ACCOUNT SETTINGS
   Visit: https://myaccount.google.com/

2. 🔒 ENABLE 2-STEP VERIFICATION
   - Click "Security" in the left sidebar
   - Find "2-Step Verification" 
   - Enable it if not already enabled

3. 🎫 GENERATE APP PASSWORD
   - Still in Security section
   - Look for "App passwords" (appears after 2-step verification is on)
   - Click "App passwords"
   - Select "Mail" from the dropdown
   - Click "Generate"

4. 📋 COPY THE 16-CHARACTER PASSWORD
   - Google will show a 16-character password like: "abcd efgh ijkl mnop"
   - Copy this password (without spaces)

5. ⚙️ UPDATE YOUR .env FILE
   Replace this line in your .env file:
   MAIL_PASSWORD=your-gmail-app-password-here
   
   With:
   MAIL_PASSWORD=abcdefghijklmnop  # Your actual app password

6. 🔄 RESTART YOUR SERVER
   Stop your backend server (Ctrl+C) and restart with:
   python main.py

TESTING:
===============================================

After setup, test with:

1. Request magic link:
   POST http://localhost:8000/api/v1/auth/magic-link
   Body: {"email": "rudrakharexxx@gmail.com"}

2. Check your Gmail inbox for the magic link email!

TROUBLESHOOTING:
===============================================

❌ If emails still don't arrive:
- Make sure 2-step verification is enabled
- Make sure the app password is correct (no spaces)
- Check spam folder
- Try a different email address

✅ For development, outbox.log method works perfectly fine!

The system will automatically:
- Send real emails if Gmail credentials are configured
- Fall back to outbox.log file if credentials are missing/wrong
"""
