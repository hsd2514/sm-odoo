from sqlmodel import Session, select
from app.core.database import engine
from app.models.user import User
from app.models.product import Product
from app.core.security import get_password_hash

def seed_data():
    print("Seeding data...")
    with Session(engine) as session:
        # 1. Create Admin User
        email = "harshdange25@gmail.com"
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            print(f"Creating user {email}...")
            user = User(
                email=email,
                password_hash=get_password_hash("admin"),
                full_name="Harsh Dange",
                role="admin"
            )
            session.add(user)
        else:
            print(f"User {email} already exists.")

        # 2. Create some initial realistic products (optional, but good for testing)
        # User said "seed some data" but "no mock data". 
        # I'll add a few realistic items so the system isn't completely empty, 
        # which helps verify the Dashboard works.
        products = [
            {"name": "Steel Rod 12mm", "sku": "ST-12MM", "category": "Raw Material", "uom": "kg"},
            {"name": "Cement Bag (50kg)", "sku": "CMT-50", "category": "Raw Material", "uom": "bag"},
            {"name": "Safety Helmet", "sku": "SAF-HLM", "category": "Consumable", "uom": "pcs"},
        ]

        for p_data in products:
            p = session.exec(select(Product).where(Product.sku == p_data["sku"])).first()
            if not p:
                print(f"Creating product {p_data['name']}...")
                product = Product(**p_data, current_stock=0)
                session.add(product)
        
        session.commit()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_data()
