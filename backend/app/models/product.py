from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    sku: str = Field(unique=True, index=True)
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    category: Optional[str] = None  # Keep for backward compatibility during migration
    uom: str # Unit of Measure
    current_stock: int = Field(default=0)
    min_stock_level: Optional[int] = Field(default=None)  # Minimum stock level for reordering alerts
