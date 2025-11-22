"""
Migration script to add customer table.
Run this once to update your existing database schema.
"""
import sys
from sqlmodel import Session, text
from app.core.database import engine
from app.core.config import settings

def migrate_add_customer():
    """Add customer table"""
    print("🔵 Starting migration: Adding customer table...")
    
    try:
        with Session(engine) as session:
            if "postgresql" in settings.DATABASE_URL.lower():
                # PostgreSQL
                
                # Create customer table
                print("📝 Creating customer table...")
                create_customer_table = text("""
                    CREATE TABLE IF NOT EXISTS customer (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR NOT NULL,
                        email VARCHAR,
                        phone VARCHAR,
                        address VARCHAR,
                        contact_person VARCHAR,
                        notes VARCHAR
                    )
                """)
                session.exec(create_customer_table)
                session.commit()
                
                # Create index on customer name
                try:
                    create_index = text("CREATE INDEX IF NOT EXISTS ix_customer_name ON customer(name)")
                    session.exec(create_index)
                    session.commit()
                except Exception as e:
                    print(f"⚠️  Could not create index (may already exist): {e}")
                
            else:
                # SQLite
                print("⚠️  SQLite detected. SQLite doesn't support ALTER TABLE ADD COLUMN easily.")
                print("   You may need to recreate the table or use a migration tool.")
                return
            
            print("✅ Migration completed successfully!")
            print("   - Customer table created")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("\nYou may need to run this manually:")
        if "postgresql" in settings.DATABASE_URL.lower():
            print("""
            -- Create customer table
            CREATE TABLE IF NOT EXISTS customer (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                email VARCHAR,
                phone VARCHAR,
                address VARCHAR,
                contact_person VARCHAR,
                notes VARCHAR
            );
            CREATE INDEX IF NOT EXISTS ix_customer_name ON customer(name);
            """)
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_customer()

