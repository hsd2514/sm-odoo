"""
Migration script to make category column nullable in product table.
This allows products to have category_id without requiring the old category string.
"""
import sys
from sqlmodel import Session, text
from app.core.database import engine
from app.core.config import settings

def migrate_make_category_nullable():
    """Make category column nullable"""
    print("🔵 Starting migration: Making category column nullable...")
    
    try:
        with Session(engine) as session:
            if "postgresql" in settings.DATABASE_URL.lower():
                # Check current constraint
                check_constraint = text("""
                    SELECT is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name='product' AND column_name='category'
                """)
                result = session.exec(check_constraint).first()
                
                if result and result[0] == 'YES':
                    print("⚠️  category column is already nullable. Skipping...")
                    return
                
                # Make category column nullable
                print("📝 Making category column nullable...")
                alter_column = text("""
                    ALTER TABLE product 
                    ALTER COLUMN category DROP NOT NULL
                """)
                session.exec(alter_column)
                session.commit()
                
                print("✅ Migration completed successfully!")
                print("   - category column is now nullable")
                
            else:
                # SQLite
                print("⚠️  SQLite detected. SQLite doesn't support ALTER TABLE easily.")
                print("   Consider recreating the table or using a dedicated SQLite migration tool.")
                return
                
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    migrate_make_category_nullable()

