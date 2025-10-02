# 📧 Email Setup Guide for Magic Links

This guide shows you how to configure email sending for your Bengaluru Tenants application.

## 🎯 **Quick Setup Options**

### Option 1: **Gmail (Recommended for Testing)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
3. **Update your .env file**:
```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM=your-email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_STARTTLS=true
MAIL_SSL_TLS=false
MAIL_USE_CREDENTIALS=true
ENVIRONMENT=production  # Change this to send real emails
```

### Option 2: **SendGrid (Recommended for Production)**

1. **Create SendGrid Account**: [sendgrid.com](https://sendgrid.com)
2. **Get API Key**: Settings → API Keys → Create API Key
3. **Update your .env file**:
```env
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_FROM=noreply@yourdomain.com
MAIL_PORT=587
MAIL_SERVER=smtp.sendgrid.net
MAIL_STARTTLS=true
MAIL_SSL_TLS=false
MAIL_USE_CREDENTIALS=true
ENVIRONMENT=production
```

### Option 3: **Other SMTP Providers**

**Outlook/Hotmail**:
```env
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
```

**Yahoo**:
```env
MAIL_SERVER=smtp.mail.yahoo.com
MAIL_PORT=587
```

## 🔧 **Current Development Mode**

Currently, your app is in **development mode**, so magic links are saved to `outbox.log` instead of being emailed.

To switch to **email mode**:
1. Configure email settings above
2. Change `ENVIRONMENT=production` in your .env file
3. Restart your backend server

## 🧪 **Testing Email Setup**

After configuring email, test it:

```bash
# 1. Update .env with your email settings
# 2. Restart your backend server
python main.py

# 3. Test magic link request
curl -X POST http://localhost:8000/api/v1/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com"}'
```

## 🔒 **Security Best Practices**

1. **Never commit email passwords** to git
2. **Use app passwords** instead of account passwords
3. **Rotate credentials** regularly
4. **Use dedicated email** for your app (like noreply@yourdomain.com)
5. **Monitor email usage** to detect unusual activity

## 🚨 **Troubleshooting**

**"Authentication failed"**:
- Check username/password are correct
- Ensure 2FA is enabled for Gmail
- Use app password, not account password

**"Connection timeout"**:
- Check MAIL_PORT and MAIL_SERVER
- Verify firewall isn't blocking outbound SMTP

**"Emails not sending"**:
- Check logs for error messages
- Verify ENVIRONMENT=production
- Test SMTP settings with a simple email client

## 📊 **Email Providers Comparison**

| Provider | Cost | Reliability | Setup Difficulty |
|----------|------|-------------|------------------|
| Gmail | Free (limits apply) | High | Easy |
| SendGrid | Free tier available | Very High | Medium |
| AWS SES | Pay per email | Very High | Hard |
| Mailgun | Free tier available | High | Medium |

## 🎯 **Next Steps**

1. Choose an email provider
2. Configure credentials in .env
3. Set ENVIRONMENT=production
4. Test magic link emails
5. Monitor email delivery rates

Your magic link system will then send beautiful HTML emails with secure login links! 🎉
