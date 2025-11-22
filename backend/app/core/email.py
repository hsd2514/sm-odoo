import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def send_otp_email(email: str, otp_code: str) -> bool:
    """Send OTP code via email using Gmail SMTP"""
    try:
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.error("SMTP credentials not configured")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
        msg['To'] = email
        msg['Subject'] = "StockMaster - Password Reset OTP"
        
        # Email body
        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; border: 4px solid #000; padding: 30px; box-shadow: 8px 8px 0px #000;">
              <h1 style="font-size: 2rem; font-weight: 900; text-transform: uppercase; margin-bottom: 20px;">StockMaster IMS</h1>
              <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 20px;">Password Reset Request</h2>
              <p style="font-size: 1.1rem; margin-bottom: 20px;">
                You have requested to reset your password. Use the following OTP code:
              </p>
              <div style="background: #f5f5f5; border: 4px solid #000; padding: 20px; text-align: center; margin: 30px 0;">
                <div style="font-size: 2.5rem; font-weight: 900; letter-spacing: 10px; color: #000;">
                  {otp_code}
                </div>
              </div>
              <p style="font-size: 0.9rem; color: #666; margin-top: 20px;">
                This code will expire in 10 minutes. If you didn't request this, please ignore this email.
              </p>
            </div>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"OTP email sent to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")
        return False

