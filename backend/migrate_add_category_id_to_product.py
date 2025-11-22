"""
Migration script to add category_id column to product table.
Run this BEFORE migrate_product_category.py
"""
import sys
from sqlmodel import Session, text
from app.core.database import engine
from app.core.config import settings

def migrate_add_category_id():
    """Add category_id column to product table"""
    print("🔵 Starting migration: Adding category_id column to product table...")
    
    try:
        with Session(engine) as session:
            if "postgresql" in settings.DATABASE_URL.lower():
                # PostgreSQL
                
                # Check if column already exists
                check_column = text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='product' AND column_name='category_id'
                """)
                result = session.exec(check_column).first()
                
                if result:
                    print("⚠️  category_id column already exists. Skipping...")
                    return
                
                # Add category_id column
                print("📝 Adding category_id column to product table...")
                add_column = text("""
                    ALTER TABLE product 
                    ADD COLUMN category_id INTEGER
                """)
                session.exec(add_column)
                session.commit()
                
                # Add foreign key constraint
                print("📝 Adding foreign key constraint...")
                try:
                    add_fk = text("""
                        ALTER TABLE product 
                        ADD CONSTRAINT fk_product_category 
                        FOREIGN KEY (category_id) REFERENCES category(id)
                    """)
                    session.exec(add_fk)
                    session.commit()
                except Exception as e:
                    print(f"⚠️  Could not add foreign key (may already exist or category table missing): {e}")
                
                # Create index
                try:
                    create_index = text("CREATE INDEX IF NOT EXISTS ix_product_category_id ON product(category_id)")
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
            print("   - category_id column added to product table")
            print("   - Foreign key constraint added")
            print("   - Index created")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_category_id()

