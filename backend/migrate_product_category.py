"""
Migration script to migrate products from string category to category_id foreign key.
Run this AFTER migrate_add_category_id_to_product.py
"""
import sys
from sqlmodel import Session, select, text
from app.core.database import engine
from app.core.config import settings
from app.models.category import Category

def migrate_product_category():
    """Migrate products from category string to category_id"""
    print("🔵 Starting migration: Converting product categories to category_id...")
    
    try:
        with Session(engine) as session:
            # Get all products using raw SQL (to avoid SQLModel issues)
            result = session.exec(text("SELECT id, category FROM product WHERE category IS NOT NULL AND category != ''"))
            products_data = result.all()
            
            print(f"📦 Found {len(products_data)} products to migrate")
            
            # Get all categories
            categories = session.exec(select(Category)).all()
            category_map = {cat.name.lower(): cat.id for cat in categories}
            print(f"📁 Found {len(categories)} categories")
            
            migrated = 0
            created = 0
            
            for row in products_data:
                product_id = row[0]
                category_name = row[1].strip() if row[1] else None
                
                if not category_name:
                    continue
                
                # Try to find existing category (case-insensitive)
                category_id = category_map.get(category_name.lower())
                
                if not category_id:
                    # Create new category
                    print(f"  ➕ Creating category: {category_name}")
                    new_category = Category(name=category_name)
                    session.add(new_category)
                    session.flush()  # Get the ID without committing
                    session.refresh(new_category)
                    category_id = new_category.id
                    category_map[category_name.lower()] = category_id
                    created += 1
                
                # Update product using raw SQL
                update_query = text("""
                    UPDATE product 
                    SET category_id = :category_id 
                    WHERE id = :product_id
                """)
                session.exec(update_query.params(category_id=category_id, product_id=product_id))
                migrated += 1
            
            session.commit()
            
            print("✅ Migration completed successfully!")
            print(f"   - Migrated {migrated} products")
            print(f"   - Created {created} new categories")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    migrate_product_category()
