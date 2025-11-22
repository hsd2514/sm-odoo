from sqlmodel import Session, select
from app.core.database import engine
from app.models.inventory import ProductStock, Warehouse
from app.models.product import Product

def seed_initial_stock():
    print("Seeding initial stock in warehouses...")
    with Session(engine) as session:
        # Get warehouses
        main_wh = session.exec(select(Warehouse).where(Warehouse.name == "Main Warehouse")).first()
        
        if not main_wh:
            print("Main Warehouse not found. Run seed_warehouses.py first.")
            return
        
        # Get products
        products = session.exec(select(Product)).all()
        
        for product in products:
            # Check if stock already exists
            existing = session.exec(
                select(ProductStock).where(
                    ProductStock.product_id == product.id,
                    ProductStock.warehouse_id == main_wh.id
                )
            ).first()
            
            if not existing:
                print(f"Creating stock for {product.name} in Main Warehouse...")
                stock = ProductStock(
                    product_id=product.id,
                    warehouse_id=main_wh.id,
                    quantity=product.current_stock  # Use current stock as initial
                )
                session.add(stock)
        
        session.commit()
    print("Stock seeding complete!")

if __name__ == "__main__":
    seed_initial_stock()
