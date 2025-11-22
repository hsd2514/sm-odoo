from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Warehouse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    location: str

class StockMove(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    reference: Optional[str] = Field(default=None, index=True) # Auto-generated: AW/YYYY/0001
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    source_location: Optional[str] = None # e.g., "Vendor", "Warehouse A"
    dest_location: Optional[str] = None # e.g., "Warehouse A", "Customer"
    source_warehouse_id: Optional[int] = Field(default=None, foreign_key="warehouse.id")
    dest_warehouse_id: Optional[int] = Field(default=None, foreign_key="warehouse.id")
    vendor_id: Optional[int] = Field(default=None) # For Receipts (IN) - foreign_key="vendor.id" after migration
    customer_id: Optional[int] = Field(default=None) # For Deliveries (OUT) - foreign_key="customer.id" after migration
    move_type: str # IN, OUT, INT, ADJ
    status: str = "draft" # draft, waiting, ready, done, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductStock(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    warehouse_id: int = Field(foreign_key="warehouse.id")
    quantity: int = Field(default=0)
