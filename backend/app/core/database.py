from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# Import all models to ensure they're registered with SQLModel
from app.models import user, product, inventory, vendor, customer, category

engine = create_engine(settings.DATABASE_URL, echo=True)  # SQL logging enabled

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
