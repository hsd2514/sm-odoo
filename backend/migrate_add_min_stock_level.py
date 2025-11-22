"""
Migration script to add min_stock_level column to product table.
"""
import sys
from sqlmodel import Session, text
from app.core.database import engine
from app.core.config import settings

def migrate_add_min_stock_level():
    """Add min_stock_level column to product table"""
    print("🔵 Starting migration: Adding min_stock_level column to product table...")
    
    try:
        with Session(engine) as session:
            if "postgresql" in settings.DATABASE_URL.lower():
                # Check if column already exists
                check_column = text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='product' AND column_name='min_stock_level'
                """)
                result = session.exec(check_column).first()
                
                if result:
                    print("⚠️  min_stock_level column already exists. Skipping...")
                    return
                
                # Add min_stock_level column
                print("📝 Adding min_stock_level column to product table...")
                add_column = text("""
                    ALTER TABLE product 
                    ADD COLUMN min_stock_level INTEGER
                """)
                session.exec(add_column)
                session.commit()
                
                print("✅ Migration completed successfully!")
                print("   - min_stock_level column added to product table")
                
            else:
                # SQLite
                print("⚠️  SQLite detected. SQLite doesn't support ALTER TABLE ADD COLUMN easily.")
                print("   You may need to recreate the table or use a migration tool.")
                return
                
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_min_stock_level()

