"""
Migration script to add category table.
Run this once to update your existing database schema.
"""
import sys
from sqlmodel import Session, text
from app.core.database import engine
from app.core.config import settings

def migrate_add_category():
    """Add category table"""
    print("🔵 Starting migration: Adding category table...")
    
    try:
        with Session(engine) as session:
            if "postgresql" in settings.DATABASE_URL.lower():
                # PostgreSQL
                
                # Create category table
                print("📝 Creating category table...")
                create_category_table = text("""
                    CREATE TABLE IF NOT EXISTS category (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR NOT NULL UNIQUE,
                        description VARCHAR
                    )
                """)
                session.exec(create_category_table)
                session.commit()
                
                # Create index on category name
                try:
                    create_index = text("CREATE INDEX IF NOT EXISTS ix_category_name ON category(name)")
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
            print("   - Category table created")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_category()

