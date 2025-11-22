"""
Migration script to add 'reference' column to stockmove table.
Run this once to update your existing database schema.
"""
import sys
from sqlmodel import Session, text
from app.core.database import engine
from app.core.config import settings

def migrate_add_reference():
    """Add reference column to stockmove table if it doesn't exist"""
    print("🔵 Starting migration: Adding 'reference' column to stockmove table...")
    
    try:
        with Session(engine) as session:
            # Check if column already exists
            if "postgresql" in settings.DATABASE_URL.lower():
                # PostgreSQL
                check_query = text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='stockmove' AND column_name='reference'
                """)
            else:
                # SQLite
                check_query = text("""
                    SELECT name FROM pragma_table_info('stockmove') 
                    WHERE name='reference'
                """)
            
            result = session.exec(check_query).first()
            
            if result:
                print("✅ Column 'reference' already exists. No migration needed.")
                return
            
            # Add the column
            print("📝 Adding 'reference' column...")
            
            if "postgresql" in settings.DATABASE_URL.lower():
                # PostgreSQL: Add nullable column
                alter_query = text("""
                    ALTER TABLE stockmove 
                    ADD COLUMN reference VARCHAR(50)
                """)
                # Create index
                index_query = text("""
                    CREATE INDEX IF NOT EXISTS ix_stockmove_reference 
                    ON stockmove(reference)
                """)
            else:
                # SQLite: SQLite doesn't support adding columns easily
                # This would require recreating the table
                print("⚠️  SQLite detected. SQLite doesn't support ALTER TABLE ADD COLUMN easily.")
                print("   You may need to recreate the table or use a migration tool.")
                print("   For development, consider dropping and recreating the database.")
                return
            
            session.exec(alter_query)
            session.commit()
            
            # Create index
            try:
                session.exec(index_query)
                session.commit()
            except Exception as e:
                print(f"⚠️  Could not create index (may already exist): {e}")
            
            print("✅ Migration completed successfully!")
            print("   Column 'reference' has been added to stockmove table.")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("\nYou may need to run this manually:")
        if "postgresql" in settings.DATABASE_URL.lower():
            print("   ALTER TABLE stockmove ADD COLUMN reference VARCHAR(50);")
            print("   CREATE INDEX ix_stockmove_reference ON stockmove(reference);")
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_reference()

