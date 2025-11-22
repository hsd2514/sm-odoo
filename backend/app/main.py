from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import create_db_and_tables
from app.api import auth, products, operations, warehouses, reports, vendors, customers

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="StockMaster Inventory Management System API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(operations.router, prefix="/operations", tags=["operations"])
app.include_router(warehouses.router, prefix="/warehouses", tags=["warehouses"])
app.include_router(vendors.router, prefix="/vendors", tags=["vendors"])
app.include_router(customers.router, prefix="/customers", tags=["customers"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])

@app.get("/")
def read_root():
    return {"message": "Welcome to StockMaster API"}
