from pydantic_settings import BaseSettings
from pathlib import Path
import os

# Get the backend directory (parent of app directory)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "StockMaster"
    DATABASE_URL: str = "postgresql://postgres:password@localhost/stockmaster" # Update with your credentials
    SECRET_KEY: str = "CHANGE_THIS_IN_PROD_SECRET_KEY_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email/SMTP Settings for OTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""  # Your Gmail address
    SMTP_PASSWORD: str = ""  # Your Gmail App Password (not regular password)
    SMTP_FROM_EMAIL: str = ""  # Your Gmail address

    class Config:
        env_file = str(ENV_FILE) if ENV_FILE.exists() else ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

settings = Settings()

# Debug: Print SMTP config status (without showing password)
if settings.SMTP_USER and settings.SMTP_PASSWORD:
    print(f"✅ SMTP configured for: {settings.SMTP_USER}")
else:
    print("⚠️  SMTP not configured - SMTP_USER or SMTP_PASSWORD is empty")
    print(f"   Looking for .env at: {ENV_FILE}")
    print(f"   .env exists: {ENV_FILE.exists()}")
