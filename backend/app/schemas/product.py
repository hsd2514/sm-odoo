from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    sku: str
    category_id: Optional[int] = None
    category: Optional[str] = None  # For backward compatibility
    uom: str
    min_stock_level: Optional[int] = None

class ProductCreate(ProductBase):
    initial_stock: int = 0

class ProductRead(ProductBase):
    id: int
    current_stock: int
    category_name: Optional[str] = None  # Include category name in response

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    category: Optional[str] = None  # For backward compatibility
    uom: Optional[str] = None
    min_stock_level: Optional[int] = None
