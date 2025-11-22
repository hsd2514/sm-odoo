"""
Migration script to add vendor and customer support.
1. Creates vendor table
2. Adds vendor_id and customer_id columns to stockmove table
Run this once to update your existing database schema.
"""
import sys
from sqlmodel import Session, text
from app.core.database import engine
from app.core.config import settings

def migrate_add_vendor_customer():
    """Add vendor table and vendor_id/customer_id columns to stockmove"""
    print("🔵 Starting migration: Adding vendor support...")
    
    try:
        with Session(engine) as session:
            if "postgresql" in settings.DATABASE_URL.lower():
                # PostgreSQL
                
                # 1. Create vendor table
                print("📝 Creating vendor table...")
                create_vendor_table = text("""
                    CREATE TABLE IF NOT EXISTS vendor (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR NOT NULL,
                        email VARCHAR,
                        phone VARCHAR,
                        address VARCHAR,
                        contact_person VARCHAR,
                        notes VARCHAR
                    )
                """)
                session.exec(create_vendor_table)
                session.commit()
                
                # Create index on vendor name
                try:
                    create_index = text("CREATE INDEX IF NOT EXISTS ix_vendor_name ON vendor(name)")
                    session.exec(create_index)
                    session.commit()
                except Exception as e:
                    print(f"⚠️  Could not create index (may already exist): {e}")
                
                # 2. Add vendor_id column to stockmove
                print("📝 Adding vendor_id column to stockmove...")
                check_vendor_id = text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='stockmove' AND column_name='vendor_id'
                """)
                result = session.exec(check_vendor_id).first()
                
                if not result:
                    alter_vendor_id = text("ALTER TABLE stockmove ADD COLUMN vendor_id INTEGER")
                    session.exec(alter_vendor_id)
                    session.commit()
                    print("✅ Added vendor_id column")
                else:
                    print("✅ Column vendor_id already exists")
                
                # 3. Add customer_id column to stockmove
                print("📝 Adding customer_id column to stockmove...")
                check_customer_id = text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='stockmove' AND column_name='customer_id'
                """)
                result = session.exec(check_customer_id).first()
                
                if not result:
                    alter_customer_id = text("ALTER TABLE stockmove ADD COLUMN customer_id INTEGER")
                    session.exec(alter_customer_id)
                    session.commit()
                    print("✅ Added customer_id column")
                else:
                    print("✅ Column customer_id already exists")
                
            else:
                # SQLite
                print("⚠️  SQLite detected. SQLite doesn't support ALTER TABLE ADD COLUMN easily.")
                print("   You may need to recreate the table or use a migration tool.")
                print("   For development, consider dropping and recreating the database.")
                return
            
            print("✅ Migration completed successfully!")
            print("   - Vendor table created")
            print("   - vendor_id column added to stockmove")
            print("   - customer_id column added to stockmove")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("\nYou may need to run this manually:")
        if "postgresql" in settings.DATABASE_URL.lower():
            print("""
            -- Create vendor table
            CREATE TABLE IF NOT EXISTS vendor (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                email VARCHAR,
                phone VARCHAR,
                address VARCHAR,
                contact_person VARCHAR,
                notes VARCHAR
            );
            CREATE INDEX IF NOT EXISTS ix_vendor_name ON vendor(name);
            
            -- Add columns to stockmove
            ALTER TABLE stockmove ADD COLUMN vendor_id INTEGER;
            ALTER TABLE stockmove ADD COLUMN customer_id INTEGER;
            """)
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_vendor_customer()

