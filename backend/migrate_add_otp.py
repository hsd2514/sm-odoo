"""
Migration script to add OTP table for password reset functionality.
"""
import sys
from sqlmodel import Session, text
from app.core.database import engine
from app.core.config import settings

def migrate_add_otp():
    """Add OTP table"""
    print("🔵 Starting migration: Adding OTP table...")
    
    try:
        with Session(engine) as session:
            if "postgresql" in settings.DATABASE_URL.lower():
                # Check if table already exists
                check_table = text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_name='otp'
                """)
                result = session.exec(check_table).first()
                
                if result:
                    print("⚠️  OTP table already exists. Skipping...")
                    return
                
                # Create OTP table
                print("📝 Creating OTP table...")
                create_table = text("""
                    CREATE TABLE otp (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR NOT NULL,
                        otp_code VARCHAR NOT NULL,
                        expires_at TIMESTAMP NOT NULL,
                        used BOOLEAN NOT NULL DEFAULT FALSE,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                session.exec(create_table)
                session.commit()
                
                # Create indexes
                try:
                    create_email_index = text("CREATE INDEX IF NOT EXISTS ix_otp_email ON otp(email)")
                    session.exec(create_email_index)
                    session.commit()
                except Exception as e:
                    print(f"⚠️  Could not create email index (may already exist): {e}")
                
                print("✅ Migration completed successfully!")
                print("   - OTP table created")
                print("   - Indexes created")
                
            else:
                # SQLite
                print("⚠️  SQLite detected. SQLite doesn't support all features easily.")
                print("   Consider using PostgreSQL for production.")
                return
                
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_otp()

