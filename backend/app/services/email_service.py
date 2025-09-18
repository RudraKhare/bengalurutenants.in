"""
Email service for sending magic links and other notifications.
Supports multiple email providers and development/production environments.
"""

import os
from typing import List, Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from fastapi_mail.errors import ConnectionErrors
from pydantic import EmailStr
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """
    Email service supporting both development and production modes.
    
    Development mode: Logs emails to file for testing
    Production mode: Sends actual emails via SMTP
    """
    
    def __init__(self):
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.debug = os.getenv("DEBUG", "true").lower() == "true"
        
        # Configure email settings
        self.mail_config = ConnectionConfig(
            MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
            MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
            MAIL_FROM=os.getenv("MAIL_FROM", "noreply@bengalurutenants.in"),
            MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
            MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
            MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "true").lower() == "true",
            MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "false").lower() == "true",
            USE_CREDENTIALS=os.getenv("MAIL_USE_CREDENTIALS", "true").lower() == "true",
            VALIDATE_CERTS=True
        )
        
        # Initialize FastMail only if credentials are configured
        self.fast_mail = None
        if self.mail_config.MAIL_USERNAME and self.mail_config.MAIL_PASSWORD:
            try:
                self.fast_mail = FastMail(self.mail_config)
                logger.info("Email service initialized with SMTP")
            except Exception as e:
                logger.warning(f"Failed to initialize email service: {e}")
        
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

    async def send_magic_link(self, email: EmailStr, magic_token: str) -> bool:
        """
        Send magic link email to user.
        
        Args:
            email: User's email address
            magic_token: JWT magic token for authentication
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        
        # Create magic link URL
        magic_link = f"{self.frontend_url}/auth?token={magic_token}"
        
        # Email content
        subject = "🔐 Your Magic Link - Bengaluru Tenants"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Magic Link - Bengaluru Tenants</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }}
                .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
                .footer {{ background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }}
                .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏠 Bengaluru Tenants</h1>
                <p>Your secure login link is ready!</p>
            </div>
            
            <div class="content">
                <h2>Welcome back!</h2>
                <p>Click the button below to securely sign in to your account:</p>
                
                <p style="text-align: center;">
                    <a href="{magic_link}" class="button">🔐 Sign In Securely</a>
                </p>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong>
                    <ul>
                        <li>This link expires in 10 minutes</li>
                        <li>Only use this link if you requested it</li>
                        <li>Never share this link with anyone</li>
                    </ul>
                </div>
                
                <p>If the button doesn't work, copy and paste this link:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                    {magic_link}
                </p>
                
                <p>If you didn't request this link, you can safely ignore this email.</p>
            </div>
            
            <div class="footer">
                <p>© 2025 Bengaluru Tenants - Helping renters make informed decisions</p>
                <p>Sent via SMTP2GO - Professional email delivery</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        🏠 Bengaluru Tenants - Magic Link
        
        Welcome back!
        
        Click this link to securely sign in to your account:
        {magic_link}
        
        ⚠️ Security Notice:
        - This link expires in 10 minutes
        - Only use this link if you requested it
        - Never share this link with anyone
        
        If you didn't request this link, you can safely ignore this email.
        
        © 2025 Bengaluru Tenants
        """

        # Try to send email
        if self.environment == "production" and self.fast_mail:
            return await self._send_smtp_email(email, subject, html_body, text_body)
        else:
            return await self._log_email_to_file(email, subject, text_body, magic_link)

    async def _send_smtp_email(self, email: EmailStr, subject: str, html_body: str, text_body: str) -> bool:
        """Send email via SMTP (production mode)."""
        try:
            message = MessageSchema(
                subject=subject,
                recipients=[email],
                body=html_body,
                subtype=MessageType.html,
                reply_to=["admin@bengalurutenants.social"]  # Replies will forward to your Gmail
            )
            
            await self.fast_mail.send_message(message)
            logger.info(f"Magic link email sent to {email}")
            return True
            
        except ConnectionErrors as e:
            logger.error(f"SMTP connection error: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {e}")
            return False

    async def _log_email_to_file(self, email: EmailStr, subject: str, text_body: str, magic_link: str) -> bool:
        """Log email to file (development mode)."""
        try:
            log_entry = f"""
{'='*80}
📧 EMAIL LOG - {subject}
📨 To: {email}
🕐 Time: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
🔗 Magic Link: {magic_link}
{'='*80}

{text_body}

{'='*80}

"""
            
            # Append to outbox.log file
            with open("outbox.log", "a", encoding="utf-8") as f:
                f.write(log_entry)
            
            logger.info(f"Magic link logged to outbox.log for {email}")
            logger.info(f"🔗 Magic Link: {magic_link}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to log email: {e}")
            return False

# Create global email service instance
email_service = EmailService()

async def send_magic_link_email(email: EmailStr, magic_token: str) -> bool:
    """
    Convenience function to send magic link email.
    
    Args:
        email: User's email address  
        magic_token: JWT magic token
        
    Returns:
        bool: True if sent successfully
    """
    return await email_service.send_magic_link(email, magic_token)
