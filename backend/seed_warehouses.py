from sqlmodel import Session, select
from app.core.database import engine
from app.models.inventory import Warehouse

def seed_warehouses():
    print("Seeding warehouses...")
    with Session(engine) as session:
        warehouses = [
            {"name": "Main Warehouse", "location": "Mumbai"},
            {"name": "Secondary Warehouse", "location": "Pune"},
        ]
        
        for w_data in warehouses:
            w = session.exec(select(Warehouse).where(Warehouse.name == w_data["name"])).first()
            if not w:
                print(f"Creating warehouse {w_data['name']}...")
                warehouse = Warehouse(**w_data)
                session.add(warehouse)
            else:
                print(f"Warehouse {w_data['name']} already exists.")
        
        session.commit()
    print("Warehouse seeding complete!")

if __name__ == "__main__":
    seed_warehouses()
